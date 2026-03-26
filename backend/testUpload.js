import fs from 'fs';
import path from 'path';

async function testAPI() {
  try {
    console.log('1. Creating a dummy text file...');
    const dummyPath = path.join(process.cwd(), 'dummy.txt');
    fs.writeFileSync(dummyPath, 'Hello this is a test resource shared document.');

    // We need to login to get a token
    console.log('2. Logging in to get token...');
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentNumber: 'ADMIN123', password: 'password123' })
    });
    
    // If login fails, we'll just log it
    if (!loginRes.ok) {
       console.log('Login failed, we might not have a seeded user. Check seed.js.');
       fs.unlinkSync(dummyPath);
       return;
    }

    const { token } = await loginRes.json();

    console.log('3. Uploading the file...');
    // In Node 18+ we can use FormData and Blob
    const data = new FormData();
    const fileBlob = new Blob([fs.readFileSync(dummyPath)], { type: 'text/plain' });
    data.append('file', fileBlob, 'dummy.txt');
    data.append('sharedWith', 'department');

    const uploadRes = await fetch('http://localhost:5001/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: data
    });

    if (!uploadRes.ok) {
      console.error('Upload failed:', await uploadRes.text());
      fs.unlinkSync(dummyPath);
      return;
    }

    const uploadData = await uploadRes.json();
    console.log('Upload Result:', uploadRes.status, uploadData);

    console.log('4. Fetching all resources...');
    const getRes = await fetch('http://localhost:5001/api/files', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const getData = await getRes.json();
    console.log('GET /api/files sum:', getData.length, 'item(s) found.');
    console.log('First item:', getData[0]);

    // Cleanup
    fs.unlinkSync(dummyPath);
    console.log('Done!');

  } catch (error) {
    console.error('Test script error:', error);
  }
}

testAPI();
