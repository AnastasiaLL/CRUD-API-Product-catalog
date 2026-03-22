import cluster from 'cluster';
import os from 'os';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);
const numWorkers = Math.max(1, os.availableParallelism() - 1);

if (cluster.isPrimary) {
  console.log(`Master process ${process.pid} is running`);
  console.log(`Starting ${numWorkers} worker processes...`);

  const workerPorts: number[] = [];
  let currentWorkerIndex = 0;

  for (let i = 0; i < numWorkers; i++) {
    const workerPort = PORT + 1 + i;
    workerPorts.push(workerPort);
    const worker = cluster.fork({
      ...process.env,
      PORT: workerPort.toString(),
    });
    console.log(`Worker process ${worker.process.pid} started on port ${workerPort}`);
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    const workerIndex = Math.floor(Math.random() * numWorkers);
    const workerPort = workerPorts[workerIndex];
    const newWorker = cluster.fork({
      ...process.env,
      PORT: workerPort.toString(),
    });
    console.log(`New worker process ${newWorker.process.pid} started on port ${workerPort}`);
  });

  const loadBalancer = http.createServer((req, res) => {
    const workerPort = workerPorts[currentWorkerIndex];
    currentWorkerIndex = (currentWorkerIndex + 1) % numWorkers;

    const proxyReq = http.request(
      {
        hostname: 'localhost',
        port: workerPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    req.pipe(proxyReq);

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(503);
      res.end('Service unavailable');
    });
  });

  loadBalancer.listen(PORT, '0.0.0.0', () => {
    console.log(`Load balancer listening on http://localhost:${PORT}`);
  });
} else {
  import('./main.js').then((module) => {
  });
}
