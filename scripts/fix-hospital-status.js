// scripts/fix-hospital-status.js
// This script checks and fixes hospital verification status
const Parse = require('parse/node');

// Initialize Parse
Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g', // App ID
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI', // JS Key
  'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1'  // Master Key
);
Parse.serverURL = 'https://parseapi.back4app.com';
Parse.User.enableUnsafeCurrentUser();

async function fixHospitalStatuses() {
  try {
    console.log('🔍 Checking hospital statuses...\n');

    // Get all hospital profiles using Master Key
    const HospitalProfile = Parse.Object.extend('HospitalProfile');
    const query = new Parse.Query(HospitalProfile);
    query.include('user');
    const hospitals = await query.find({ useMasterKey: true });

    console.log(`Found ${hospitals.length} hospitals:\n`);

    for (const hospital of hospitals) {
      const hospitalName = hospital.get('hospitalName');
      const currentStatus = hospital.get('verificationStatus');
      const user = hospital.get('user');
      
      if (user) {
        await user.fetch({ useMasterKey: true });
        const username = user.get('username');
        
        console.log(`Hospital: ${hospitalName}`);
        console.log(`Username: ${username}`);
        console.log(`Current Status: ${currentStatus}`);
        
        // Fix the status if needed
        if (currentStatus !== 'Approved') {
          hospital.set('verificationStatus', 'Approved');
          hospital.set('isVerified', true);
          await hospital.save(null, { useMasterKey: true });
          console.log('✅ Status updated to: Approved\n');
        } else {
          console.log('✅ Already approved\n');
        }
      }
    }

    console.log('✅ All hospital statuses fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixHospitalStatuses();
