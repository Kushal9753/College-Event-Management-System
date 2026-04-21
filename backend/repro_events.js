import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

async function test() {
  try {
    // 1. Login as Admin
    console.log('Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });

    const token = loginRes.data.token;
    console.log('Login successful');

    // 2. Fetch Events
    console.log('Fetching events...');
    const eventsRes = await axios.get(`${API_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`Found ${eventsRes.data.count} events`);
    if (eventsRes.data.data.length > 0) {
      console.log('First event:', eventsRes.data.data[0].title);
    } else {
      console.log('No events found!');
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

test();
