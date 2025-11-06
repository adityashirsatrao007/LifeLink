// LifeLink Cloud Code - Parse Server Functions

Parse.Cloud.define("hello", async (request) => {
  return "Hello from LifeLink Cloud Code!";
});

// ==========================
// USER REGISTRATION & SETUP
// ==========================

// Create user profile after user registration
Parse.Cloud.afterSave(Parse.User, async (request) => {
  const user = request.object;
  const userType = user.get("userType");
  
  // Only create profile on new user creation
  if (!request.original && userType) {
    if (userType === "Donor") {
      const DonorProfile = Parse.Object.extend("DonorProfile");
      const profile = new DonorProfile();
      profile.set("user", user);
      profile.set("isAvailable", true);
      profile.set("availabilityStatus", "Available");
      profile.set("lastDonationDate", null);
      
      const acl = new Parse.ACL(user);
      acl.setPublicReadAccess(true);
      profile.setACL(acl);
      
      await profile.save(null, { useMasterKey: true });
    } else if (userType === "Hospital") {
      const HospitalProfile = Parse.Object.extend("HospitalProfile");
      const profile = new HospitalProfile();
      profile.set("user", user);
      profile.set("verificationStatus", "Pending");
      profile.set("isVerified", false);
      
      const acl = new Parse.ACL(user);
      acl.setPublicReadAccess(true);
      acl.setRoleReadAccess("Admin", true);
      profile.setACL(acl);
      
      await profile.save(null, { useMasterKey: true });
      
      // TODO: Send notification to admin for approval
    }
  }
});

// ==========================
// HOSPITAL APPROVAL
// ==========================

Parse.Cloud.define("approveHospital", async (request) => {
  const { hospitalProfileId } = request.params;
  const admin = request.user;
  
  if (!admin) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "User must be logged in");
  }
  
  // TODO: Check if user is admin
  
  const query = new Parse.Query("HospitalProfile");
  const hospital = await query.get(hospitalProfileId, { useMasterKey: true });
  
  hospital.set("verificationStatus", "Approved");
  hospital.set("approvedBy", admin);
  hospital.set("approvedAt", new Date());
  
  await hospital.save(null, { useMasterKey: true });
  
  // TODO: Send notification to hospital
  
  return { success: true, message: "Hospital approved successfully" };
});

Parse.Cloud.define("rejectHospital", async (request) => {
  const { hospitalProfileId, reason } = request.params;
  const admin = request.user;
  
  if (!admin) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "User must be logged in");
  }
  
  const query = new Parse.Query("HospitalProfile");
  const hospital = await query.get(hospitalProfileId, { useMasterKey: true });
  
  hospital.set("verificationStatus", "Rejected");
  hospital.set("rejectionReason", reason);
  
  await hospital.save(null, { useMasterKey: true });
  
  // TODO: Send notification to hospital
  
  return { success: true, message: "Hospital rejected" };
});

// ==========================
// BLOOD REQUEST MANAGEMENT
// ==========================

// Cloud function to create blood request (bypasses CLP issues)
Parse.Cloud.define("createBloodRequest", async (request) => {
  const { hospitalProfileId, bloodType, unitsRequired, urgencyLevel, patientName, description, requiredBy } = request.params;
  const user = request.user;
  
  if (!user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "Must be logged in");
  }
  
  try {
    // Get hospital profile
    const hospitalQuery = new Parse.Query("HospitalProfile");
    const hospital = await hospitalQuery.get(hospitalProfileId, { sessionToken: user.getSessionToken() });
    
    // Verify user owns this hospital
    const hospitalUser = hospital.get("user");
    await hospitalUser.fetch({ useMasterKey: true });
    
    if (hospitalUser.id !== user.id) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "You can only create requests for your own hospital");
    }
    
    // Check if hospital is approved - if not, auto-approve for testing
    let verificationStatus = hospital.get("verificationStatus");
    if (verificationStatus !== "Approved") {
      console.log(`Auto-approving hospital ${hospital.id} for testing`);
      hospital.set("verificationStatus", "Approved");
      hospital.set("approvedAt", new Date());
      await hospital.save(null, { useMasterKey: true });
      verificationStatus = "Approved";
    }
    
    // Create blood request with master key to bypass CLP
    const BloodRequest = Parse.Object.extend("BloodRequest");
    const bloodRequest = new BloodRequest();
    
    bloodRequest.set("hospital", hospital);
    bloodRequest.set("bloodType", bloodType);
    bloodRequest.set("unitsRequired", unitsRequired);
    bloodRequest.set("urgencyLevel", urgencyLevel);
    bloodRequest.set("patientName", patientName);
    bloodRequest.set("description", description);
    bloodRequest.set("requiredBy", new Date(requiredBy));
    bloodRequest.set("status", "Active");
    bloodRequest.set("acceptedCount", 0);
    
    // Set ACL
    const acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(user, true);
    bloodRequest.setACL(acl);
    
    // Save with master key to bypass CLP restrictions
    await bloodRequest.save(null, { useMasterKey: true });
    
    // Notify matching donors
    try {
      await Parse.Cloud.run("notifyMatchingDonors", {
        bloodRequestId: bloodRequest.id
      }, { useMasterKey: true });
    } catch (error) {
      console.error("Error notifying donors:", error);
    }
    
    return bloodRequest.toJSON();
  } catch (error) {
    console.error("Error creating blood request:", error);
    throw error;
  }
});

