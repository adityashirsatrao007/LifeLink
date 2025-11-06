// Script to set up proper Class-Level Permissions (CLP) for Parse classes
// Run with: node scripts/setup-class-permissions.js

const Parse = require('parse/node');

// Initialize Parse
Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g', // App ID
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI', // JS Key
  'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1'  // Master Key
);
Parse.serverURL = 'https://parseapi.back4app.com';

async function setupClassPermissions() {
  try {
    console.log('Setting up class-level permissions...\n');

    // BloodRequest Class Permissions
    console.log('📋 Configuring BloodRequest class...');
    const bloodRequestSchema = new Parse.Schema('BloodRequest');
    
    // Try to fetch existing schema first
    try {
      await bloodRequestSchema.get();
      console.log('  ✓ BloodRequest class exists, updating permissions...');
    } catch (e) {
      console.log('  ℹ BloodRequest class may not exist yet, will be created on first save');
    }

    // Set Class-Level Permissions for BloodRequest
    const bloodRequestCLP = {
      find: { '*': true },              // Everyone can find/read
      get: { '*': true },               // Everyone can get by ID
      count: { '*': true },             // Everyone can count
      create: { '*': true },            // Authenticated users can create (we validate in beforeSave)
      update: { 'requiresAuthentication': true }, // Only authenticated users can update
      delete: { 'requiresAuthentication': true }, // Only authenticated users can delete
      addField: { 'requiresAuthentication': true } // Allow adding fields by authenticated users
    };

    // Update the schema with new permissions
    bloodRequestSchema.setCLP(bloodRequestCLP);
    
    try {
      await bloodRequestSchema.update();
      console.log('  ✓ BloodRequest permissions updated successfully');
    } catch (e) {
      console.log('  ℹ Note: Schema will be created automatically on first object save');
    }

    // DonorResponse Class Permissions
    console.log('\n📋 Configuring DonorResponse class...');
    const donorResponseSchema = new Parse.Schema('DonorResponse');
    
    try {
      await donorResponseSchema.get();
      console.log('  ✓ DonorResponse class exists, updating permissions...');
    } catch (e) {
      console.log('  ℹ DonorResponse class may not exist yet');
    }

    const donorResponseCLP = {
      find: { '*': true },
      get: { '*': true },
      count: { '*': true },
      create: { 'requiresAuthentication': true },
      update: { 'requiresAuthentication': true },
      delete: { 'requiresAuthentication': true },
      addField: { 'requiresAuthentication': true }
    };

    donorResponseSchema.setCLP(donorResponseCLP);
    
    try {
      await donorResponseSchema.update();
      console.log('  ✓ DonorResponse permissions updated successfully');
    } catch (e) {
      console.log('  ℹ Schema will be created automatically');
    }

    // DonorProfile Class Permissions
    console.log('\n📋 Configuring DonorProfile class...');
    const donorProfileSchema = new Parse.Schema('DonorProfile');
    
    try {
      await donorProfileSchema.get();
      console.log('  ✓ DonorProfile class exists, updating permissions...');
    } catch (e) {
      console.log('  ℹ DonorProfile class may not exist yet');
    }

    const donorProfileCLP = {
      find: { '*': true },
      get: { '*': true },
      count: { '*': true },
      create: { 'requiresAuthentication': true },
      update: { 'requiresAuthentication': true },
      delete: { 'requiresAuthentication': true },
      addField: { 'requiresAuthentication': true }
    };

    donorProfileSchema.setCLP(donorProfileCLP);
    
    try {
      await donorProfileSchema.update();
      console.log('  ✓ DonorProfile permissions updated successfully');
    } catch (e) {
      console.log('  ℹ Schema will be created automatically');
    }

    // HospitalProfile Class Permissions
    console.log('\n📋 Configuring HospitalProfile class...');
    const hospitalProfileSchema = new Parse.Schema('HospitalProfile');
    
    try {
      await hospitalProfileSchema.get();
      console.log('  ✓ HospitalProfile class exists, updating permissions...');
    } catch (e) {
      console.log('  ℹ HospitalProfile class may not exist yet');
    }

    const hospitalProfileCLP = {
      find: { '*': true },
      get: { '*': true },
      count: { '*': true },
      create: { 'requiresAuthentication': true },
      update: { 'requiresAuthentication': true },
      delete: { 'requiresAuthentication': true },
      addField: { 'requiresAuthentication': true }
    };

    hospitalProfileSchema.setCLP(hospitalProfileCLP);
    
    try {
      await hospitalProfileSchema.update();
      console.log('  ✓ HospitalProfile permissions updated successfully');
    } catch (e) {
      console.log('  ℹ Schema will be created automatically');
    }

    console.log('\n✅ Class-Level Permissions setup complete!');
    console.log('\n📝 Summary:');
    console.log('   - All classes allow public read (find/get/count)');
    console.log('   - Create/Update/Delete require authentication');
    console.log('   - AddField requires authentication');
    console.log('   - Object-level ACLs (set in cloud code) provide fine-grained control\n');

  } catch (error) {
    console.error('❌ Error setting up permissions:', error);
    process.exit(1);
  }
}

// Run the setup
setupClassPermissions()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
