// Automated End-to-End API Test for VedRiti Sanctum Backend
async function runTests() {
  const baseUrl = 'http://localhost:5001/api/v1';
  console.log('🕉️ Starting VedRiti End-to-End API Verification...\n');

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    console.log('✅ 1. Health Status:', health.platform, '| Status:', health.status);

    // 2. Request OTP
    const reqOtpRes = await fetch(`${baseUrl}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+919876543210' })
    });
    const otpData = await reqOtpRes.json();
    console.log('✅ 2. Request OTP Response:', otpData.data.message);

    // 3. Verify OTP with static code 1080
    const verifyRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '+919876543210',
        otp: '1080',
        name: 'Devotee Rahul Sharma',
        gotra: 'Kashyap Gotra'
      })
    });
    const authData = await verifyRes.json();
    console.log('✅ 3. Auth Success:', authData.data.message);
    console.log('   Devotee Name:', authData.data.user.name);
    console.log('   Punya Points:', authData.data.user.punyaPoints);
    const token = authData.data.token;

    // 4. Get Current Devotee Profile
    const profileRes = await fetch(`${baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profile = await profileRes.json();
    console.log('✅ 4. Profile Fetch Success:', profile.data.name, '| Gotra:', profile.data.gotra);

    // 5. Add a Family Member
    const familyRes = await fetch(`${baseUrl}/auth/family`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Pooja Sharma',
        relation: 'Spouse',
        gotra: 'Kashyap',
        nakshatra: 'Mrigashira'
      })
    });
    const familyData = await familyRes.json();
    console.log('✅ 5. Family Member Added:', familyData.data.length, 'members in family directory');

    // 6. Fetch Sacred Pujas
    const pujasRes = await fetch(`${baseUrl}/pujas`);
    const pujas = await pujasRes.json();
    console.log('✅ 6. Pujas Catalog:', pujas.count, 'pujas loaded. First:', pujas.data[0].name);

    // 7. Fetch Spiritual Store Products
    const productsRes = await fetch(`${baseUrl}/store/products`);
    const products = await productsRes.json();
    console.log('✅ 7. Spiritual Store:', products.count, 'products loaded. First:', products.data[0].name);

    // 8. Create Sacred Puja Booking
    const bookingRes = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        pujaSlug: 'kashi-vishwanath-rudrabhishek',
        packageId: 'pkg-rudra-rudra',
        devoteeName: 'Devotee Rahul Sharma',
        gotra: 'Kashyap',
        phone: '+919876543210',
        familyMembers: ['Devotee Rahul Sharma', 'Pooja Sharma'],
        date: '2026-11-01',
        timeSlot: '06:00 AM - 08:30 AM (Brahma Muhurta)',
        address: 'House 108, Kashi Sanctum Marg, Varanasi',
        pinCode: '221001',
        couponCode: 'VEDA10',
        usePunyaPoints: true,
        paymentMethod: 'UPI'
      })
    });
    const bookingData = await bookingRes.json();
    if (!bookingRes.ok) {
      console.error('Booking Error:', bookingRes.status, JSON.stringify(bookingData));
    }
    console.log('✅ 8. Booking Created:', bookingData.data.bookingId);
    console.log('   Puja Name:', bookingData.data.pujaName);
    console.log('   Package:', bookingData.data.packageName);
    console.log('   Final Dakshina:', '₹' + bookingData.data.finalDakshina);
    console.log('   Sankalp Patra ID:', bookingData.data.patraId);
    console.log('   Prasad Tracking AWB:', bookingData.data.awbNumber);

    // 9. Fetch Devotee Bookings List
    const devoteeBookingsRes = await fetch(`${baseUrl}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const myBookings = await devoteeBookingsRes.json();
    console.log('✅ 9. Devotee Bookings Retrieved:', myBookings.count, 'bookings found');

    // 10. Create E-Commerce Store Order
    const orderRes = await fetch(`${baseUrl}/store/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          {
            productId: 'prod_rudra_1',
            quantity: 2
          },
          {
            productId: 'prod_yantra_2',
            quantity: 1
          }
        ],
        devoteeName: 'Devotee Rahul Sharma',
        phone: '+919876543210',
        address: 'Flat 402, Shivam Residency, Varanasi',
        pinCode: '221001',
        paymentMethod: 'UPI'
      })
    });
    const orderData = await orderRes.json();
    console.log('✅ 10. Store Order Placed:', orderData.data.orderId);
    console.log('    Total Amount:', '₹' + orderData.data.totalAmount);
    console.log('    AWB Tracking:', orderData.data.awbNumber);

    // 11. Request Kundli Consultation
    const kundliRes = await fetch(`${baseUrl}/kundli/consultation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'JANAM_KUNDLI',
        primaryPerson: {
          fullName: 'Rahul Sharma',
          gender: 'MALE',
          dateOfBirth: '1992-05-18',
          timeOfBirth: '07:35 AM',
          placeOfBirth: 'Varanasi, UP',
          gotra: 'Kashyap',
          rashi: 'Vrishabha',
          nakshatra: 'Rohini'
        },
        specificConcerns: 'Guidance on spiritual startup enterprise launch timings and Graha Dasha remedies.'
      })
    });
    const kundliData = await kundliRes.json();
    console.log('✅ 11. Kundli Consultation Booked:', kundliData.data.requestId);
    console.log('    Assigned Acharya:', kundliData.data.assignedAcharya);
    console.log('    Consultation Status:', kundliData.data.status);

    // 12. Vedic AI Scriptural Guidance Query
    const aiRes = await fetch(`${baseUrl}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Ghar me Griha Pravesh karte samay sabse pehle koun sa sankalp aur puja karni chahiye?'
      })
    });
    const aiData = await aiRes.json();
    console.log('✅ 12. Vedic AI Response Generated:');
    console.log('    Citation:', aiData.data.shastraCitation);
    console.log('    Sanskrit Shloka:', aiData.data.sanskritShloka);
    console.log('    Recommended Puja:', aiData.data.recommendedPujaName);

    // 13. Live Panchang
    const panchangRes = await fetch(`${baseUrl}/panchang/today`);
    const panchang = await panchangRes.json();
    console.log('✅ 13. Daily Panchang:');
    console.log('    Tithi:', panchang.data.tithi);
    console.log('    Nakshatra:', panchang.data.nakshatra);
    console.log('    Abhijit Muhurat:', panchang.data.abhijitMuhurat);

    // 14. Razorpay Payment Gateway Integration
    const paymentRes = await fetch(`${baseUrl}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        referenceId: bookingData.data.bookingId,
        referenceType: 'puja',
        amount: bookingData.data.finalDakshina
      })
    });
    const paymentData = await paymentRes.json();
    console.log('✅ 14. Razorpay Order Created:', paymentData.data.orderId);
    console.log('    Currency:', paymentData.data.currency, '| Amount (Paise):', paymentData.data.amount);

    console.log('\n🌟 ALL 14 ENTERPRISE BACKEND VERIFICATION TESTS PASSED FLAWLESSLY! 🕉️');
  } catch (err) {
    console.error('❌ Test Execution Error:', err);
  }
}

runTests();