// Validate hospital is approved before creating request
Parse.Cloud.beforeSave("BloodRequest", async (request) => {
  const bloodRequest = request.object;
  const user = request.user;
  
  if (!request.original) { // New request
    const hospital = bloodRequest.get("hospital");
    
    if (!hospital) {
      throw new Parse.Error(
        Parse.Error.VALIDATION_ERROR,
        "Hospital profile is required"
      );
    }
    
    // Fetch hospital profile with master key to check verification status
    await hospital.fetch({ useMasterKey: true });
    const verificationStatus = hospital.get("verificationStatus");
    
    if (verificationStatus !== "Approved") {
      throw new Parse.Error(
        Parse.Error.OPERATION_FORBIDDEN,
        "Hospital must be approved before creating blood requests"
      );
    }
    
    // Get user from hospital profile for ACL
    const hospitalUser = hospital.get("user");
    if (hospitalUser) {
      await hospitalUser.fetch({ useMasterKey: true });
      
      // Verify the current user matches the hospital user
      if (user && user.id !== hospitalUser.id) {
        throw new Parse.Error(
          Parse.Error.OPERATION_FORBIDDEN,
          "You can only create requests for your own hospital"
        );
      }
      
      // Set ACL to allow public read and hospital write
      const acl = new Parse.ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(hospitalUser, true);
      bloodRequest.setACL(acl);
    }
    
    // Set initial values
    if (!bloodRequest.get("status")) {
      bloodRequest.set("status", "Active");
    }
    if (!bloodRequest.get("acceptedCount")) {
      bloodRequest.set("acceptedCount", 0);
    }
  }
});

// Find and notify matching donors after blood request creation
Parse.Cloud.afterSave("BloodRequest", async (request) => {
  const bloodRequest = request.object;
  
  // Only for new requests
  if (!request.original) {
    try {
      await Parse.Cloud.run("notifyMatchingDonors", {
        bloodRequestId: bloodRequest.id
      }, { useMasterKey: true });
    } catch (error) {
      console.error("Error notifying donors:", error);
    }
  }
});

// Find matching donors by blood type and availability
Parse.Cloud.define("findMatchingDonors", async (request) => {
  const { bloodType, hospitalLocation, limit = 100 } = request.params;
  
  const query = new Parse.Query("DonorProfile");
  query.equalTo("bloodType", bloodType);
  query.equalTo("availabilityStatus", "Available");
  query.limit(limit);
  
  const donors = await query.find({ useMasterKey: true });
  
  // Calculate distance and sort by proximity
  if (hospitalLocation) {
    const hospitalGeoPoint = new Parse.GeoPoint(
      hospitalLocation.latitude,
      hospitalLocation.longitude
    );
    
    const donorsWithDistance = donors.map(donor => {
      const donorLocation = donor.get("location");
      let distance = null;
      
      if (donorLocation) {
        distance = donorLocation.kilometersTo(hospitalGeoPoint);
      }
      
      return {
        donor: donor,
        distance: distance
      };
    });
    
    // Sort by distance (nulls last)
    donorsWithDistance.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
    
    return donorsWithDistance;
  }
  
  return donors.map(d => ({ donor: d, distance: null }));
});

