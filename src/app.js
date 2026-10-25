const http = require('http');

function handler(req, res) {
  const build = process.env.BUILD_NUMBER || 'local';

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  if (req.url === '/version') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ app: 'jenkins-docker-pipeline', build }));
  }

  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(
      '<h1>Deployed by Jenkins!</h1>' +
      `<p>This app was built and deployed by Jenkins build #${build}.</p>`
    );
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

function createServer() {
  return http.createServer(handler);
}

module.exports = { createServer };
