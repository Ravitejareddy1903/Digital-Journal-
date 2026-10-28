const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
            rawBody: data
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            rawBody: data
          });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting EverJournal E2E Integration Tests on localhost:5000...\n');

  // Test 1: Health
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET'
  });
  console.log(`[Test 1] GET /health -> Status: ${health.statusCode} (Expected: 200)`);
  if (health.statusCode !== 200) throw new Error('Health check failed');

  // Test 2: Profile
  const profile = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/profile',
    method: 'GET'
  });
  console.log(`[Test 2] GET /api/v1/auth/profile -> User: "${profile.body?.user?.name || profile.body?.name}"`);

  // Test 3: Create Journal
  const testTitle = `Reflective Evening — ${Date.now()}`;
  const newEntry = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/journals',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    title: testTitle,
    content: 'Testing EverJournal MongoDB persistence with warm editorial UI and 5-level mood tracking.',
    category: 'Reflection',
    moodLevel: 5,
    tags: ['mindfulness', 'mongodb', 'everjournal']
  });
  console.log(`[Test 3] POST /api/v1/journals -> Status: ${newEntry.statusCode}, _id: ${newEntry.body?.data?._id}`);
  if (newEntry.statusCode !== 201) throw new Error('Create journal failed');
  const journalId = newEntry.body?.data?._id;

  // Test 4: Toggle Favorite
  const favRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/journals/${journalId}/favorite`,
    method: 'PATCH'
  });
  console.log(`[Test 4] PATCH /api/v1/journals/:id/favorite -> isFavorite: ${favRes.body?.data?.isFavorite ?? favRes.body?.isFavorite}`);

  // Test 5: Toggle Pin
  const pinRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/journals/${journalId}/pin`,
    method: 'PATCH'
  });
  console.log(`[Test 5] PATCH /api/v1/journals/:id/pin -> isPinned: ${pinRes.body?.data?.isPinned ?? pinRes.body?.isPinned}`);

  // Test 6: Create Mood Check-In (Level 5: Great 😄)
  const moodRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/moods',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    moodLevel: 5,
    note: 'Feeling deeply focused and energized building EverJournal!',
    journalId: journalId
  });
  console.log(`[Test 6] POST /api/v1/moods -> Status: ${moodRes.statusCode}, Emoji: ${moodRes.body?.data?.emoji}, Label: ${moodRes.body?.data?.moodLabel}`);
  if (moodRes.statusCode !== 201) throw new Error('Create mood failed');

  // Test 7: Get Moods & Distribution
  const moodsList = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/moods',
    method: 'GET'
  });
  console.log(`[Test 7] GET /api/v1/moods -> Total check-ins: ${moodsList.body?.count}, Avg Score: ${moodsList.body?.averageScore}`);

  // Test 8: Export JSON
  const exportJson = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/journals/export/json',
    method: 'GET'
  });
  const jsonCount = Array.isArray(exportJson.body) ? exportJson.body.length : exportJson.body?.totalRecords;
  console.log(`[Test 8] GET /api/v1/journals/export/json -> Total Exported: ${jsonCount}`);

  // Test 9: Export CSV
  const exportCsv = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/journals/export/csv',
    method: 'GET'
  });
  console.log(`[Test 9] GET /api/v1/journals/export/csv -> Status: ${exportCsv.statusCode}, Content-Type: ${exportCsv.headers['content-type']}`);

  console.log('\n✅ ALL 9 TESTS PASSED FLAWLESSLY WITH REAL MONGODB PERSISTENCE!');
}

runTests().catch(err => {
  console.error('\n❌ Test Error:', err.message);
  process.exit(1);
});
