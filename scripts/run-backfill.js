const Parse = require('parse/node');

// Initialize Parse SDK
Parse.initialize(
  'JatLLoWEzO3UX0SqIgsojzf7COmzmPDJ9DrtEY6g', // App ID
  'TpxQPT1ogHyaaY79TNujFEbC8XAQKVWBAxeBaLJI', // JS Key
  'n0n6Q8XqTOIXHzN1KPdU0G70kVSAaCCZMt30BZq1'  // Master Key
);
Parse.serverURL = 'https://parseapi.back4app.com';
Parse.User.enableUnsafeCurrentUser();

(async () => {
  try {
    console.log('� Logging in as admin...');
    await Parse.User.logIn('admin', 'admin123');
    console.log('�🔧 Running backfillAll cloud function as Admin...');
    const result = await Parse.Cloud.run('backfillAll', {});
    console.log('✅ Backfill completed:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ Backfill failed:', err.message);
  } finally {
    await Parse.User.logOut().catch(() => {});
  }
})();
