import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { loadEnvironment } from './lib/env.js';

loadEnvironment();

const BASE_URL = (process.env.AI_CLI_BASE_URL ?? 'http://127.0.0.1:4322').replace(/\/+$/, '');
const API_KEY = process.env.AI_CLI_KEY?.trim();

const knownCommands = [
  'status',
  'article list',
  'article get',
  'article assist',
  'article publish',
  'article update',
  'article delete',
  'article import-docx',
  'article rename',
  'article diff',
  'asset upload',
  'asset list',
  'asset delete',
  'settings get',
  'settings set',
  'settings tag list',
  'settings tag add',
  'settings tag remove',
  'comment list',
  'comment get',
  'comment reply',
  'comment approve',
  'comment hide',
  'comment delete',
  'comment restore',
  'question list',
  'question get',
  'question reply',
  'question reply-to',
  'question approve',
  'question hide',
  'question delete',
  'question restore',
  'question lock',
  'question unlock',
  'rebuild status',
  'rebuild trigger',
  'rebuild log',
  'audit list',
  'help'
];

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.commandKey === 'help') {
    printHelp();
    return;
  }

  if (!API_KEY) {
    throw new Error('AI_CLI_KEY is required');
  }

  switch (parsed.commandKey) {
    case 'status':
      return output(await request('/api/cli/status'));
    case 'article list':
      return output(await request(withQuery('/api/cli/articles', {
        status: parsed.options.status,
        tag: parsed.options.tag
      })));
    case 'article get':
      return output(await request(`/api/cli/articles/${requirePositional(parsed, 0, 'slug')}`));
    case 'article assist':
      return output(await request('/api/cli/articles/assist', {
        method: 'POST',
        body: JSON.stringify({
          title: parsed.options.title ?? '',
          content: readContent(parsed),
          locale: parsed.options.locale === 'en' ? 'en' : 'zh'
        })
      }));
    case 'article publish':
      return output(await request('/api/cli/articles', {
        method: 'POST',
        body: JSON.stringify({
          title: requireOption(parsed, 'title'),
          content: readContent(parsed),
          metaDescription: parsed.options.description,
          tags: readTags(parsed),
          tldr: parsed.options.tldr,
          draft: readDraftFlag(parsed, true)
        })
      }));
    case 'article update':
      return output(await request(`/api/cli/articles/${requirePositional(parsed, 0, 'slug')}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...(parsed.options.title ? { title: parsed.options.title } : {}),
          ...(hasContent(parsed) ? { content: readContent(parsed) } : {}),
          ...(Object.hasOwn(parsed.options, 'description') ? { metaDescription: parsed.options.description } : {}),
          ...(parsed.tagValues.length > 0 || parsed.options.tags ? { tags: readTags(parsed) } : {}),
          ...(Object.hasOwn(parsed.options, 'tldr') ? { tldr: parsed.options.tldr } : {}),
          ...readDraftOverride(parsed)
        })
      }));
    case 'article delete':
      return output(await request(`/api/cli/articles/${requirePositional(parsed, 0, 'slug')}`, {
        method: 'DELETE'
      }));
    case 'article import-docx':
      return output(await requestForm('/api/cli/articles/import-docx', {
        document: {
          path: requireOption(parsed, 'file')
        }
      }));
    case 'article rename':
      return output(await request(`/api/cli/articles/${requirePositional(parsed, 0, 'slug')}/rename`, {
        method: 'POST',
        body: JSON.stringify({
          to: requireOption(parsed, 'to'),
          ...(parsed.options.title ? { title: parsed.options.title } : {})
        })
      }));
    case 'article diff':
      return output(await request(`/api/cli/articles/${requirePositional(parsed, 0, 'slug')}/diff`, {
        method: 'POST',
        body: JSON.stringify({
          ...(parsed.options.title ? { title: parsed.options.title } : {}),
          ...(hasContent(parsed) ? { content: readContent(parsed) } : {}),
          ...(Object.hasOwn(parsed.options, 'description') ? { metaDescription: parsed.options.description } : {}),
          ...(parsed.tagValues.length > 0 || parsed.options.tags ? { tags: readTags(parsed) } : {}),
          ...(Object.hasOwn(parsed.options, 'tldr') ? { tldr: parsed.options.tldr } : {}),
          ...readDraftOverride(parsed)
        })
      }));
    case 'asset upload':
      return output(await requestForm('/api/cli/assets/upload-image', {
        image: {
          path: requireOption(parsed, 'file')
        },
        ...(parsed.options.alt ? { alt: parsed.options.alt } : {})
      }));
    case 'asset list':
      return output(await request('/api/cli/assets'));
    case 'asset delete':
      return output(await request(withQuery(`/api/cli/assets/${encodeURIComponent(requirePositional(parsed, 0, 'filename'))}`, {
        force: parsed.flags.has('force') ? 'true' : undefined
      }), {
        method: 'DELETE'
      }));
    case 'settings get':
      return output(await request('/api/cli/settings'));
    case 'settings set':
      return output(await request('/api/cli/settings', {
        method: 'PUT',
        body: JSON.stringify(readJsonInput(parsed))
      }));
    case 'settings tag list':
      return output(await request('/api/cli/settings/tags'));
    case 'settings tag add':
      return output(await request('/api/cli/settings/tags', {
        method: 'POST',
        body: JSON.stringify({
          zh: requireOption(parsed, 'zh'),
          en: requireOption(parsed, 'en')
        })
      }));
    case 'settings tag remove':
      return output(await request(`/api/cli/settings/tags/${encodeURIComponent(requirePositional(parsed, 0, 'tag'))}`, {
        method: 'DELETE'
      }));
    case 'comment list':
      return output(await request(withQuery('/api/cli/comments', {
        status: parsed.options.status
      })));
    case 'comment get':
      return output(await request(`/api/cli/comments/${requirePositional(parsed, 0, 'id')}`));
    case 'comment reply':
      return output(await request(`/api/cli/comments/${requirePositional(parsed, 0, 'id')}/reply`, {
        method: 'POST',
        body: JSON.stringify({
          content: readContent(parsed),
          ...(parsed.options.username ? { username: parsed.options.username } : {}),
          ...(parsed.options.email ? { email: parsed.options.email } : {})
        })
      }));
    case 'comment approve':
    case 'comment hide':
    case 'comment delete':
    case 'comment restore':
      return output(await request(`/api/cli/comments/${requirePositional(parsed, 0, 'id')}/${parsed.commandPath[1]}`, {
        method: 'POST'
      }));
    case 'question list':
      return output(await request(withQuery('/api/cli/questions', {
        status: parsed.options.status
      })));
    case 'question get':
      return output(await request(`/api/cli/questions/${requirePositional(parsed, 0, 'id')}`));
    case 'question reply':
      return output(await request(`/api/cli/questions/${requirePositional(parsed, 0, 'id')}/reply`, {
        method: 'POST',
        body: JSON.stringify({
          content: readContent(parsed),
          ...(parsed.options.username ? { username: parsed.options.username } : {}),
          ...(parsed.options.email ? { email: parsed.options.email } : {})
        })
      }));
    case 'question reply-to':
      return output(await request(`/api/cli/questions/replies/${requirePositional(parsed, 0, 'id')}/reply`, {
        method: 'POST',
        body: JSON.stringify({
          content: readContent(parsed),
          ...(parsed.options.username ? { username: parsed.options.username } : {}),
          ...(parsed.options.email ? { email: parsed.options.email } : {})
        })
      }));
    case 'question approve':
    case 'question hide':
    case 'question delete':
    case 'question restore':
    case 'question lock':
    case 'question unlock':
      return output(await request(`/api/cli/questions/${requirePositional(parsed, 0, 'id')}/${parsed.commandPath[1]}`, {
        method: 'POST'
      }));
    case 'rebuild status':
      return output(await request('/api/cli/rebuild/status'));
    case 'rebuild trigger':
      return output(await request('/api/cli/rebuild/trigger', {
        method: 'POST'
      }));
    case 'rebuild log':
      return output(await request(withQuery('/api/cli/rebuild/log', {
        lines: parsed.options.lines
      })));
    case 'audit list':
      return output(await request(withQuery('/api/cli/audit', {
        limit: parsed.options.limit,
        targetType: parsed.options['target-type'],
        action: parsed.options.action
      })));
    default:
      printHelp();
  }
}

type ParsedArgs = {
  commandPath: string[];
  commandKey: string;
  positional: string[];
  options: Record<string, string>;
  flags: Set<string>;
  tagValues: string[];
};

function parseArgs(argv: string[]): ParsedArgs {
  const { commandPath, rest } = extractCommand(argv);
  const positional: string[] = [];
  const options: Record<string, string> = {};
  const flags = new Set<string>();
  const tagValues: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const name = token.slice(2);
    if (name === 'tag') {
      const value = rest[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('--tag requires a value');
      }
      tagValues.push(value);
      index += 1;
      continue;
    }

    if (isBooleanFlag(name)) {
      flags.add(name);
      continue;
    }

    const value = rest[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`--${name} requires a value`);
    }
    options[name] = value;
    index += 1;
  }

  return {
    commandPath,
    commandKey: commandPath.join(' '),
    positional,
    options,
    flags,
    tagValues
  };
}

function extractCommand(argv: string[]) {
  const segments: string[] = [];
  let bestMatch = ['help'];
  let consumed = 0;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token.startsWith('--')) {
      break;
    }

    segments.push(token);
    const candidate = segments.join(' ');
    if (knownCommands.includes(candidate)) {
      bestMatch = [...segments];
      consumed = index + 1;
    }
  }

  return {
    commandPath: bestMatch,
    rest: argv.slice(consumed)
  };
}

function isBooleanFlag(name: string) {
  return name === 'draft' || name === 'published' || name === 'force';
}

function requirePositional(parsed: ParsedArgs, index: number, label: string) {
  const value = parsed.positional[index];
  if (!value) {
    throw new Error(`${label} is required`);
  }
  return value;
}

function requireOption(parsed: ParsedArgs, name: string) {
  const value = parsed.options[name];
  if (!value) {
    throw new Error(`--${name} is required`);
  }
  return value;
}

function hasContent(parsed: ParsedArgs) {
  return Boolean(parsed.options.content || parsed.options['content-file']);
}

function readContent(parsed: ParsedArgs) {
  const inline = parsed.options.content;
  const filePath = parsed.options['content-file'];

  if (inline && filePath) {
    throw new Error('Use either --content or --content-file, not both');
  }
  if (inline) {
    return inline;
  }
  if (filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }

  throw new Error('One of --content or --content-file is required');
}

function readTags(parsed: ParsedArgs) {
  const csvTags = parsed.options.tags
    ? parsed.options.tags.split(',').map((value) => value.trim()).filter(Boolean)
    : [];

  return [...csvTags, ...parsed.tagValues];
}

function readDraftFlag(parsed: ParsedArgs, fallback: boolean) {
  if (parsed.flags.has('draft') && parsed.flags.has('published')) {
    throw new Error('Use only one of --draft or --published');
  }
  if (parsed.flags.has('draft')) {
    return true;
  }
  if (parsed.flags.has('published')) {
    return false;
  }
  return fallback;
}

function readDraftOverride(parsed: ParsedArgs) {
  if (!parsed.flags.has('draft') && !parsed.flags.has('published')) {
    return {};
  }
  return { draft: readDraftFlag(parsed, true) };
}

async function request(pathname: string, init?: RequestInit) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    ...init,
    headers: {
      authorization: `Bearer ${API_KEY}`,
      'content-type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  const text = await response.text();
  const payload = tryParseJson(text);
  if (!response.ok) {
    const message = payload && typeof payload.error === 'string' ? payload.error : text || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }

  return payload ?? text;
}

async function requestForm(pathname: string, fields: Record<string, string | { path: string }>) {
  const form = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string') {
      form.set(key, value);
      continue;
    }

    const buffer = fs.readFileSync(value.path);
    form.set(key, new File([buffer], path.basename(value.path)));
  }

  const response = await fetch(`${BASE_URL}${pathname}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${API_KEY}`
    },
    body: form
  });

  const text = await response.text();
  const payload = tryParseJson(text);
  if (!response.ok) {
    const message = payload && typeof payload.error === 'string' ? payload.error : text || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }

  return payload ?? text;
}

function readJsonInput(parsed: ParsedArgs) {
  if (parsed.options.json) {
    return JSON.parse(parsed.options.json) as unknown;
  }
  if (parsed.options.file) {
    return JSON.parse(fs.readFileSync(parsed.options.file, 'utf8')) as unknown;
  }

  throw new Error('One of --json or --file is required');
}

function withQuery(pathname: string, params: Record<string, string | undefined>) {
  const url = new URL(pathname, 'http://localhost');
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return `${url.pathname}${url.search}`;
}

function tryParseJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function output(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printHelp() {
  process.stdout.write([
    'AI CLI',
    '',
    'Usage:',
    '  npm run ai:cli -- status',
    '  npm run ai:cli -- article list [--status draft|published] [--tag note]',
    '  npm run ai:cli -- article get <slug>',
    '  npm run ai:cli -- article assist --content-file ./draft.md [--title "Draft"] [--locale zh|en]',
    '  npm run ai:cli -- article publish --title "Title" --content-file ./draft.md [--tag note] [--published]',
    '  npm run ai:cli -- article update <slug> [--title "New title"] [--content-file ./draft.md] [--tags note,ai] [--draft|--published]',
    '  npm run ai:cli -- article rename <slug> --to new-slug [--title "New title"]',
    '  npm run ai:cli -- article diff <slug> [--content-file ./draft.md] [--title "New title"]',
    '  npm run ai:cli -- article delete <slug>',
    '  npm run ai:cli -- article import-docx --file ./draft.docx',
    '  npm run ai:cli -- asset upload --file ./cover.png [--alt "Cover"]',
    '  npm run ai:cli -- asset list',
    '  npm run ai:cli -- asset delete cover.png [--force]',
    '  npm run ai:cli -- settings get',
    '  npm run ai:cli -- settings set --file ./site-settings.json',
    '  npm run ai:cli -- settings tag list',
    '  npm run ai:cli -- settings tag add --zh "中文" --en "english-id"',
    '  npm run ai:cli -- settings tag remove english-id',
    '  npm run ai:cli -- comment list [--status visible|hidden|deleted]',
    '  npm run ai:cli -- comment get <id>',
    '  npm run ai:cli -- comment reply <id> --content "Reply body"',
    '  npm run ai:cli -- comment approve|hide|delete|restore <id>',
    '  npm run ai:cli -- question list [--status visible|hidden|deleted]',
    '  npm run ai:cli -- question get <id>',
    '  npm run ai:cli -- question reply <id> --content "Reply body"',
    '  npm run ai:cli -- question reply-to <reply-id> --content "Nested reply"',
    '  npm run ai:cli -- question approve|hide|delete|restore|lock|unlock <id>',
    '  npm run ai:cli -- rebuild status',
    '  npm run ai:cli -- rebuild trigger',
    '  npm run ai:cli -- rebuild log [--lines 80]',
    '  npm run ai:cli -- audit list [--limit 100] [--target-type comments] [--action delete]',
    '',
    'Environment:',
    '  AI_CLI_KEY=shared_secret',
    '  AI_CLI_BASE_URL=https://your-domain-or-api-host',
    '  AI_CLI_ACTOR_NAME=AI Admin',
    '  AI_CLI_ACTOR_EMAIL=ai-cli@localhost'
  ].join('\n'));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
