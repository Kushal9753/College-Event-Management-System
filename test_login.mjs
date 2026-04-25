import http from 'http';

const data = JSON.stringify({
  identifier: 'test@example.com',
  password: 'password123',
  expectedRole: 'student'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nBody:', body));
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
