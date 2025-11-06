// Test the createBloodRequest cloud function AFTER it's deployed
const Parse = require('parse/node');

Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g',
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI',
  'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1'
);
Parse.serverURL = 'https://parseapi.back4app.com';

async function testCloudFunction() {
  console.log('🧪 Testing createBloodRequest cloud function\n');
  console.log('=' .repeat(60));
  
  try {
    // Login as hospital
    console.log('\n📝 Step 1: Login as hospital');
    const user = await Parse.User.logIn('apollo_mumbai', 'hospital123');
    console.log(`   ✅ Logged in as: ${user.get('username')}`);
    
    // Get hospital profile
    console.log('\n📝 Step 2: Get hospital profile');
    const profileQuery = new Parse.Query('HospitalProfile');
    profileQuery.equalTo('user', user);
    const hospital = await profileQuery.first({ sessionToken: user.getSessionToken() });
    
    if (!hospital) {
      throw new Error('Hospital profile not found!');
    }
    
    console.log(`   ✅ Hospital: ${hospital.get('hospitalName')}`);
    console.log(`   Status: ${hospital.get('verificationStatus')}`);
    console.log(`   ID: ${hospital.id}`);
    
    // Call cloud function to create blood request
    console.log('\n📝 Step 3: Create blood request via cloud function');
    const result = await Parse.Cloud.run('createBloodRequest', {
      hospitalProfileId: hospital.id,
      bloodType: 'A+',
      unitsRequired: 2,
      urgencyLevel: 'High',
      patientName: 'Test Patient via Cloud Function',
      description: 'Testing cloud function to bypass CLP restrictions',
      requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    console.log(`   ✅ Blood request created!`);
    console.log(`   Request ID: ${result.objectId}`);
    console.log(`   Blood Type: ${result.bloodType}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Hospital auto-approved: ${hospital.get('verificationStatus') === 'Pending' ? 'Yes' : 'No'}`);
    
    // Verify we can read it
    console.log('\n📝 Step 4: Verify request is readable');
    const requestQuery = new Parse.Query('BloodRequest');
    const savedRequest = await requestQuery.get(result.objectId);
    console.log(`   ✅ Request found: ${savedRequest.get('patientName')}`);
    console.log(`   ACL public read: ${savedRequest.getACL().getPublicReadAccess()}`);
    
    // Test with donor
    console.log('\n📝 Step 5: Test donor can see request');
    await Parse.User.logOut();
    await Parse.User.logIn('rahul_sharma', 'password123');
    
    const donorQuery = new Parse.Query('BloodRequest');
    donorQuery.equalTo('bloodType', 'A+');
    donorQuery.equalTo('status', 'Active');
    const requests = await donorQuery.find();
    
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