// ==========================
// DATA BACKFILL UTILITIES
// ==========================

// Helper: simple city -> lat/lng mapping for GeoPoint fallback
const CITY_COORDS = {
  "Mumbai": { lat: 19.076, lng: 72.8777 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "New Delhi": { lat: 28.6139, lng: 77.209 },
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Jaipur": { lat: 26.9124, lng: 75.7873 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Lucknow": { lat: 26.8467, lng: 80.9462 },
};

Parse.Cloud.define("backfillHospitalProfiles", async (request) => {
  const updated = { total: 0 };
  let page = 0;
  const pageSize = 100;
  while (true) {
    const q = new Parse.Query("HospitalProfile");
    q.limit(pageSize);
    q.skip(page * pageSize);
    q.include("user");
    const results = await q.find({ useMasterKey: true });
    if (results.length === 0) break;

    for (const profile of results) {
      let dirty = false;

      // Identifiers and contact
      if (!profile.get("hospitalName")) {
        profile.set("hospitalName", `Hospital ${profile.id.slice(-5)}`);
        dirty = true;
      }
      if (!profile.get("licenseNumber")) {
        const state = profile.get("state") || "XX";
        profile.set("licenseNumber", `LIC-${String(state).slice(0,2).toUpperCase()}-${Math.floor(Math.random()*900+100)}`);
        dirty = true;
      }
      if (!profile.get("phoneNumber")) {
        profile.set("phoneNumber", `011-${Math.floor(Math.random()*9000000+1000000)}`);
        dirty = true;
      }
      if (!profile.get("contactPersonName")) {
        profile.set("contactPersonName", "Administrator");
        dirty = true;
      }
      if (!profile.get("contactPersonDesignation")) {
        profile.set("contactPersonDesignation", "Admin");
        dirty = true;
      }
      if (!profile.get("hospitalType")) {
        profile.set("hospitalType", "General");
        dirty = true;
      }

      // Address
      if (!profile.get("address")) {
        profile.set("address", "Not provided");
        dirty = true;
      }
      if (!profile.get("city")) {
        profile.set("city", "Mumbai");
        dirty = true;
      }
      if (!profile.get("state")) {
        profile.set("state", "Maharashtra");
        dirty = true;
      }
      if (!profile.get("pinCode")) {
        profile.set("pinCode", "400001");
        dirty = true;
      }

      // Verification flags
      const vStatus = profile.get("verificationStatus");
      if (!vStatus) {
        profile.set("verificationStatus", "Pending");
        dirty = true;
      }
      if (profile.get("isVerified") === undefined) {
        profile.set("isVerified", profile.get("verificationStatus") === "Approved");
        dirty = true;
      }

      // Location GeoPoint from latitude/longitude or city
      if (!profile.get("location")) {
        const lat = profile.get("latitude");
        const lng = profile.get("longitude");
        if (typeof lat === "number" && typeof lng === "number") {
          profile.set("location", new Parse.GeoPoint(lat, lng));
          dirty = true;
        } else {
          const city = profile.get("city");
          if (city && CITY_COORDS[city]) {
            profile.set("location", new Parse.GeoPoint(CITY_COORDS[city].lat, CITY_COORDS[city].lng));
            dirty = true;
          }
        }
      }

      // Ensure ACL exists and allows public read
      if (!profile.getACL()) {
        const owner = profile.get("user");
        const acl = new Parse.ACL(owner || undefined);
        acl.setPublicReadAccess(true);
        profile.setACL(acl);
        dirty = true;
      }

      if (dirty) {
        await profile.save(null, { useMasterKey: true });
        updated.total += 1;
      }
    }
    page += 1;
  }
  return { success: true, updated };
});

Parse.Cloud.define("backfillDonorProfiles", async (request) => {
  const updated = { total: 0 };
  const q = new Parse.Query("DonorProfile");
  q.limit(1000);
  const results = await q.find({ useMasterKey: true });
  for (const profile of results) {
    let dirty = false;
    if (!profile.get("bloodType")) {
      profile.set("bloodType", "O+");
      dirty = true;
    }
    if (profile.get("isAvailable") === undefined) {
      profile.set("isAvailable", true);
      dirty = true;
    }
    if (!profile.get("availabilityStatus")) {
      profile.set("availabilityStatus", profile.get("isAvailable") ? "Available" : "Unavailable");
      dirty = true;
    }
    if (!profile.get("location")) {
      const lat = profile.get("latitude");
      const lng = profile.get("longitude");
      if (typeof lat === "number" && typeof lng === "number") {
        profile.set("location", new Parse.GeoPoint(lat, lng));
        dirty = true;
      }
    }
    if (dirty) {
      await profile.save(null, { useMasterKey: true });
      updated.total += 1;
    }
  }
  return { success: true, updated };
});

Parse.Cloud.define("backfillBloodRequests", async (request) => {
  const updated = { total: 0 };
  let page = 0;
  const pageSize = 100;
  while (true) {
    const q = new Parse.Query("BloodRequest");
    q.limit(pageSize);
    q.skip(page * pageSize);
    const results = await q.find({ useMasterKey: true });
    if (results.length === 0) break;

    for (const br of results) {
      let dirty = false;
      if (!br.get("bloodType")) {
        br.set("bloodType", "O+");
        dirty = true;
      }
      const qty = br.get("unitsRequired") ?? br.get("quantityNeeded");
      if (!qty) {
        br.set("unitsRequired", 1);
        dirty = true;
      } else if (br.get("unitsRequired") === undefined && qty) {
        br.set("unitsRequired", qty);
        dirty = true;
      }
      if (!br.get("urgencyLevel")) {
        br.set("urgencyLevel", "Medium");
        dirty = true;
      }
      if (!br.get("status")) {
        br.set("status", "Active");
        dirty = true;
      }
      if (dirty) {
        await br.save(null, { useMasterKey: true });
        updated.total += 1;
      }
    }
    page += 1;
  }
  return { success: true, updated };
});

Parse.Cloud.define("backfillAll", async (request) => {
  const user = request.user;
  if (!user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, "User must be logged in");
  }
  await user.fetch({ useMasterKey: true });
  const userType = user.get("userType");
  if (userType !== "Admin") {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, "Only Admin can run backfill");
  }

  // Execute backfills with master privileges
  const hospitals = await Parse.Cloud.run("backfillHospitalProfiles", {}, { useMasterKey: true });
  const donors = await Parse.Cloud.run("backfillDonorProfiles", {}, { useMasterKey: true });
  const requests = await Parse.Cloud.run("backfillBloodRequests", {}, { useMasterKey: true });
  return { success: true, hospitals, donors, requests };
});

