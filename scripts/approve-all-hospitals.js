// Script to approve all hospitals
const Parse = require('parse/node');

Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g',
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI',
  'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1'
);
Parse.serverURL = 'https://parseapi.back4app.com';

async function approveHospitals() {
  try {
    console.log('🏥 Approving all hospitals...\n');
    
    const query = new Parse.Query('HospitalProfile');
    const hospitals = await query.find({ useMasterKey: true });
    
    console.log(`Found ${hospitals.length} hospitals\n`);
    
    for (const hospital of hospitals) {
      const name = hospital.get('hospitalName') || 'Unknown';
      const status = hospital.get('verificationStatus');
      const username = hospital.get('user')?.get('username') || 'Unknown';
      
      console.log(`Hospital: ${name} (${username})`);
      console.log(`  Current status: ${status}`);
      
      if (status !== 'Approved') {
        hospital.set('verificationStatus', 'Approved');
        hospital.set('approvedAt', new Date());
        await hospital.save(null, { useMasterKey: true });
        console.log(`  ✅ Status updated to: Approved`);
      } else {
        console.log(`  ✓ Already approved`);
      }
      console.log('');
    }
    
    console.log('✅ All hospitals approved!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

approveHospitals()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
