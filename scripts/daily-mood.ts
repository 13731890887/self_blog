async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`daily-mood scaffold for ${today}`);
  console.log('Expected provider: Claude API');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
