const Parse = require('parse/node');

// Initialize Parse
Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g', // App ID
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI'  // JS Key
);
Parse.serverURL = 'https://parseapi.back4app.com';

async function registerPendingHospitals() {
  console.log('\n🏥 Registering New Hospitals with Pending Status...\n');

  const testHospitals = [
    {
      username: 'lilavati_mumbai',
      email: 'lilavati@test.com',
      password: 'test123',
      hospitalName: 'Lilavati Hospital',
      licenseNumber: 'LIC-MH-006',
      phoneNumber: '022-26567891',
      contactPersonName: 'Dr. Priya Shah',
      contactPersonDesignation: 'Medical Director',
      hospitalType: 'Multispecialty',
      address: '456, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400050'
    },
    {
      username: 'cmch_vellore',
      email: 'cmch@test.com',
      password: 'test123',
      hospitalName: 'Christian Medical College',
      licenseNumber: 'LIC-TN-007',
      phoneNumber: '0416-2282020',
      contactPersonName: 'Dr. Samuel Thomas',
      contactPersonDesignation: 'Blood Bank Head',
      hospitalType: 'Medical College',
      address: 'CMC Campus, Ida Scudder Road',
      city: 'Vellore',
      state: 'Tamil Nadu',
      pinCode: '632004'
    },
    {
      username: 'medanta_gurgaon',
      email: 'medanta@test.com',
      password: 'test123',
      hospitalName: 'Medanta The Medicity',
      licenseNumber: 'LIC-HR-008',
      phoneNumber: '0124-4141414',
      contactPersonName: 'Dr. Neha Gupta',
      contactPersonDesignation: 'Transfusion Medicine',
      hospitalType: 'Multispecialty',
      address: 'Sector 38, Golf Course Road',
      city: 'Gurgaon',
      state: 'Haryana',
      pinCode: '122001'
    }
  ];

  let successCount = 0;

  for (const data of testHospitals) {
    try {
      // Register user
      const user = new Parse.User();
      user.set('username', data.username);
      user.set('email', data.email);
      user.set('password', data.password);
      user.set('userType', 'Hospital');

      await user.signUp();
      console.log(`✅ Created user: ${data.username}`);

      // Wait for cloud code to create profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Login to update profile
      await Parse.User.logIn(data.username, data.password);

      // Query the profile
      const query = new Parse.Query('HospitalProfile');
      query.equalTo('user', Parse.User.current());
      const profile = await query.first();

      if (profile) {
        // Update profile with details (but keep Pending status)
        profile.set('hospitalName', data.hospitalName);
        profile.set('licenseNumber', data.licenseNumber);
        profile.set('phoneNumber', data.phoneNumber);
        profile.set('contactPersonName', data.contactPersonName);
        profile.set('contactPersonDesignation', data.contactPersonDesignation);
        profile.set('hospitalType', data.hospitalType);
        profile.set('address', data.address);
        profile.set('city', data.city);
        profile.set('state', data.state);
        profile.set('pinCode', data.pinCode);
        // Don't set isVerified or verificationStatus - let cloud code defaults stay

        await profile.save();
        console.log(`   ✅ Updated profile for: ${data.hospitalName}`);
        console.log(`   📋 Status: ${profile.get('verificationStatus')}`);
      }

      // Logout
      await Parse.User.logOut();
      successCount++;

    } catch (error) {
      console.log(`   ⚠️  Error with ${data.username}: ${error.message}`);
    }
  }

  console.log('\n================================================');
  console.log(`✅ Successfully registered ${successCount} hospitals with Pending status!`);
  console.log('\n📋 Test Hospitals Created:');
  console.log('   1. Lilavati Hospital (lilavati_mumbai / test123)');
  console.log('   2. Christian Medical College (cmch_vellore / test123)');
  console.log('   3. Medanta The Medicity (medanta_gurgaon / test123)');
  console.log('\n🎯 Now login as admin to approve/reject these hospitals:');
  console.log('   Admin: admin / admin123');
  console.log('   Dashboard: http://localhost:3000/admin/dashboard\n');
}

// Run the script
registerPendingHospitals();
