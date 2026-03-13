import fs from 'node:fs';
import { fromApiRoot, fromProjectRoot } from './paths.js';

export function loadEnvironment() {
  const candidates = [
    fromProjectRoot('.env'),
    fromApiRoot('.env')
  ];

  for (const path of candidates) {
    if (fs.existsSync(path)) {
      loadEnvFile(path);
    }
  }
}

function loadEnvFile(path: string) {
  const source = fs.readFileSync(path, 'utf8');

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = stripWrappingQuotes(rawValue);

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
