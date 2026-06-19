const http = require('http');
const { createHandler } = require('./app');

const port = Number(process.env.PORT || 3000);
const server = http.createServer(createHandler());
server.listen(port, () => {
  console.log(`OneOp2 Sprint 1 MVP running at http://localhost:${port}`);
});
