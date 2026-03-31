import * as fs from 'fs';
import * as path from 'path';

export class BackupManager {
  private backupDir: string;

  constructor(projectRoot: string, backupDirName: string) {
    this.backupDir = path.join(projectRoot, backupDirName);
    this.ensureBackupDir();
    this.ensureGitignore(projectRoot, backupDirName);
  }

  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private ensureGitignore(projectRoot: string, backupDirName: string): void {
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (!fs.existsSync(gitignorePath)) return;

    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (!content.includes(backupDirName)) {
      fs.appendFileSync(gitignorePath, `\n# Vibedit backups\n${backupDirName}/\n`);
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
