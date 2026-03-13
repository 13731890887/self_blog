import { fileURLToPath } from 'node:url';
import path from 'node:path';

const currentFile = fileURLToPath(import.meta.url);
const srcDir = path.dirname(path.dirname(currentFile));
export const apiRoot = path.dirname(srcDir);
export const projectRoot = path.dirname(apiRoot);

export function fromProjectRoot(...segments: string[]) {
  return path.join(projectRoot, ...segments);
}

export function fromApiRoot(...segments: string[]) {
  return path.join(apiRoot, ...segments);
}
