# Testing Admin Dashboard

Since all existing hospitals were auto-approved during seeding, here's how to test the admin approval feature:

## Option 1: Register a New Hospital (Recommended)

1. **Go to**: http://localhost:3000/register/hospital
2. **Fill the form** with any test data:
   - Username: `test_hospital`
   - Email: `test@hospital.com`
   - Password: `test123`
   - Hospital Name: `Test Medical Center`
   - License: `LIC-TEST-001`
   - Fill other required fields
3. **Register** - This hospital will be created with "Pending" status
4. **Login as Admin**: `admin` / `admin123`
5. **See the pending hospital** in admin dashboard
6. **Approve or Reject** it

## Option 2: Check Existing Hospitals

Login as admin and check the "All Hospitals" section to see all 5 approved hospitals:
- Apollo Hospital Mumbai
- Fortis Hospital Bangalore
- AIIMS Delhi
- Manipal Hospital Chennai
- Max Hospital Delhi

All these were auto-approved by the seed script (for testing convenience).

## Testing Rejection Flow

1. Login as admin
2. If you have pending hospitals, enter a rejection reason
3. Click "Reject" button
4. Hospital will be rejected and reason will be stored

---

**Recommended**: Register a new test hospital to see the full approval workflow!
