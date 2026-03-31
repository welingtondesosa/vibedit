import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

export class BackupManager {
  private backupDir: string;

  constructor(projectRoot: string, _backupDirName: string) {
    // Store backups in the system temp dir, namespaced by project.
    // This keeps the user's repo completely clean — no extra files, no .gitignore changes.
    const projectHash = crypto
      .createHash('sha1')
      .update(projectRoot)
      .digest('hex')
      .slice(0, 8);
    const projectName = path.basename(projectRoot);
    this.backupDir = path.join(os.tmpdir(), `vibedit-${projectName}-${projectHash}`);
    this.ensureBackupDir();
  }

  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  backup(filePath: string): void {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.basename(filePath);
    const timestamp = Date.now();
    const backupPath = path.join(this.backupDir, `${relativePath}.${timestamp}.bak`);

    fs.writeFileSync(backupPath, content, 'utf-8');

    // Keep only the last 10 backups per file
    this.pruneBackups(relativePath);
  }

  private pruneBackups(fileName: string): void {
    const files = fs
      .readdirSync(this.backupDir)
      .filter((f) => f.startsWith(fileName + '.'))
      .sort()
      .reverse();

    files.slice(10).forEach((f) => {
      fs.unlinkSync(path.join(this.backupDir, f));
    });
  }
}
