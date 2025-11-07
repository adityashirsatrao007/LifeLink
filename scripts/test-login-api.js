// Test the Next.js server-side login API using real credentials
// Requires the dev server to be running on http://localhost:3000

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function retry(fn, attempts = 10, delayMs = 2000, label = 'op') {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const msg = (e && e.message) || String(e);
      console.log(`⚠️  ${label} failed (attempt ${i}/${attempts}): ${msg}`);
      if (i < attempts) await sleep(delayMs);
    }
  }
  throw lastErr;
}

async function postLogin(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 200)}`); }
  if (!res.ok || !json?.ok) {
    throw new Error(`HTTP ${res.status}: ${json?.error || 'Unknown error'}`);
  }
  return json;
}

async function main() {
  console.log(`\n🧪 Testing /api/auth/login on ${BASE_URL}\n`);

  // Hospital
  console.log('📝 Hospital login...');
  const hospital = await retry(() => postLogin('hospital', 'hospital'), 10, 2000, 'hospital login');
  console.log('   ✅ OK');
  console.log(`   user: ${hospital.user?.username} type: ${hospital.userType} session: ${hospital.sessionToken?.slice(0,8)}...`);

  // Donor
  console.log('📝 Donor login...');
  const donor = await retry(() => postLogin('adityashirsatrao007', 'Aditya@001'), 10, 2000, 'donor login');
  console.log('   ✅ OK');
  console.log(`   user: ${donor.user?.username} type: ${donor.userType} session: ${donor.sessionToken?.slice(0,8)}...`);

  console.log('\n✅ Login API tests passed.');
}

main().catch(err => {
  console.error('\n❌ Login API test failed:', err.message);
  process.exit(1);
});