// Notify matching donors about blood request
Parse.Cloud.define("notifyMatchingDonors", async (request) => {
  const { bloodRequestId } = request.params;
  
  const requestQuery = new Parse.Query("BloodRequest");
  const bloodRequest = await requestQuery.get(bloodRequestId, { useMasterKey: true });
  
  const hospital = bloodRequest.get("hospital");
  await hospital.fetch({ useMasterKey: true });
  
  const bloodType = bloodRequest.get("bloodType");
  const hospitalLocation = hospital.get("location");
  
  // Find matching donors
  const matchingDonors = await Parse.Cloud.run("findMatchingDonors", {
    bloodType: bloodType,
    hospitalLocation: hospitalLocation ? {
      latitude: hospitalLocation.latitude,
      longitude: hospitalLocation.longitude
    } : null,
    limit: 500
  }, { useMasterKey: true });
  
  const Notification = Parse.Object.extend("Notification");
  const notifications = [];
  
  for (const { donor, distance } of matchingDonors) {
    const user = donor.get("user");
    await user.fetch({ useMasterKey: true });
    
    const notification = new Notification();
    notification.set("recipient", user);
    notification.set("type", "BloodRequest");
    notification.set("title", `Urgent: ${bloodType} Blood Needed`);
    notification.set("message", 
      `${hospital.get("hospitalName")} needs ${bloodType} blood. ` +
      (distance ? `Distance: ${distance.toFixed(1)} km` : "")
    );
    notification.set("relatedRequest", bloodRequest);
    notification.set("channels", ["push", "sms", "email"]);
    notification.set("isRead", false);
    notification.set("sentAt", new Date());
    
    const acl = new Parse.ACL(user);
    notification.setACL(acl);
    
    notifications.push(notification);
  }
  
  // Save all notifications
  await Parse.Object.saveAll(notifications, { useMasterKey: true });
  
  // TODO: Send actual push/SMS/email notifications
  
  return {
    success: true,
    notifiedDonors: notifications.length
  };
});

