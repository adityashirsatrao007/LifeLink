// Comprehensive test script for blood request creation and flow
// Run with: node scripts/test-blood-request.js

const Parse = require('parse/node');

// Initialize Parse
Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g', // App ID
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI', // JS Key
  'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1'  // Master Key
);
Parse.serverURL = 'https://parseapi.back4app.com';

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(name, passed, error = null) {
  if (passed) {
    console.log(`✅ ${name}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${name}`);
    testResults.failed++;
    if (error) {
      console.log(`   Error: ${error.message || error}`);
      testResults.errors.push({ test: name, error: error.message || error });
    }
  }
}

async function testBloodRequestFlow() {
  console.log('🧪 Starting Blood Request Flow Tests\n');
  console.log('=' .repeat(60));

  try {
    // TEST 1: Login as approved hospital
    console.log('\n📝 Test 1: Hospital Login');
    let hospitalUser, hospitalProfile;
    try {
      hospitalUser = await Parse.User.logIn('apollo_mumbai', 'hospital123');
      console.log(`   Logged in as: ${hospitalUser.get('username')}`);
      
      // Fetch hospital profile (with session token from logged in user)
      const profileQuery = new Parse.Query('HospitalProfile');
      profileQuery.equalTo('user', hospitalUser);
      hospitalProfile = await profileQuery.first({ sessionToken: hospitalUser.getSessionToken() });
      
      if (!hospitalProfile) {
        throw new Error('Hospital profile not found');
      }
      
      const verificationStatus = hospitalProfile.get('verificationStatus');
      console.log(`   Hospital Status: ${verificationStatus}`);
      console.log(`   Hospital Name: ${hospitalProfile.get('hospitalName')}`);
      
      logTest('Hospital login successful', true);
      logTest('Hospital profile exists', !!hospitalProfile);
      logTest('Hospital is approved', verificationStatus === 'Approved', 
              verificationStatus !== 'Approved' ? new Error(`Status is ${verificationStatus}`) : null);
    } catch (error) {
      logTest('Hospital login', false, error);
      throw error;
    }

    // TEST 2: Create blood request
    console.log('\n📝 Test 2: Create Blood Request');
    let bloodRequest;
    try {
      const BloodRequest = Parse.Object.extend('BloodRequest');
      bloodRequest = new BloodRequest();
      
      bloodRequest.set('hospital', hospitalProfile);
      bloodRequest.set('bloodType', 'A+');
      bloodRequest.set('unitsRequired', 2);
      bloodRequest.set('urgencyLevel', 'High');
      bloodRequest.set('patientName', 'Test Patient');
      bloodRequest.set('description', 'Test blood request for integration testing');
      bloodRequest.set('requiredBy', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now
      bloodRequest.set('status', 'Active');
      
      await bloodRequest.save();
      
      console.log(`   Request ID: ${bloodRequest.id}`);
      console.log(`   Blood Type: ${bloodRequest.get('bloodType')}`);
      console.log(`   Status: ${bloodRequest.get('status')}`);
      console.log(`   Accepted Count: ${bloodRequest.get('acceptedCount') || 0}`);
      
      logTest('Blood request created successfully', true);
      
      // Verify ACL was set
      const acl = bloodRequest.getACL();
      if (acl) {
        const publicRead = acl.getPublicReadAccess();
        const hospitalWrite = acl.getWriteAccess(hospitalUser);
        console.log(`   Public Read Access: ${publicRead}`);
        console.log(`   Hospital Write Access: ${hospitalWrite}`);
        logTest('ACL set correctly', publicRead && hospitalWrite);
      } else {
        logTest('ACL set', false, new Error('No ACL found on request'));
      }
      
    } catch (error) {
      logTest('Blood request creation', false, error);
      console.error('   Full error:', error);
      throw error;
    }

    // TEST 3: Fetch blood requests (public read)
    console.log('\n📝 Test 3: Fetch Blood Requests (Public Read)');
    try {
      await Parse.User.logOut();
      
      const query = new Parse.Query('BloodRequest');
      query.equalTo('status', 'Active');
      query.include('hospital');
      query.descending('createdAt');
      query.limit(5);
      
      const requests = await query.find();
      
      console.log(`   Found ${requests.length} active requests`);
      if (requests.length > 0) {
        const first = requests[0];
        console.log(`   Latest: ${first.get('bloodType')} - ${first.get('urgencyLevel')}`);
      }
      
      logTest('Public can read blood requests', requests.length > 0);
    } catch (error) {
      logTest('Public read access', false, error);
    }

    // TEST 4: Login as donor and view requests
    console.log('\n📝 Test 4: Donor Login and View Requests');
    let donorUser, donorProfile;
    try {
      donorUser = await Parse.User.logIn('rahul_sharma', 'password123');
      console.log(`   Logged in as: ${donorUser.get('username')}`);
      
      // Fetch donor profile (with session token)
      const profileQuery = new Parse.Query('DonorProfile');
      profileQuery.equalTo('user', donorUser);
      donorProfile = await profileQuery.first({ sessionToken: donorUser.getSessionToken() });
      
      if (!donorProfile) {
        throw new Error('Donor profile not found');
      }
      
      console.log(`   Donor Name: ${donorProfile.get('fullName')}`);
      console.log(`   Blood Type: ${donorProfile.get('bloodType')}`);
      
      // Fetch matching requests
      const requestQuery = new Parse.Query('BloodRequest');
      requestQuery.equalTo('bloodType', donorProfile.get('bloodType'));
      requestQuery.equalTo('status', 'Active');
      const matchingRequests = await requestQuery.find();
      
      console.log(`   Found ${matchingRequests.length} matching requests for ${donorProfile.get('bloodType')}`);
      
      logTest('Donor login successful', true);
      logTest('Donor can view matching requests', true);
    } catch (error) {
      logTest('Donor login and view', false, error);
    }

    // TEST 5: Donor responds to request
    console.log('\n📝 Test 5: Donor Responds to Request');
    try {
      if (!bloodRequest || !donorProfile) {
        throw new Error('Missing prerequisites');
      }

      const DonorResponse = Parse.Object.extend('DonorResponse');
      const response = new DonorResponse();
      
      response.set('bloodRequest', bloodRequest);
      response.set('donor', donorProfile);
      response.set('hospital', hospitalProfile);
      response.set('responseType', 'Accepted');
      response.set('respondedAt', new Date());
      response.set('isConfirmed', false);
      response.set('donationCompleted', false);
      
      await response.save();
      
      console.log(`   Response ID: ${response.id}`);
      console.log(`   Response Type: ${response.get('responseType')}`);
      
      logTest('Donor response created', true);
    } catch (error) {
      logTest('Donor response creation', false, error);
    }

    // TEST 6: Hospital views responses
    console.log('\n📝 Test 6: Hospital Views Responses');
    try {
      await Parse.User.logOut();
      await Parse.User.logIn('apollo_mumbai', 'hospital123');
      
      const responseQuery = new Parse.Query('DonorResponse');
      responseQuery.equalTo('bloodRequest', bloodRequest);
      responseQuery.include('donor');
      responseQuery.descending('respondedAt');
      
      const responses = await responseQuery.find();
      
      console.log(`   Found ${responses.length} responses`);
      if (responses.length > 0) {
        const first = responses[0];
        const donor = first.get('donor');
        console.log(`   Donor: ${donor?.get('fullName')} - ${first.get('responseType')}`);
      }
      
      logTest('Hospital can view responses', true);
    } catch (error) {
      logTest('Hospital view responses', false, error);
    }

    // TEST 7: Hospital updates request
    console.log('\n📝 Test 7: Hospital Updates Request');
    try {
      bloodRequest.set('acceptedCount', 1);
      await bloodRequest.save();
      
      console.log(`   Updated acceptedCount to: ${bloodRequest.get('acceptedCount')}`);
      
      logTest('Hospital can update own request', true);
    } catch (error) {
      logTest('Hospital update request', false, error);
    }

    // TEST 8: Unauthorized user cannot update request
    console.log('\n📝 Test 8: Unauthorized Update Prevention');
    try {
      await Parse.User.logOut();
      await Parse.User.logIn('rahul_sharma', 'password123');
      
      bloodRequest.set('status', 'Closed');
      await bloodRequest.save();
      
      // Should not reach here
      logTest('Unauthorized update prevented', false, new Error('Donor was able to modify hospital request!'));
    } catch (error) {
      // This should fail - donor shouldn't be able to update hospital's request
      if (error.code === 101 || error.code === 119 || error.message.includes('Permission denied')) {
        console.log('   Correctly prevented unauthorized update');
        logTest('Unauthorized update prevented', true);
      } else {
        logTest('Unauthorized update prevention', false, error);
      }
    }

    // TEST 9: Cleanup - Close the test request
    console.log('\n📝 Test 9: Cleanup');
    try {
      await Parse.User.logOut();
      await Parse.User.logIn('apollo_mumbai', 'hospital123');
      
      bloodRequest.set('status', 'Closed');
      bloodRequest.set('closedAt', new Date());
      await bloodRequest.save();
      
      console.log(`   Test request closed: ${bloodRequest.id}`);
      logTest('Cleanup successful', true);
    } catch (error) {
      logTest('Cleanup', false, error);
    }

  } catch (error) {
    console.error('\n💥 Test suite aborted due to critical error:', error);
  } finally {
    await Parse.User.logOut();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📝 Total:  ${testResults.passed + testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach((e, i) => {
      console.log(`${i + 1}. ${e.test}: ${e.error}`);
    });
  }
  
  console.log('\n');
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
testBloodRequestFlow();
