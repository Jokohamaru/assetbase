const http = require('http');

async function req(path, method = 'GET', data = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 8080,
      path: '/api/v1' + path, method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { 'Cookie': cookie } : {}) }
    };
    const r = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ data: JSON.parse(body), headers: res.headers }));
    });
    r.on('error', reject);
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

async function run() {
  // Login as admin
  const login = await req('/auth/login', 'POST', { username: 'it_manager', password: 'Demo@12345' });
  const cookie = login.headers['set-cookie'].find(c => c.startsWith('assetbase_session=')).split(';')[0];
  console.log("Logged in");

  // Get a category
  const cats = await req('/admin/categories', 'GET', null, cookie);
  const catId = cats.data.data[0].id;
  console.log("Found category:", cats.data.data[0].name);

  // 1. Create a request
  const create = await req('/asset-requests', 'POST', {
    assetCategoryId: catId,
    purpose: 'Cần máy tính để làm việc',
    description: 'Dev frontend cần macbook pro'
  }, cookie);
  
  if (!create.data.success) {
    console.error("Create failed:", create.data);
    return;
  }
  const reqId = create.data.data.id;
  console.log("1. Created Request:", reqId, "Status:", create.data.data.status);

  // 2. List my requests
  const myReqs = await req('/asset-requests/my', 'GET', null, cookie);
  console.log("2. My Requests count:", myReqs.data.data.length);

  // 3. Admin list requests
  const adminReqs = await req('/admin/asset-requests?status=PENDING', 'GET', null, cookie);
  console.log("3. Admin PENDING Requests count:", adminReqs.data.data.length);

  // 4. Cancel
  const cancel = await req(`/asset-requests/${reqId}/cancel`, 'PUT', null, cookie);
  console.log("4. Cancel:", cancel.data.data.status);

  // 5. Create another request
  const create2 = await req('/asset-requests', 'POST', {
    assetCategoryId: catId,
    purpose: 'Testing approval',
    description: 'Test'
  }, cookie);
  const reqId2 = create2.data.data.id;

  // 6. Approve
  const approve = await req(`/admin/asset-requests/${reqId2}/approve`, 'PUT', null, cookie);
  console.log("6. Approve:", approve.data.data.status);

  // 7. Get Person of the requester for assignment test
  const me = await req('/auth/me', 'GET', null, cookie);
  // Actually, we don't have a linked person to the IT manager by default in seed?
  // Let's create a person and link to user, or just see if Fulfill fails with 'chưa có hồ sơ nhân sự'
  const fulfill = await req(`/admin/asset-requests/${reqId2}/fulfill`, 'POST', {
    assetId: 'some-asset-id', // this will fail anyway
    conditionOut: 'Mới'
  }, cookie);
  
  console.log("7. Fulfill with bad assetId:", fulfill.data.error?.message || fulfill.data);

}

run().catch(console.error);
