const Parse = require('parse/node');

// Initialize Parse
Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g', // App ID
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI', // JS Key
  'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1'  // Master Key
);
Parse.serverURL = 'https://parseapi.back4app.com';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const INDIAN_STATES = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal', 'Uttar Pradesh'];
const CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore'],
  'Delhi': ['New Delhi', 'East Delhi', 'North Delhi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
  'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur'],
  'West Bengal': ['Kolkata', 'Darjeeling', 'Siliguri'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi']
};

async function createDonors() {
  console.log('\n📋 Creating Donors...');
  const donors = [];

  const donorData = [
    { username: 'rahul_sharma', email: 'rahul@example.com', fullName: 'Rahul Sharma', bloodType: 'O+', phone: '9876543210', state: 'Maharashtra', city: 'Mumbai' },
    { username: 'priya_patel', email: 'priya@example.com', fullName: 'Priya Patel', bloodType: 'A+', phone: '9876543211', state: 'Gujarat', city: 'Ahmedabad' },
    { username: 'amit_kumar', email: 'amit@example.com', fullName: 'Amit Kumar', bloodType: 'B+', phone: '9876543212', state: 'Delhi', city: 'New Delhi' },
    { username: 'sneha_reddy', email: 'sneha@example.com', fullName: 'Sneha Reddy', bloodType: 'AB+', phone: '9876543213', state: 'Tamil Nadu', city: 'Chennai' },
    { username: 'vikram_singh', email: 'vikram@example.com', fullName: 'Vikram Singh', bloodType: 'O-', phone: '9876543214', state: 'Rajasthan', city: 'Jaipur' },
    { username: 'anjali_mehta', email: 'anjali@example.com', fullName: 'Anjali Mehta', bloodType: 'A-', phone: '9876543215', state: 'Karnataka', city: 'Bangalore' },
    { username: 'rohan_das', email: 'rohan@example.com', fullName: 'Rohan Das', bloodType: 'B-', phone: '9876543216', state: 'West Bengal', city: 'Kolkata' },
    { username: 'kavya_nair', email: 'kavya@example.com', fullName: 'Kavya Nair', bloodType: 'AB-', phone: '9876543217', state: 'Karnataka', city: 'Bangalore' },
    { username: 'arjun_verma', email: 'arjun@example.com', fullName: 'Arjun Verma', bloodType: 'O+', phone: '9876543218', state: 'Uttar Pradesh', city: 'Lucknow' },
    { username: 'pooja_gupta', email: 'pooja@example.com', fullName: 'Pooja Gupta', bloodType: 'A+', phone: '9876543219', state: 'Maharashtra', city: 'Pune' },
  ];

  for (const data of donorData) {
    try {
      const user = new Parse.User();
      user.set('username', data.username);
      user.set('email', data.email);
      user.set('password', 'password123'); // Simple password for testing
      user.set('userType', 'Donor');

      const newUser = await user.signUp();
      console.log(`✅ Created donor: ${data.fullName}`);

      // Wait a bit for cloud code to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Query the profile that was auto-created by cloud code
      const DonorProfile = Parse.Object.extend('DonorProfile');
      const query = new Parse.Query(DonorProfile);
      query.equalTo('user', newUser);
      let profile = await query.first({ useMasterKey: true });

      if (!profile) {
        // If profile wasn't created, create it manually
        profile = new DonorProfile();
        profile.set('user', newUser);
      }

      // Update profile with detailed data
      profile.set('fullName', data.fullName);
      profile.set('phoneNumber', data.phone);
      profile.set('bloodType', data.bloodType);
      profile.set('dateOfBirth', new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1));
      profile.set('address', `${Math.floor(Math.random() * 500) + 1}, MG Road`);
      profile.set('city', data.city);
      profile.set('state', data.state);
      profile.set('pinCode', `${Math.floor(Math.random() * 900000) + 100000}`);
      profile.set('isAvailable', true);
      profile.set('lastDonationDate', null);
      profile.set('latitude', 19.0760 + (Math.random() * 10 - 5));
      profile.set('longitude', 72.8777 + (Math.random() * 10 - 5));

      await profile.save(null, { useMasterKey: true });
      donors.push({ user: newUser, profile });
    } catch (error) {
      console.log(`⚠️  Donor ${data.username} might already exist: ${error.message}`);
    }
  }

  console.log(`✅ Created ${donors.length} donors`);
  return donors;
}