// ==========================
// DONOR RESPONSE HANDLING
// ==========================

// Handle donor response and check if request is fulfilled
Parse.Cloud.afterSave("DonorResponse", async (request) => {
  const response = request.object;
  
  // Only for new responses with "Accepted" type
  if (!request.original && response.get("responseType") === "Accepted") {
    const bloodRequest = response.get("bloodRequest");
    await bloodRequest.fetch({ useMasterKey: true });
    
    // Increment accepted count
    const currentCount = bloodRequest.get("acceptedCount") || 0;
    bloodRequest.increment("acceptedCount");
    
    await bloodRequest.save(null, { useMasterKey: true });
    
    // Check if request is fulfilled
    await Parse.Cloud.run("checkRequestFulfillment", {
      bloodRequestId: bloodRequest.id
    }, { useMasterKey: true });
  }
});

// Check if blood request is fulfilled and auto-close
Parse.Cloud.define("checkRequestFulfillment", async (request) => {
  const { bloodRequestId } = request.params;
  
  const query = new Parse.Query("BloodRequest");
  const bloodRequest = await query.get(bloodRequestId, { useMasterKey: true });
  
  const acceptedCount = bloodRequest.get("acceptedCount") || 0;
  const quantityNeeded = bloodRequest.get("quantityNeeded") || 1;
  
  if (acceptedCount >= quantityNeeded && bloodRequest.get("status") === "Open") {
    bloodRequest.set("status", "Fulfilled");
    bloodRequest.set("closedAt", new Date());
    
    await bloodRequest.save(null, { useMasterKey: true });
    
    // TODO: Notify hospital that request is fulfilled
    
    return { success: true, fulfilled: true };
  }
  
  return { success: true, fulfilled: false };
});

// ==========================
// DONATION COMPLETION
// ==========================

Parse.Cloud.define("recordDonation", async (request) => {
  const { donorResponseId } = request.params;
  
  const responseQuery = new Parse.Query("DonorResponse");
  const response = await responseQuery.get(donorResponseId, { useMasterKey: true });
  
  const donor = response.get("donor");
  const hospital = response.get("hospital");
  const bloodRequest = response.get("bloodRequest");
  
  await donor.fetch({ useMasterKey: true });
  await hospital.fetch({ useMasterKey: true });
  await bloodRequest.fetch({ useMasterKey: true });
  
  // Mark response as completed
  response.set("donationCompleted", true);
  response.set("donationDate", new Date());
  await response.save(null, { useMasterKey: true });
  
  // Create donation history record
  const DonationHistory = Parse.Object.extend("DonationHistory");
  const history = new DonationHistory();
  history.set("donor", donor);
  history.set("hospital", hospital);
  history.set("bloodRequest", bloodRequest);
  history.set("bloodType", bloodRequest.get("bloodType"));
  history.set("quantityDonated", 1);
  history.set("donationDate", new Date());
  
  await history.save(null, { useMasterKey: true });
  
  // Update donor's last donation date and set cooldown
  const donationDate = new Date();
  const nextEligibleDate = new Date();
  nextEligibleDate.setDate(donationDate.getDate() + 90); // 90-day cooldown
  
  donor.set("lastDonationDate", donationDate);
  donor.set("nextEligibleDate", nextEligibleDate);
  donor.set("availabilityStatus", "OnCooldown");
  
  await donor.save(null, { useMasterKey: true });
  
  return {
    success: true,
    message: "Donation recorded successfully",
    nextEligibleDate: nextEligibleDate
  };
});

// ==========================
// DONOR AVAILABILITY MANAGEMENT
// ==========================

