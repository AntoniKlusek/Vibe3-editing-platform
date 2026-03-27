import http from "node:http";

/**
 * Minimal HTTP server for Docker HEALTHCHECK and Kubernetes liveness probes.
 * Returns 200 OK on GET /health
 */
export function startHealthServer(port: number) {
  const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(port, () => {
    console.info(`[health] Health check server listening on :${port}/health`);
  });

  return server;
}