async function createHospitals() {
  console.log('\n🏥 Creating Hospitals...');
  const hospitals = [];

  const hospitalData = [
    { 
      username: 'apollo_mumbai', 
      email: 'apollo@example.com', 
      name: 'Apollo Hospital Mumbai', 
      license: 'LIC-MH-001',
      contactPerson: 'Dr. Rajesh Kumar',
      designation: 'Blood Bank Director',
      type: 'Multispecialty',
      state: 'Maharashtra',
      city: 'Mumbai'
    },
    { 
      username: 'fortis_bangalore', 
      email: 'fortis@example.com', 
      name: 'Fortis Hospital Bangalore', 
      license: 'LIC-KA-002',
      contactPerson: 'Dr. Meera Iyer',
      designation: 'Head of Hematology',
      type: 'Multispecialty',
      state: 'Karnataka',
      city: 'Bangalore'
    },
    { 
      username: 'aiims_delhi', 
      email: 'aiims@example.com', 
      name: 'AIIMS Delhi', 
      license: 'LIC-DL-003',
      contactPerson: 'Dr. Suresh Sharma',
      designation: 'Blood Bank In-charge',
      type: 'Government',
      state: 'Delhi',
      city: 'New Delhi'
    },
    { 
      username: 'manipal_chennai', 
      email: 'manipal@example.com', 
      name: 'Manipal Hospital Chennai', 
      license: 'LIC-TN-004',
      contactPerson: 'Dr. Lakshmi Nair',
      designation: 'Blood Bank Manager',
      type: 'Multispecialty',
      state: 'Tamil Nadu',
      city: 'Chennai'
    },
    { 
      username: 'max_delhi', 
      email: 'max@example.com', 
      name: 'Max Hospital Delhi', 
      license: 'LIC-DL-005',
      contactPerson: 'Dr. Anita Malhotra',
      designation: 'Transfusion Medicine Head',
      type: 'Multispecialty',
      state: 'Delhi',
      city: 'New Delhi'
    },
  ];

  for (const data of hospitalData) {
    try {
      const user = new Parse.User();
      user.set('username', data.username);
      user.set('email', data.email);
      user.set('password', 'hospital123'); // Simple password for testing
      user.set('userType', 'Hospital');

      const newUser = await user.signUp();
      console.log(`✅ Created hospital: ${data.name}`);

      // Wait a bit for cloud code to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Query the profile that was auto-created by cloud code
      const HospitalProfile = Parse.Object.extend('HospitalProfile');
      const query = new Parse.Query(HospitalProfile);
      query.equalTo('user', newUser);
      let profile = await query.first({ useMasterKey: true });

      if (!profile) {
        // If profile wasn't created, create it manually
        profile = new HospitalProfile();
        profile.set('user', newUser);
      }

      // Update profile with detailed data
      profile.set('hospitalName', data.name);
      profile.set('licenseNumber', data.license);
      profile.set('phoneNumber', `011-${Math.floor(Math.random() * 9000000) + 1000000}`);
      profile.set('contactPersonName', data.contactPerson);
      profile.set('contactPersonDesignation', data.designation);
      profile.set('hospitalType', data.type);
      profile.set('address', `${Math.floor(Math.random() * 200) + 1}, Medical District`);
      profile.set('city', data.city);
      profile.set('state', data.state);
      profile.set('pinCode', `${Math.floor(Math.random() * 900000) + 100000}`);
      profile.set('isVerified', true); // Auto-approve for testing
      profile.set('verificationStatus', 'Approved');
      profile.set('latitude', 19.0760 + (Math.random() * 10 - 5));
      profile.set('longitude', 72.8777 + (Math.random() * 10 - 5));

      await profile.save(null, { useMasterKey: true });
      hospitals.push({ user: newUser, profile });
    } catch (error) {
      console.log(`⚠️  Hospital ${data.username} might already exist: ${error.message}`);
    }
  }

  console.log(`✅ Created ${hospitals.length} hospitals`);
  return hospitals;
}