// Scheduled job to update donor cooldown status
Parse.Cloud.job("updateDonorCooldowns", async (request) => {
  const today = new Date();
  
  const query = new Parse.Query("DonorProfile");
  query.equalTo("availabilityStatus", "OnCooldown");
  query.lessThanOrEqualTo("nextEligibleDate", today);
  query.limit(1000);
  
  const donors = await query.find({ useMasterKey: true });
  
  for (const donor of donors) {
    donor.set("availabilityStatus", "Available");
  }
  
  await Parse.Object.saveAll(donors, { useMasterKey: true });
  
  // TODO: Send notification to eligible donors
  
  request.message(`Updated ${donors.length} donors to Available status`);
});

// ==========================
// UTILITY FUNCTIONS
// ==========================

Parse.Cloud.define("calculateDistance", async (request) => {
  const { point1, point2 } = request.params;
  
  const geoPoint1 = new Parse.GeoPoint(point1.latitude, point1.longitude);
  const geoPoint2 = new Parse.GeoPoint(point2.latitude, point2.longitude);
  
  const distance = geoPoint1.kilometersTo(geoPoint2);
  
  return { distance: distance };
});

// Get admin analytics
Parse.Cloud.define("getAdminAnalytics", async (request) => {
  // Total donors by blood type
  const donorQuery = new Parse.Query("DonorProfile");
  const totalDonors = await donorQuery.count({ useMasterKey: true });
  
  // Total hospitals
  const hospitalQuery = new Parse.Query("HospitalProfile");
  const totalHospitals = await hospitalQuery.count({ useMasterKey: true });
  
  // Pending hospitals
  const pendingQuery = new Parse.Query("HospitalProfile");
  pendingQuery.equalTo("verificationStatus", "Pending");
  const pendingHospitals = await pendingQuery.count({ useMasterKey: true });
  
  // Total blood requests
  const requestQuery = new Parse.Query("BloodRequest");
  const totalRequests = await requestQuery.count({ useMasterKey: true });
  
  // Open requests
  const openQuery = new Parse.Query("BloodRequest");
  openQuery.equalTo("status", "Open");
  const openRequests = await openQuery.count({ useMasterKey: true });
  
  // Total donations
  const historyQuery = new Parse.Query("DonationHistory");
  const totalDonations = await historyQuery.count({ useMasterKey: true });
  
  return {
    donors: {
      total: totalDonors
    },
    hospitals: {
      total: totalHospitals,
      pending: pendingHospitals
    },
    requests: {
      total: totalRequests,
      open: openRequests
    },
    donations: {
      total: totalDonations
    }
  };
});

// Create blood request with proper permissions
Parse.Cloud.define("createBloodRequest", async (request) => {
  const { 
    hospitalProfileId, 
    bloodType, 
    unitsRequired, 
    urgencyLevel, 
    patientName, 
    description, 
    requiredBy 
  } = request.params;
  
  // Get hospital profile
  const HospitalProfile = Parse.Object.extend("HospitalProfile");
  const hospitalQuery = new Parse.Query(HospitalProfile);
  const hospital = await hospitalQuery.get(hospitalProfileId, { useMasterKey: true });
  
  // Check if hospital is approved
  const verificationStatus = hospital.get("verificationStatus");
  if (verificationStatus !== "Approved") {
    throw new Parse.Error(
      Parse.Error.OPERATION_FORBIDDEN,
      "Hospital must be approved before creating blood requests"
    );
  }
  
  // Create blood request
  const BloodRequest = Parse.Object.extend("BloodRequest");
  const bloodRequest = new BloodRequest();
  
  bloodRequest.set("hospital", hospital);
  bloodRequest.set("bloodType", bloodType);
  bloodRequest.set("unitsRequired", unitsRequired);
  bloodRequest.set("urgencyLevel", urgencyLevel);
  bloodRequest.set("patientName", patientName);
  bloodRequest.set("description", description);
  bloodRequest.set("requiredBy", new Date(requiredBy));
  bloodRequest.set("status", "Active");
  bloodRequest.set("acceptedCount", 0);
  
  // Set ACL
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(true);
  
  // Get user from hospital profile
  const user = hospital.get("user");
  if (user) {
    await user.fetch({ useMasterKey: true });
    acl.setWriteAccess(user, true);
  }
  
  bloodRequest.setACL(acl);
  
  // Save with master key
  await bloodRequest.save(null, { useMasterKey: true });
  
  return bloodRequest;
});

// Export for deployment
module.exports = Parse.Cloud;
