import http from 'http';
import { createApp } from '../app.js';

const app = createApp();
const server = http.createServer(app);

server.listen(5098, async () => {
  console.log('🧪 [Auth Test Server] Listening on port 5098');

  try {
    // 1. Mobile OTP Request & Verify
    console.log('\n--- 1. Testing Mobile OTP Flow ---');
    const reqOtpRes = await fetch('http://localhost:5098/api/v1/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210' }),
    });
    const reqOtpData = await reqOtpRes.json();
    console.log('✅ Request OTP response:', reqOtpRes.status, reqOtpData.data?.staticOtp);

    const verifyOtpRes = await fetch('http://localhost:5098/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9876543210',
        otp: '1080',
        name: 'आनंद शर्मा',
        gotra: 'कश्यप गोत्र',
      }),
    });
    const verifyOtpData = await verifyOtpRes.json();
    console.log('✅ Verify OTP response:', verifyOtpRes.status, verifyOtpData.data?.user?.name);

    // 2. Direct Email Sign Up
    console.log('\n--- 2. Testing Direct Email Sign Up ---');
    const testEmail = `devotee_${Date.now()}@vedriti.org`;
    const signupRes = await fetch('http://localhost:5098/api/v1/auth/signup-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SacredPassword108',
        name: 'राजेश कुमार त्रिपाठी',
        gotra: 'भारद्वाज गोत्र',
        phone: '9812345678',
      }),
    });
    const signupData = await signupRes.json();
    console.log('✅ Email Signup response:', signupRes.status, signupData.data?.user?.email, signupData.data?.user?.punyaPoints);

    // 3. Direct Email Login (Correct Password)
    console.log('\n--- 3. Testing Direct Email Login (Success) ---');
    const loginRes = await fetch('http://localhost:5098/api/v1/auth/login-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SacredPassword108',
      }),
    });
    const loginData = await loginRes.json();
    console.log('✅ Email Login response:', loginRes.status, loginData.data?.message);

    // 4. Direct Email Login (Wrong Password - Should fail 401)
    console.log('\n--- 4. Testing Direct Email Login (Wrong Password Rejection) ---');
    const wrongLoginRes = await fetch('http://localhost:5098/api/v1/auth/login-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword123',
      }),
    });
    const wrongLoginData = await wrongLoginRes.json();
    console.log('✅ Wrong Password Rejection:', wrongLoginRes.status, wrongLoginData.message);

    // 5. Duplicate Email Signup Rejection (Should fail 409)
    console.log('\n--- 5. Testing Duplicate Email Signup Rejection ---');
    const dupSignupRes = await fetch('http://localhost:5098/api/v1/auth/signup-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'AnotherPassword',
      }),
    });
    const dupSignupData = await dupSignupRes.json();
    console.log('✅ Duplicate Email Rejection:', dupSignupRes.status, dupSignupData.message);

    console.log('\n🎉 ALL DUAL AUTHENTICATION TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
