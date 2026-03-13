type EmbeddingTask = {
  slug: string;
  contentPath: string;
};

const tasks: EmbeddingTask[] = [
  { slug: 'bandwidth-first-architecture', contentPath: 'src/content/articles/bandwidth-first-architecture.mdx' }
];

async function main() {
  console.log('generate-embeddings scaffold');
  console.log('Expected provider: OpenAI text-embedding-3-small');
  console.log('Tasks queued:', tasks.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
