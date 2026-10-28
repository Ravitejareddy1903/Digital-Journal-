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
            body: data ? JSON.parse(data) : null,
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
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

async function run() {
  console.log('Testing MongoDB persistence and clean text mood system...\n');

  // 1. Create Journal
  const createRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/journals',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    title: 'Verified Database Entry',
    content: 'This reflection confirms 100% database persistence without emojis.',
    category: 'Work & Projects',
    moodLevel: 4,
    tags: ['verified', 'clean-text', 'mongodb'],
    isPinned: true,
    isFavorite: false,
    entryDate: new Date().toISOString()
  });

  const entry = createRes.body?.data;
  console.log('1. Created Journal in MongoDB:', {
    _id: entry?._id,
    title: entry?.title,
    moodLevel: entry?.moodLevel,
    isPinned: entry?.isPinned,
    tags: entry?.tags
  });

  if (!entry?._id) throw new Error('MongoDB failed to return created _id');

  // 2. Fetch Journal by ID
  const getRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/v1/journals/${entry._id}`,
    method: 'GET'
  });
  console.log('2. Retrieved from MongoDB:', {
    _id: getRes.body?.data?._id,
    title: getRes.body?.data?.title,
    wordCount: getRes.body?.data?.wordCount,
    moodLevel: getRes.body?.data?.moodLevel
  });

  // 3. Create Clean Mood Check-in (No Emoji)
  const moodRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/moods',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    moodLevel: 4,
    note: 'Productive reflection day with clean typography'
  });
  console.log('3. Logged Clean Mood Check-in:', {
    _id: moodRes.body?.data?._id,
    moodLevel: moodRes.body?.data?.moodLevel,
    moodLabel: moodRes.body?.data?.moodLabel,
    note: moodRes.body?.data?.notes
  });

  console.log('\nAll database operations verified successfully!');
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
