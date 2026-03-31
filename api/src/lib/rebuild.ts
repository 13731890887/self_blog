import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fromProjectRoot } from './paths.js';

const sharedDir = fromProjectRoot('shared');
const lockPath = fromProjectRoot('shared', 'site-rebuild.lock');
const logPath = fromProjectRoot('shared', 'site-rebuild.log');

type RebuildTriggerResult = {
  started: boolean;
  logPath: string;
};

export type RebuildStatus = {
  running: boolean;
  logPath: string;
  lockPath: string;
  logExists: boolean;
};

export type RebuildLog = {
  logPath: string;
  lines: string[];
};

export function triggerSiteRebuild(): RebuildTriggerResult {
  fs.mkdirSync(sharedDir, { recursive: true });

  let lockFd: number | null = null;

  try {
    lockFd = fs.openSync(lockPath, 'wx');
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EEXIST') {
      return {
        started: false,
        logPath
      };
    }

    throw error;
  } finally {
    if (lockFd !== null) {
      fs.closeSync(lockFd);
    }
  }

  const output = fs.openSync(logPath, 'a');
  const command = [
    `cd ${shellQuote(fromProjectRoot())}`,
    'echo "==== $(date -Is) rebuild started ===="',
    'npm run build',
    'pm2 restart self-blog-api',
    'echo "==== $(date -Is) rebuild finished ===="'
  ].join(' && ');
  const wrapped = `trap 'rm -f ${shellQuote(lockPath)}' EXIT; ${command}`;

  const child = spawn('bash', ['-lc', wrapped], {
    cwd: fromProjectRoot(),
    detached: true,
    stdio: ['ignore', output, output],
    env: process.env
  });

  child.unref();

  return {
    started: true,
    logPath
  };
}

export function readSiteRebuildStatus(): RebuildStatus {
  fs.mkdirSync(sharedDir, { recursive: true });

  return {
    running: fs.existsSync(lockPath),
    logPath,
    lockPath,
    logExists: fs.existsSync(logPath)
  };
}

export function readSiteRebuildLog(maxLines = 80): RebuildLog {
  fs.mkdirSync(sharedDir, { recursive: true });

  if (!fs.existsSync(logPath)) {
    return {
      logPath,
      lines: []
    };
  }

  const source = fs.readFileSync(logPath, 'utf8');
  const lines = source.split(/\r?\n/).filter(Boolean);

  return {
    logPath,
    lines: lines.slice(-Math.max(1, maxLines))
  };
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
