const http = require('http');
const { createHandler, ensureStore } = require('./app');

async function main() {
  await ensureStore();
  const port = Number(process.env.PORT || 3000);
  const server = http.createServer(createHandler());
  server.listen(port, () => {
    console.log(`OneOp2 running at http://localhost:${port} using ${process.env.ONEOP2_STORE_PROVIDER || 'json'} store provider`);
  });
}

main().catch(error => {
  console.error(`Failed to start OneOp2: ${error.message}`);
  process.exit(1);
});
