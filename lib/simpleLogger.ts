import fs from 'fs';
import path from 'path';

export function logError(message: string, error?: unknown) {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n${error instanceof Error ? error.stack : String(error)}\n\n`;

  fs.appendFileSync(path.join(logDir, 'error.log'), entry);
}