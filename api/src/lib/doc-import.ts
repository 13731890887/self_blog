import mammoth from 'mammoth';
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

turndown.addRule('preserveLineBreaks', {
  filter: ['br'],
  replacement: () => '  \n'
});

export type ImportedDocument = {
  title: string;
  content: string;
};

export async function importDocx(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value.trim();
  const rawText = result.messages
    .map((message) => message.message)
    .filter(Boolean);

  const markdown = normalizeMarkdown(turndown.turndown(html));
  const headingTitle = extractFirstHeading(html);
  const filenameTitle = normalizeFilename(file.name.replace(/\.docx$/i, ''));
  const title = headingTitle || filenameTitle || 'Imported Document';

  if (!markdown) {
    throw new Error(rawText[0] || 'Document import produced no readable content');
  }

  return {
    title,
    content: markdown
  } satisfies ImportedDocument;
}

function extractFirstHeading(html: string) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ?? html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (!match?.[1]) {
    return '';
  }

  return decodeHtml(stripHtml(match[1])).trim();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ');
}

function normalizeFilename(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMarkdown(value: string) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
