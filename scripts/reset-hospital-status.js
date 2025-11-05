const Parse = require('parse/node');

// Initialize Parse
Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g', // App ID
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI', // JS Key
  'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1'  // Master Key
);
Parse.serverURL = 'https://parseapi.back4app.com';
Parse.masterKey = 'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1';

async function resetHospitalsStatus() {
  console.log('\n🔄 Resetting Hospital Verification Status...\n');

  try {
    // Query all hospitals
    const query = new Parse.Query('HospitalProfile');
    const hospitals = await query.find({ useMasterKey: true });

    console.log(`Found ${hospitals.length} hospitals\n`);

    if (hospitals.length === 0) {
      console.log('⚠️  No hospitals found. Run seed-data.js first!');
      return;
    }

    // Reset first 3 hospitals to "Pending" status
    const hospitalsToReset = hospitals.slice(0, 3);
    
    for (const hospital of hospitalsToReset) {
      hospital.set('verificationStatus', 'Pending');
      hospital.set('isVerified', false);
      hospital.unset('approvedBy');
      hospital.unset('approvedAt');
      hospital.unset('rejectionReason');
      
      await hospital.save(null, { useMasterKey: true });
      
      console.log(`✅ Reset to Pending: ${hospital.get('hospitalName')}`);
    }

    console.log(`\n✅ Successfully reset ${hospitalsToReset.length} hospitals to Pending status`);
    console.log('\n📋 Summary:');
    console.log(`   - Pending: ${hospitalsToReset.length}`);
    console.log(`   - Approved: ${hospitals.length - hospitalsToReset.length}`);
    console.log('\n🎯 Now login as admin to approve/reject these hospitals!');
    console.log('   Admin credentials: admin / admin123');
    console.log('   Dashboard: http://localhost:3000/admin/dashboard\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
resetHospitalsStatus();
