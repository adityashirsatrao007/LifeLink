const Parse = require('parse/node');
const https = require('https');

const APP_ID = 'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g';
const MASTER_KEY = 'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1';

Parse.initialize(APP_ID, 'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI', MASTER_KEY);
Parse.serverURL = 'https://parseapi.back4app.com';

async function uploadCloudCode() {
  console.log('📤 Uploading cloud code to Back4App...\n');
  
  const fs = require('fs');
  const cloudCode = fs.readFileSync(__dirname + '/../cloud/main.js', 'utf8');
  
  const data = JSON.stringify({
    fileData: Buffer.from(cloudCode).toString('base64'),
    fileName: 'main.js'
  });
  
  const options = {
    hostname: 'parseapi.back4app.com',
    path: '/scripts/main.js',
    method: 'PUT',
    headers: {
      'X-Parse-Application-Id': APP_ID,
      'X-Parse-Master-Key': MASTER_KEY,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Cloud code uploaded successfully!');
          resolve(body);
        } else {
          console.error('❌ Upload failed:', res.statusCode, body);
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

uploadCloudCode()
  .then(() => {
    console.log('\n✅ Done! Now testing...\n');
    require('./test-blood-request.js');
  })
  .catch(error => {
    console.error('\n❌ Failed:', error.message);
    console.log('\n⚠️  MANUAL DEPLOYMENT REQUIRED:');
    console.log('1. Go to https://dashboard.back4app.com');
    console.log('2. Select LifeLink app');
    console.log('3. Cloud Code → Upload → Select cloud/main.js → Deploy\n');
    process.exit(1);
  });
