/**
 * EventSphere High-Concurrency Performance & Stress Benchmark
 * Simulates concurrent virtual users querying core API endpoints.
 */

const http = require('http');

const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
const SERVER_PORT = process.env.PORT || 5000;
const CONCURRENT_REQUESTS = 200;
const TARGET_PATH = '/api/health';

console.log('================================================================');
console.log('  EventSphere High-Concurrency Performance Benchmark (T09.13)    ');
console.log(`  Target: http://${SERVER_HOST}:${SERVER_PORT}${TARGET_PATH}    `);
console.log(`  Simulated Virtual Users: ${CONCURRENT_REQUESTS} concurrent reqs`);
console.log('================================================================');

const latencies = [];
let completed = 0;
let errors = 0;
let statusCounts = {};

const startTime = Date.now();

const sendRequest = (index) => {
  return new Promise((resolve) => {
    const reqStart = Date.now();
    const req = http.get(
      {
        host: SERVER_HOST,
        port: SERVER_PORT,
        path: TARGET_PATH,
        timeout: 5000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const duration = Date.now() - reqStart;
          latencies.push(duration);
          statusCounts[res.statusCode] = (statusCounts[res.statusCode] || 0) + 1;
          completed++;
          resolve();
        });
      }
    );

    req.on('error', (err) => {
      errors++;
      completed++;
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      errors++;
      completed++;
      resolve();
    });
  });
};

const runBenchmark = async () => {
  const promises = [];
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(sendRequest(i));
  }

  await Promise.all(promises);

  const totalTimeSec = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const sum = latencies.reduce((acc, val) => acc + val, 0);
  const avg = latencies.length > 0 ? (sum / latencies.length).toFixed(2) : 0;
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const reqPerSec = (completed / totalTimeSec).toFixed(1);

  console.log('\n--- Benchmark Results ---');
  console.log(`Total Requests Processed: ${completed} / ${CONCURRENT_REQUESTS}`);
  console.log(`Failed Requests:          ${errors}`);
  console.log(`Throughput:               ${reqPerSec} req/sec`);
  console.log(`Total Elapsed Time:       ${totalTimeSec.toFixed(3)}s`);
  console.log(`Average Latency:          ${avg} ms`);
  console.log(`Median (p50) Latency:     ${p50} ms`);
  console.log(`p95 Latency:              ${p95} ms`);
  console.log(`p99 Latency:              ${p99} ms`);
  console.log('HTTP Status Code Breakdown:', statusCounts);
  console.log('================================================================\n');
};

if (require.main === module) {
  runBenchmark();
}

module.exports = { runBenchmark };
