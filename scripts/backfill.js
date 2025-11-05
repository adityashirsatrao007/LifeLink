const Parse = require('parse/node');

// Initialize Parse SDK
Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g', // App ID
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI', // JS Key
  'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1'  // Master Key
);
Parse.serverURL = 'https://parseapi.back4app.com';

const CITY_COORDS = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  'New Delhi': { lat: 28.6139, lng: 77.209 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
};

async function backfillHospitals() {
  let updated = 0;
  let page = 0;
  const pageSize = 100;
  while (true) {
    const q = new Parse.Query('HospitalProfile');
    q.limit(pageSize);
    q.skip(page * pageSize);
    q.include('user');
    const results = await q.find({ useMasterKey: true });
    if (results.length === 0) break;

    for (const profile of results) {
      let dirty = false;
      if (!profile.get('hospitalName')) {
        profile.set('hospitalName', `Hospital ${profile.id.slice(-5)}`);
        dirty = true;
      }
      if (!profile.get('licenseNumber')) {
        const st = profile.get('state') || 'XX';
        profile.set('licenseNumber', `LIC-${String(st).slice(0,2).toUpperCase()}-${Math.floor(Math.random()*900+100)}`);
        dirty = true;
      }
      if (!profile.get('phoneNumber')) {
        profile.set('phoneNumber', `011-${Math.floor(Math.random()*9000000+1000000)}`);
        dirty = true;
      }
      if (!profile.get('contactPersonName')) {
        profile.set('contactPersonName', 'Administrator');
        dirty = true;
      }
      if (!profile.get('contactPersonDesignation')) {
        profile.set('contactPersonDesignation', 'Admin');
        dirty = true;
      }
      if (!profile.get('hospitalType')) {
        profile.set('hospitalType', 'General');
        dirty = true;
      }
      if (!profile.get('address')) {
        profile.set('address', 'Not provided');
        dirty = true;
      }
      if (!profile.get('city')) {
        profile.set('city', 'Mumbai');
        dirty = true;
      }
      if (!profile.get('state')) {
        profile.set('state', 'Maharashtra');
        dirty = true;
      }
      if (!profile.get('pinCode')) {
        profile.set('pinCode', '400001');
        dirty = true;
      }
      const vStatus = profile.get('verificationStatus');
      if (!vStatus) {
        profile.set('verificationStatus', 'Pending');
        dirty = true;
      }
      if (profile.get('isVerified') === undefined) {
        profile.set('isVerified', profile.get('verificationStatus') === 'Approved');
        dirty = true;
      }
      if (!profile.get('location')) {
        const lat = profile.get('latitude');
        const lng = profile.get('longitude');
        if (typeof lat === 'number' && typeof lng === 'number') {
          profile.set('location', new Parse.GeoPoint(lat, lng));
          dirty = true;
        } else {
          const city = profile.get('city');
          if (city && CITY_COORDS[city]) {
            profile.set('location', new Parse.GeoPoint(CITY_COORDS[city].lat, CITY_COORDS[city].lng));
            dirty = true;
          }
        }
      }
      if (!profile.getACL()) {
        const owner = profile.get('user');
        const acl = new Parse.ACL(owner || undefined);
        acl.setPublicReadAccess(true);
        profile.setACL(acl);
        dirty = true;
      }

      if (dirty) {
        await profile.save(null, { useMasterKey: true });
        updated += 1;
      }
    }
    page += 1;
  }
  return updated;
}

async function backfillDonors() {
  let updated = 0;
  const q = new Parse.Query('DonorProfile');
  q.limit(1000);
  const results = await q.find({ useMasterKey: true });
  for (const profile of results) {
    let dirty = false;
    if (!profile.get('bloodType')) {
      profile.set('bloodType', 'O+');
      dirty = true;
    }
    if (profile.get('isAvailable') === undefined) {
      profile.set('isAvailable', true);
      dirty = true;
    }
    if (!profile.get('availabilityStatus')) {
      profile.set('availabilityStatus', profile.get('isAvailable') ? 'Available' : 'Unavailable');
      dirty = true;
    }
    if (!profile.get('location')) {
      const lat = profile.get('latitude');
      const lng = profile.get('longitude');
      if (typeof lat === 'number' && typeof lng === 'number') {
        profile.set('location', new Parse.GeoPoint(lat, lng));
        dirty = true;
      }
    }
    if (dirty) {
      await profile.save(null, { useMasterKey: true });
      updated += 1;
    }
  }
  return updated;
}

async function backfillRequests() {
  let updated = 0;
  let page = 0;
  const pageSize = 100;
  while (true) {
    const q = new Parse.Query('BloodRequest');
    q.limit(pageSize);
    q.skip(page * pageSize);
    const results = await q.find({ useMasterKey: true });
    if (results.length === 0) break;

    for (const br of results) {
      let dirty = false;
      if (!br.get('bloodType')) {
        br.set('bloodType', 'O+');
        dirty = true;
      }
      const qty = br.get('unitsRequired') ?? br.get('quantityNeeded');
      if (!qty) {
        br.set('unitsRequired', 1);
        dirty = true;
      } else if (br.get('unitsRequired') === undefined && qty) {
        br.set('unitsRequired', qty);
        dirty = true;
      }
      if (!br.get('urgencyLevel')) {
        br.set('urgencyLevel', 'Medium');
        dirty = true;
      }
      if (!br.get('status')) {
        br.set('status', 'Active');
        dirty = true;
      }
      if (dirty) {
        await br.save(null, { useMasterKey: true });
        updated += 1;
      }
    }
    page += 1;
  }
  return updated;
}

(async () => {
  try {
    console.log('🔧 Backfilling HospitalProfile records...');
    const h = await backfillHospitals();
    console.log(`   ✅ Updated hospitals: ${h}`);

    console.log('🔧 Backfilling DonorProfile records...');
    const d = await backfillDonors();
    console.log(`   ✅ Updated donors: ${d}`);

    console.log('🔧 Backfilling BloodRequest records...');
    const r = await backfillRequests();
    console.log(`   ✅ Updated requests: ${r}`);

    console.log('\n🎉 Backfill complete.');
  } catch (err) {
    console.error('❌ Backfill failed:', err.message);
  }
})();
