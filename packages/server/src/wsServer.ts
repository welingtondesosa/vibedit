import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { FileWriter } from './fileWriter.js';
import { readTailwindTokens } from './tailwindReader.js';
import { getAiSuggestions, checkOllamaAvailable, listOllamaModels } from './aiService.js';
import type { ServerMessage, ServerResponse, VibeditConfig, AiChange } from './types.js';

export class VibeditServer {
  private wss: WebSocketServer;
  private fileWriter: FileWriter;
  private twTokens: Record<string, string>;

  constructor(config: VibeditConfig) {
    this.fileWriter = new FileWriter(config);
    this.twTokens = readTailwindTokens(config.projectRoot);

    this.wss = new WebSocketServer({
      port: config.port,
      host: '127.0.0.1', // localhost only — security requirement
    });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('listening', () => {
      console.log(`[Vibedit] Server running on ws://127.0.0.1:${config.port}`);
    });

    this.wss.on('error', (err: Error) => {
      console.error('[Vibedit] Server error:', err.message);
    });
  }

  private handleConnection(ws: WebSocket, _req: IncomingMessage): void {
    console.log('[Vibedit] Client connected');

    ws.on('message', async (data: Buffer) => {
      let msg: ServerMessage;

      try {
        msg = JSON.parse(data.toString()) as ServerMessage;
      } catch {
        ws.send(
          JSON.stringify({ id: 'unknown', success: false, error: 'Invalid JSON' } satisfies ServerResponse)
        );
        return;
      }

      const response: ServerResponse = { id: msg.id, success: false };

      try {
        if (msg.change.type === 'ai') {
          const aiChange = msg.change as AiChange;
          const suggestions = await getAiSuggestions({
            prompt: aiChange.prompt,
            currentStyles: aiChange.currentStyles,
            elementTag: aiChange.elementTag,
            componentName: aiChange.componentName,
          });
          response.success = true;
          response.data = { aiSuggestions: suggestions };
          console.log(`[Vibedit] AI returned ${suggestions.length} suggestions`);
        } else {
          const result = await this.fileWriter.applyChange(msg.change);
          response.success = true;
          if (result) response.data = result;
          console.log(`[Vibedit] ${msg.change.type} change applied to ${('file' in msg.change ? msg.change.file : 'file')}`);
        }
      } catch (err) {
        response.error = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[Vibedit] Error applying change:`, response.error);
      }

      ws.send(JSON.stringify(response));
    });

    ws.on('close', () => {
      console.log('[Vibedit] Client disconnected');
    });

    ws.on('error', (err: Error) => {
      console.error('[Vibedit] WebSocket error:', err.message);
    });

    // Send ready signal + design tokens
    ws.send(JSON.stringify({ type: 'ready', version: '0.1.0' }));
    ws.send(JSON.stringify({ type: 'config', twTokens: this.twTokens }));

    // Check Ollama availability and send AI config
    checkOllamaAvailable().then(async (available) => {
      const models = available ? await listOllamaModels() : [];
      ws.send(JSON.stringify({ type: 'ai-config', available, models }));
    });
  }

  close(): void {
    this.wss.close();
  }
}
