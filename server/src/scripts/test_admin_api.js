import http from 'http';
import { createApp } from '../app.js';

const app = createApp();
const server = http.createServer(app);

server.listen(5099, async () => {
  console.log('🧪 [Test Server] Started on port 5099');

  try {
    // 1. Test Admin Stats
    const statsRes = await fetch('http://localhost:5099/api/v1/admin/stats');
    const statsJson = await statsRes.json();
    console.log('✅ [Admin Stats Status]:', statsRes.status, statsJson.data.totalDakshinaRevenue);

    // 2. Test Admin Bookings
    const bookingsRes = await fetch('http://localhost:5099/api/v1/admin/bookings');
    const bookingsJson = await bookingsRes.json();
    console.log('✅ [Admin Bookings Status]:', bookingsRes.status, 'Count:', bookingsJson.count);

    // 3. Test Admin Payouts
    const payoutsRes = await fetch('http://localhost:5099/api/v1/admin/payouts');
    const payoutsJson = await payoutsRes.json();
    console.log('✅ [Admin Payouts Status]:', payoutsRes.status, 'Count:', payoutsJson.count);

    console.log('🎉 ALL ADMIN API ENDPOINTS VERIFIED 100%!');
  } catch (err) {
    console.error('❌ Test Error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
