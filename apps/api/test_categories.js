const http = require('http');

const API_URL = 'http://localhost:8080/api/v1';

// Login as a normal user (e.g. jdoe)
const req = http.request(API_URL + '/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
  if (!cookie) {
    console.error("Login failed or no cookie");
    return;
  }
  
  // Now request /categories as the normal user
  const getReq = http.request(API_URL + '/categories', {
    method: 'GET',
    headers: { 'Cookie': cookie }
  }, (getRes) => {
    let body = '';
    getRes.on('data', chunk => body += chunk);
    getRes.on('end', () => {
      console.log(`Status Code for /categories: ${getRes.statusCode}`);
      const data = JSON.parse(body);
      if (data.data) {
        console.log(`Success! Found ${data.data.length} categories.`);
        console.log(`Categories:`, data.data.map(c => c.name).join(', '));
      } else {
        console.log(`Response:`, body);
      }
    });
  });
  getReq.end();
});

req.write(JSON.stringify({ username: 'jdoe', password: 'password' }));
req.end();
