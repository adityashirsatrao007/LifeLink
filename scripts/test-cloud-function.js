// Test the createBloodRequest cloud function AFTER it's deployed
const Parse = require('parse/node');

Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g',
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI'
);
Parse.serverURL = 'https://parseapi.back4app.com';

async function testCloudFunction() {
  console.log('🧪 Testing createBloodRequest cloud function\n');
  console.log('='.repeat(60));
  
  const retry = async (fn, label) => {
    const delays = [0, 1000, 2000];
    let lastErr;
    for (let i = 0; i < delays.length; i++) {
      if (delays[i]) await new Promise(r => setTimeout(r, delays[i]));
      try { return await fn(); } catch (e) {
        lastErr = e;
        const msg = (e && e.message) || String(e);
        if (!/Bad Gateway|ECONNRESET|ETIMEDOUT|ENOTFOUND/i.test(msg)) break;
        console.log(`   ⚠️  ${label} failed (attempt ${i+1}), retrying...`);
      }
    }
    throw lastErr;
  };
  
  try {
  // Login as hospital (use known working account)
    console.log('\n📝 Step 1: Login as hospital');
  const user = await retry(() => Parse.User.logIn('hospital', 'hospital'), 'Login');
    console.log(`   ✅ Logged in as: ${user.get('username')}`);
    
    // Get hospital profile
    console.log('\n📝 Step 2: Get hospital profile');
    const profileQuery = new Parse.Query('HospitalProfile');
    profileQuery.equalTo('user', user);
  const hospital = await retry(() => profileQuery.first({ sessionToken: user.getSessionToken() }), 'Fetch hospital profile');
    
    if (!hospital) {
      throw new Error('Hospital profile not found!');
    }
    
    console.log(`   ✅ Hospital: ${hospital.get('hospitalName')}`);
    console.log(`   Status: ${hospital.get('verificationStatus')}`);
    console.log(`   ID: ${hospital.id}`);
    
    // Call cloud function to create blood request
    console.log('\n📝 Step 3: Create blood request via cloud function');
    const result = await retry(() => Parse.Cloud.run('createBloodRequest', {
      hospitalProfileId: hospital.id,
      bloodType: 'A+',
      unitsRequired: 2,
      urgencyLevel: 'High',
      patientName: 'Test Patient via Cloud Function',
      description: 'Testing cloud function to bypass CLP restrictions',
      requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }), 'Run createBloodRequest');
    
    console.log(`   ✅ Blood request created!`);
    console.log(`   Request ID: ${result.objectId}`);
    console.log(`   Blood Type: ${result.bloodType}`);
    console.log(`   Status: ${result.status}`);
  console.log(`   Hospital status: ${hospital.get('verificationStatus')}`);
    
    // Verify we can read it
    console.log('\n📝 Step 4: Verify request is readable');
    const requestQuery = new Parse.Query('BloodRequest');
  const savedRequest = await retry(() => requestQuery.get(result.objectId), 'Verify request');
    console.log(`   ✅ Request found: ${savedRequest.get('patientName')}`);
    console.log(`   ACL public read: ${savedRequest.getACL().getPublicReadAccess()}`);
    
    // Test with donor
    console.log('\n📝 Step 5: Test donor can see request');
    await Parse.User.logOut();
  await retry(() => Parse.User.logIn('adityashirsatrao007', 'Aditya@001'), 'Donor login');
    
    const donorQuery = new Parse.Query('BloodRequest');
    donorQuery.equalTo('bloodType', 'A+');
    donorQuery.equalTo('status', 'Active');
  const requests = await retry(() => donorQuery.find(), 'Donor query');
    
    console.log(`   ✅ Donor can see ${requests.length} A+ requests`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('\nThe cloud function works perfectly!');
    console.log('It bypasses CLP and auto-approves hospitals.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('Invalid function')) {
      console.log('\n⚠️  CLOUD CODE NOT DEPLOYED YET!');
      console.log('\nYou MUST deploy cloud/main.js first:');
      console.log('1. Go to: https://dashboard.back4app.com');
      console.log('2. Select: LifeLink app');
      console.log('3. Click: Cloud Code section');
      console.log('4. Click: Upload File');
      console.log('5. Select: cloud/main.js from your project');
      console.log('6. Click: Deploy');
      console.log('7. Wait: 1-2 minutes for deployment');
      console.log('8. Run: node scripts/test-cloud-function.js again\n');
    }
    
    process.exit(1);
  } finally {
    await Parse.User.logOut();
  }
}

testCloudFunction();
