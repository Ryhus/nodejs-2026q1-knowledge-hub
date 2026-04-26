import { Injectable, Logger, LoggerService } from '@nestjs/common';
import fs from 'node:fs/promises';
import path from 'node:path';

type LogLevel = 'log' | 'error' | 'warn' | 'debug';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  log: 2,
  debug: 3,
};

export class AppLoggerService implements LoggerService {
  private readonly logFile = path.join(process.cwd(), 'app.log');

  private queue: string[] = [];

  private writing = false;

  log(message: any) {
    this.write('log', message);
  }

  error(message: any) {
    this.write('error', message);
  }

  warn(message: any) {
    this.write('warn', message);
  }

  debug?(message: any) {
    this.write('debug', message);
  }

  private shouldLog(level: LogLevel) {
    const current = (process.env.LOG_LEVEL as LogLevel) || 'log';

    return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[current];
  }

  private write(level: LogLevel, message: any) {
    if (!this.shouldLog(level)) return;

    const entry = {
      level,
      timestamp: new Date().toISOString(),
      message,
    };

    this.queue.push(JSON.stringify(entry));
    this.flush();
  }

  private async flush() {
    if (this.writing) return;
    this.writing = true;

    while (this.queue.length > 0) {
      const line = this.queue.shift();
      if (!line) continue;

      await this.rotate();
      await fs.appendFile(this.logFile, line + '\n');
    }

    this.writing = false;
  }

  private async rotate() {
    try {
      const stats = await fs.stat(this.logFile);

      const maxKB = Number(process.env.LOG_MAX_FILE_SIZE || 1024);

      if (stats.size / 1024 < maxKB) return;

      const ts = new Date().toISOString().replace(/:/g, '-');

      await fs.rename(this.logFile, `app-${ts}.log`);
    } catch {}
  }
}
