const axios = require('axios');

const services = [
  { name: 'API Gateway',          url: 'http://localhost:3000/health' },
  { name: 'Auth Service',         url: 'http://localhost:3001/health' },
  { name: 'Property Service',     url: 'http://localhost:3002/health' },
  { name: 'Booking Service',      url: 'http://localhost:3003/health' },
  { name: 'Payment Service',      url: 'http://localhost:3004/health' },
  { name: 'Housekeeping Service', url: 'http://localhost:3005/health' },
  { name: 'Notification Service', url: 'http://localhost:3006/health' },
  { name: 'Restaurant Service',   url: 'http://localhost:3007/health' },
  { name: 'Staff Service',        url: 'http://localhost:3008/health' },
  { name: 'Analytics Service',    url: 'http://localhost:3009/health' },
];

const checkAll = async () => {
  console.log('\n=== NexoraHotels Health Check ===\n');

  const results = await Promise.allSettled(
    services.map(async (service) => {
      try {
        const res = await axios.get(service.url, { timeout: 3000 });
        return { ...service, status: 'UP', code: res.status };
      } catch (err) {
        return { ...service, status: 'DOWN', error: err.message };
      }
    })
  );

  let allUp = true;

  results.forEach(result => {
    const s = result.value;
    const icon = s.status === 'UP' ? '✓' : '✗';
    const color = s.status === 'UP' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    console.log(`${color}${icon}${reset} ${s.name.padEnd(25)} ${s.status}`);
    if (s.status === 'DOWN') allUp = false;
  });

  console.log('\n' + (allUp
    ? '\x1b[32mAll services are running!\x1b[0m'
    : '\x1b[31mSome services are down. Check the logs.\x1b[0m'
  ) + '\n');
};

checkAll();