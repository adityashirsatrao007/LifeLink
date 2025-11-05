const Parse = require('parse/node');

// Initialize Parse
Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g',
  'unused',
  'TwFIrJbyR8SHlqYpHJ6TWKlDdW3n8VEYCrqLnPCx'
);
Parse.serverURL = 'https://parseapi.back4app.com';

async function listApprovedHospitals() {
  try {
    const query = new Parse.Query('HospitalProfile');
    query.include('user');
    query.equalTo('isVerified', true);
    
    const hospitals = await query.find({ useMasterKey: true });
    
    console.log('\n=== APPROVED HOSPITALS CREDENTIALS ===\n');
    console.log(`Total Approved: ${hospitals.length}\n`);
    
    hospitals.forEach((hospital, index) => {
      const user = hospital.get('user');
      console.log(`${index + 1}. ${hospital.get('hospitalName') || 'N/A'}`);
      console.log(`   Username: ${user?.get('username') || 'N/A'}`);
      console.log(`   Password: hospital123 (default for seeded data)`);
      console.log(`   Email: ${user?.get('email') || 'N/A'}`);
      console.log(`   License: ${hospital.get('licenseNumber') || 'N/A'}`);
      console.log(`   Type: ${hospital.get('hospitalType') || 'N/A'}`);
      console.log(`   Phone: ${hospital.get('phoneNumber') || 'N/A'}`);
      console.log(`   Address: ${hospital.get('address') || 'N/A'}`);
      console.log(`   City: ${hospital.get('city') || 'N/A'}, ${hospital.get('state') || 'N/A'}`);
      console.log(`   Status: ${hospital.get('verificationStatus') || 'N/A'}`);
      console.log('   ---');
    });
    
    console.log('\n=== QUICK REFERENCE ===\n');
    hospitals.forEach((hospital, index) => {
      const user = hospital.get('user');
      console.log(`${index + 1}. ${hospital.get('hospitalName')} - ${user?.get('username')} / hospital123`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listApprovedHospitals();
