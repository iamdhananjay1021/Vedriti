async function testEnterpriseAi() {
  const sessionId = 'E2E-ENTERPRISE-SESSION-777';

  console.log('=== STEP 1: Ask Dhanteras 2025 ===');
  const res1 = await fetch('http://localhost:5001/api/v1/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Dhanteras 2025 kab hai aur kya kharidein?',
      sessionId,
      devoteeContext: { name: 'आलोक बाजपेयी', gotra: 'शांडिल्य गोत्र', city: 'कानपुर' }
    })
  });
  const data1 = await res1.json();
  console.log('Res 1 Success:', data1.success);
  console.log('Res 1 Target Year:', data1.targetYear);
  console.log('Res 1 Shastra:', data1.data?.shastraCitation);

  console.log('\n=== STEP 2: Follow-up Diwali in Same Session ===');
  const res2 = await fetch('http://localhost:5001/api/v1/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Diwali par lakshmi pujan ka shubh muhurat kya hai?',
      sessionId,
      devoteeContext: { name: 'आलोक बाजपेयी', gotra: 'शांडिल्य गोत्र' }
    })
  });
  const data2 = await res2.json();
  console.log('Res 2 Success:', data2.success);
  console.log('Res 2 Action:', data2.data?.action?.title);

  console.log('\n=== STEP 3: Retrieve Session History ===');
  const histRes = await fetch('http://localhost:5001/api/v1/ai/sessions/' + sessionId);
  const histData = await histRes.json();
  console.log('History Messages Count:', histData.history?.length);
  if (histData.history) {
    for (let i = 0; i < histData.history.length; i++) {
      const m = histData.history[i];
      console.log(`  [${i + 1}] ${m.sender.toUpperCase()}: ${m.text.substring(0, 50)}...`);
    }
  }

  console.log('\n=== STEP 4: Submit Feedback ===');
  const fbRes = await fetch('http://localhost:5001/api/v1/ai/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messageId: 'mock-msg-id-123',
      feedback: 'helpful'
    })
  });
  const fbData = await fbRes.json();
  console.log('Feedback Recorded:', fbData.success);
}

testEnterpriseAi();
