import http from 'http';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const DEFAULT_MODEL = 'llama3';
const TIMEOUT_MS = 30_000;

export interface AiRequest {
  prompt: string;
  currentStyles: Record<string, string>;
  elementTag: string;
  componentName?: string;
}

export interface AiSuggestion {
  property: string;
  value: string;
}

const SYSTEM_PROMPT = `You are a CSS expert assistant inside a visual editor called Vibedit.
The user selects an HTML element and asks you to change its appearance.
You receive the element's current CSS styles and a natural language instruction.

RULES:
- Respond ONLY with a JSON object: { "changes": [ { "property": "css-property", "value": "css-value" }, ... ] }
- Use standard CSS property names in kebab-case (e.g. "border-radius", not "borderRadius")
- Only include properties that need to change
- Use concrete CSS values (px, rem, hex colors, etc.), never "inherit" or "initial"
- Keep changes minimal and focused on what the user asked
- Do NOT include any explanation, markdown, or text outside the JSON

Example input: "make it rounder and add some shadow"
Example output: { "changes": [ { "property": "border-radius", "value": "12px" }, { "property": "box-shadow", "value": "0 4px 12px rgba(0,0,0,0.1)" } ] }`;

function buildPrompt(req: AiRequest): string {
  const stylesStr = Object.entries(req.currentStyles)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');

  return `Element: <${req.elementTag}>${req.componentName ? ` (React component: ${req.componentName})` : ''}
Current styles:
${stylesStr}

User instruction: "${req.prompt}"`;
}

function callOllama(model: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      stream: false,
      format: 'json',
    });

    const url = new URL(OLLAMA_URL);
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: TIMEOUT_MS,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Ollama returned status ${res.statusCode}: ${data}`));
          return;
        }
        resolve(data);
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Ollama request timed out (30s)')); });
    req.on('error', (err: Error) => {
      if (err.message.includes('ECONNREFUSED')) {
        reject(new Error('Ollama is not running. Install it from ollama.com and run: ollama pull llama3'));
      } else {
        reject(err);
      }
    });

    req.write(body);
    req.end();
  });
}

function parseResponse(raw: string): AiSuggestion[] {
  const outer = JSON.parse(raw) as { response?: string };
  const text = outer.response ?? raw;

  let parsed: { changes?: Array<{ property: string; value: string }> };
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*"changes"[\s\S]*\}/);
    if (!match) throw new Error('AI response did not contain valid JSON');
    parsed = JSON.parse(match[0]);
  }

  if (!parsed.changes || !Array.isArray(parsed.changes)) {
    throw new Error('AI response missing "changes" array');
  }

  return parsed.changes
    .filter((c) => c.property && c.value && typeof c.property === 'string' && typeof c.value === 'string')
    .map((c) => ({ property: c.property, value: c.value }));
}

export async function getAiSuggestions(req: AiRequest, model?: string): Promise<AiSuggestion[]> {
  const prompt = buildPrompt(req);
  const raw = await callOllama(model || DEFAULT_MODEL, prompt);
  return parseResponse(raw);
}

export async function checkOllamaAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:11434/api/tags', { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => { resolve(res.statusCode === 200); });
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

export async function listOllamaModels(): Promise<string[]> {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:11434/api/tags', { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data) as { models?: Array<{ name: string }> };
          resolve((parsed.models ?? []).map((m) => m.name));
        } catch {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.on('timeout', () => { req.destroy(); resolve([]); });
  });
}
