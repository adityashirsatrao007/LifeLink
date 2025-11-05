export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100">
      <main className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-red-600">
            🩸 LifeLink
          </h1>
          <p className="text-2xl text-gray-700">
            Blood Donation Platform
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connecting hospitals in need of blood with registered donors through
            real-time notifications
          </p>
        </div>
        
        <div className="flex gap-4 justify-center pt-8">
          <a
            href="/login"
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Login
          </a>
          <a
            href="/register/donor"
            className="px-6 py-3 bg-white border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
          >
            Register as Donor
          </a>
          <a
            href="/register/hospital"
            className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Register as Hospital
          </a>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold mb-2">For Hospitals</h3>
            <p className="text-gray-600">
              Create urgent blood requests and connect with available donors instantly
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">🩸</div>
            <h3 className="text-xl font-semibold mb-2">For Donors</h3>
            <p className="text-gray-600">
              Receive notifications when your blood type is needed nearby
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Matching</h3>
            <p className="text-gray-600">
              Smart algorithm matches donors by blood type and proximity
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
