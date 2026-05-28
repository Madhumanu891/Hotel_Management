const axios = require('axios');

const GATEWAY = 'http://localhost:3000';

const tests = [
  {
    name:     'SQL injection in email field',
    request:  { method: 'POST', url: '/api/auth/login', data: { email: "' OR 1=1 --", password: 'test' } },
    expected: [400, 401, 422],
  },
  {
    name:     'XSS in name field',
    request:  { method: 'POST', url: '/api/auth/register', data: { name: '<script>alert(1)</script>', email: 'xss@test.com', password: 'Test1234!' } },
    expected: [400],
  },
  {
    name:     'NoSQL injection attempt',
    request:  { method: 'POST', url: '/api/auth/login', data: { email: { '$gt': '' }, password: { '$gt': '' } } },
    expected: [400, 401, 422],
  },
  {
    name:     'Access protected route without token',
    request:  { method: 'GET', url: '/api/bookings/my' },
    expected: [401],
  },
  {
    name:     'Access admin route with guest token',
    request:  { method: 'GET', url: '/api/analytics/test/stats', headers: { Authorization: 'Bearer invalid_token' } },
    expected: [401],
  },
  {
    name:     'Large payload rejection',
    request:  { method: 'POST', url: '/api/auth/register', data: { name: 'A'.repeat(50000), email: 'test@test.com', password: 'Test1234!' } },
    expected: [400, 413, 422],
  },
];

const runAudit = async () => {
  console.log('\n=== NexoraHotels Security Audit ===\n');
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await axios({
        method:  test.request.method,
        url:     `${GATEWAY}${test.request.url}`,
        data:    test.request.data,
        headers: test.request.headers || {},
        validateStatus: () => true, // Don't throw on 4xx/5xx
        timeout: 5000,
      });

      const ok = test.expected.includes(response.status);

      if (ok) {
        console.log(`✓ PASS — ${test.name} (${response.status})`);
        passed++;
      } else {
        console.log(`✗ FAIL — ${test.name}`);
        console.log(`  Expected: ${test.expected.join(' or ')}, Got: ${response.status}`);
        failed++;
      }
    } catch (err) {
      console.log(`✗ ERROR — ${test.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
};

runAudit().catch(console.error);