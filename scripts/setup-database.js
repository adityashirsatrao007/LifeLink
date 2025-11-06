// Script to set up CLP via REST API and approve hospitals
const https = require('https');

const APP_ID = 'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g';
const MASTER_KEY = 'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1';
const SERVER_URL = 'https://parseapi.back4app.com';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'parseapi.back4app.com',
      path: path,
      method: method,
      headers: {
        'X-Parse-Application-Id': APP_ID,
        'X-Parse-Master-Key': MASTER_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function setupCLP() {
  console.log('🔧 Setting up Class-Level Permissions via REST API\n');
  
  const classes = [
    {
      name: 'BloodRequest',
      clp: {
        find: { '*': true },
        get: { '*': true },
        count: { '*': true },
        create: { '*': true },  // Allow anyone to create (we validate in beforeSave)
        update: { '*': true },  // Allow updates (ACL controls who can update)
        delete: { '*': true },
        addField: { '*': true }  // Critical: allow adding fields
      }
    },
    {
      name: 'DonorResponse',
      clp: {
        find: { '*': true },
        get: { '*': true },
        count: { '*': true },
        create: { '*': true },
        update: { '*': true },
        delete: { '*': true },
        addField: { '*': true }
      }
    },
    {
      name: 'DonorProfile',
      clp: {
        find: { '*': true },
        get: { '*': true },
        count: { '*': true },
        create: { '*': true },
        update: { '*': true },
        delete: { '*': true },
        addField: { '*': true }
      }
    },
    {
      name: 'HospitalProfile',
      clp: {
        find: { '*': true },
        get: { '*': true },
        count: { '*': true },
        create: { '*': true },
        update: { '*': true },
        delete: { '*': true },
        addField: { '*': true }
      }
    }
  ];

  for (const classConfig of classes) {
    try {
      console.log(`📋 Setting CLP for ${classConfig.name}...`);
      
      // Update schema with CLP
      const result = await makeRequest('PUT', `/schemas/${classConfig.name}`, {
        classLevelPermissions: classConfig.clp
      });
      
      console.log(`   ✅ ${classConfig.name} CLP updated successfully`);
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log(`   ℹ ${classConfig.name} doesn't exist yet, will be created on first save`);
      } else {
        console.log(`   ⚠ ${classConfig.name}: ${error.message}`);
      }
    }
  }
  
  console.log('\n✅ CLP setup complete!\n');
}

async function approveHospitals() {
  console.log('🏥 Approving all hospitals...\n');
  
  try {
    // Fetch all hospitals
    const result = await makeRequest('GET', '/classes/HospitalProfile?include=user');
    
    console.log(`Found ${result.results.length} hospitals\n`);
    
    for (const hospital of result.results) {
      const name = hospital.hospitalName || 'Unknown';
      const status = hospital.verificationStatus;
      const username = hospital.user?.username || 'Unknown';
      
      console.log(`Hospital: ${name} (${username})`);
      console.log(`  Current status: ${status}`);
      
      if (status !== 'Approved') {
        // Update hospital
        await makeRequest('PUT', `/classes/HospitalProfile/${hospital.objectId}`, {
          verificationStatus: 'Approved',
          approvedAt: { __type: 'Date', iso: new Date().toISOString() }
        });
        console.log(`  ✅ Status updated to: Approved`);
      } else {
        console.log(`  ✓ Already approved`);
      }
      console.log('');
    }
    
    console.log('✅ All hospitals approved!\n');
  } catch (error) {
    console.error('❌ Error approving hospitals:', error.message);
  }
}

async function main() {
  await setupCLP();
  await approveHospitals();
}

main()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