async function createBloodRequests(hospitals) {
  console.log('\n🩸 Creating Blood Requests...');
  let requestCount = 0;

  const urgencyLevels = ['Critical', 'High', 'Medium', 'Low'];
  
  for (const hospital of hospitals) {
    // Create 2-3 blood requests per hospital
    const numRequests = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < numRequests; i++) {
      try {
        const BloodRequest = Parse.Object.extend('BloodRequest');
        const request = new BloodRequest();
        
        const bloodType = BLOOD_TYPES[Math.floor(Math.random() * BLOOD_TYPES.length)];
        const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
        const quantity = Math.floor(Math.random() * 4) + 1; // 1-4 units
        const status = Math.random() > 0.3 ? 'Active' : 'Fulfilled';
        
        request.set('hospital', hospital.user);
        request.set('hospitalProfile', hospital.profile);
        request.set('bloodType', bloodType);
        request.set('unitsRequired', quantity);
        request.set('urgencyLevel', urgency);
        request.set('status', status);
        request.set('requiredBy', new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)); // Within next 7 days
        request.set('patientName', `Patient-${Math.floor(Math.random() * 1000)}`);
        request.set('description', `Urgent requirement for ${bloodType} blood. ${urgency} priority case.`);
        request.set('acceptedCount', status === 'Fulfilled' ? quantity : Math.floor(Math.random() * quantity));

        await request.save(null, { useMasterKey: true });
        requestCount++;
        console.log(`✅ Created ${urgency} request for ${bloodType} at ${hospital.profile.get('hospitalName')}`);
      } catch (error) {
        console.log(`⚠️  Error creating request: ${error.message}`);
      }
    }
  }

  console.log(`✅ Created ${requestCount} blood requests`);
}

async function createAdmin() {
  console.log('\n👨‍💼 Creating Admin User...');
  
  try {
    const user = new Parse.User();
    user.set('username', 'admin');
    user.set('email', 'admin@lifelink.com');
    user.set('password', 'admin123');
    user.set('userType', 'Admin');

    await user.signUp();
    console.log('✅ Created admin user (username: admin, password: admin123)');
  } catch (error) {
    console.log(`⚠️  Admin might already exist: ${error.message}`);
  }
}

async function createNotifications(donors, hospitals) {
  console.log('\n🔔 Creating Sample Notifications...');
  let notifCount = 0;

  // Create a few notifications for donors
  for (let i = 0; i < Math.min(5, donors.length); i++) {
    try {
      const Notification = Parse.Object.extend('Notification');
      const notif = new Notification();
      
      const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
      const bloodType = BLOOD_TYPES[Math.floor(Math.random() * BLOOD_TYPES.length)];
      
      notif.set('user', donors[i].user);
      notif.set('type', 'BloodRequest');
      notif.set('title', 'New Blood Request Match');
      notif.set('message', `${hospital.profile.get('hospitalName')} needs ${bloodType} blood urgently.`);
      notif.set('isRead', false);
      notif.set('data', { hospitalName: hospital.profile.get('hospitalName'), bloodType });

      await notif.save(null, { useMasterKey: true });
      notifCount++;
    } catch (error) {
      console.log(`⚠️  Error creating notification: ${error.message}`);
    }
  }

  console.log(`✅ Created ${notifCount} notifications`);
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  console.log('================================================');

  try {
    // Create admin first
    await createAdmin();

    // Create donors
    const donors = await createDonors();

    // Create hospitals
    const hospitals = await createHospitals();

    // Create blood requests
    if (hospitals.length > 0) {
      await createBloodRequests(hospitals);
    }

    // Create notifications
    if (donors.length > 0 && hospitals.length > 0) {
      await createNotifications(donors, hospitals);
    }

    console.log('\n================================================');
    console.log('✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Admin: 1 user (username: admin, password: admin123)`);
    console.log(`   - Donors: ${donors.length} users (password: password123)`);
    console.log(`   - Hospitals: ${hospitals.length} users (password: hospital123)`);
    console.log(`   - Blood Requests: Created multiple requests`);
    console.log(`   - Notifications: Created sample notifications`);
    console.log('\n🎉 You can now login with any of these accounts!');
    console.log('\n💡 Sample Logins:');
    console.log('   Donor: rahul_sharma / password123');
    console.log('   Hospital: apollo_mumbai / hospital123');
    console.log('   Admin: admin / admin123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeder
seedDatabase();
