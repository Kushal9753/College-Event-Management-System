import http from 'http';

const data = JSON.stringify({
  identifier: 'admin@college.edu',
  password: 'adminpassword123',
  expectedRole: 'admin'
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
  res.on('end', () => console.log('Admin Login Status:', res.statusCode, '\nBody:', body));
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();

const data2 = JSON.stringify({
  identifier: 'faculty@college.edu',
  password: 'facultypassword123',
  expectedRole: 'faculty'
});

const req2 = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data2.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Faculty Login Status:', res.statusCode, '\nBody:', body));
});

req2.on('error', e => console.error('Error:', e.message));
req2.write(data2);
req2.end();
