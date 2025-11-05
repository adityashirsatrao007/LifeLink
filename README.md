# LifeLink - Blood Donation Platform

A modern, real-time blood donation platform connecting donors with hospitals in need. Built with Next.js 14, TypeScript, and Parse Server.

## 🚀 Features

### For Donors
- ✅ Quick registration with blood type and location
- ✅ Real-time notifications for matching blood requests
- ✅ One-click accept/decline for donation requests
- ✅ View donation history and statistics
- ✅ Update availability status
- ✅ Privacy-focused profile management

### For Hospitals
- ✅ Secure hospital registration with verification process
- ✅ Create urgent blood requests with details
- ✅ View matching donors in proximity
- ✅ Track request status (Active/Fulfilled/Cancelled)
- ✅ Manage multiple blood requests simultaneously
- ✅ View accepted donors and contact information

### For Admins
- ✅ Approve/reject hospital registrations
- ✅ View platform statistics and analytics
- ✅ Monitor all blood requests and responses
- ✅ Manage user accounts and permissions
- ✅ Access comprehensive dashboard

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zustand (state management)
- React Hook Form + Zod (form validation)
- Leaflet (maps - future integration)

**Backend:**
- Parse Server (Back4App)
- Cloud Code for business logic
- MongoDB database
- RESTful API

**Deployment:**
- Vercel (frontend hosting)
- Back4App (backend & database)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Back4App account (free tier available)
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adityashirsatrao007/LifeLink.git
   cd LifeLink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Update with your Back4App credentials:
     ```env
     NEXT_PUBLIC_PARSE_APP_ID=your_app_id
     NEXT_PUBLIC_PARSE_JS_KEY=your_js_key
     NEXT_PUBLIC_PARSE_SERVER_URL=https://parseapi.back4app.com
     ```

4. **Deploy Cloud Code to Back4App**
   ```bash
   cd cloud
   # Upload main.js to Back4App via Dashboard or CLI
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Seed database (optional)**
   ```bash
   node scripts/seed-data.js
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy!

## 🗂️ Project Structure

```
LifeLink/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── donor/             # Donor dashboard
│   ├── hospital/          # Hospital dashboard
│   ├── login/             # Login page
│   └── register/          # Registration pages
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   └── parse.ts          # Parse SDK initialization
├── stores/               # Zustand state stores
│   ├── authStore.ts      # Authentication state
│   ├── requestStore.ts   # Blood requests state
│   └── notificationStore.ts
├── types/                # TypeScript type definitions
├── cloud/                # Parse Cloud Code
│   └── main.js          # Cloud functions
├── scripts/              # Database scripts
│   ├── seed-data.js     # Seed dummy data
│   └── run-backfill.js  # Data backfill utility
└── public/               # Static assets
```

## 👥 Default Credentials (Development)

**Admin:**
- Username: `admin`
- Password: `admin123`

**Hospital (Approved):**
- Username: `apollo_mumbai`
- Password: `hospital123`

**Donor:**
- Username: `rahul_sharma`
- Password: `password123`

## 📊 Database Schema

**Classes:**
- `_User` - Base user authentication
- `DonorProfile` - Donor information and preferences
- `HospitalProfile` - Hospital details and verification
- `BloodRequest` - Blood requests from hospitals
- `DonorResponse` - Donor responses to requests
- `Notification` - User notifications
- `DonationHistory` - Past donation records

## 🔐 Security Features

- Role-based access control (RBAC)
- Parse ACLs for data protection
- Hospital verification workflow
- Secure password hashing
- Environment-based configuration
- No sensitive data in client code

## 🧪 Testing

**Manual Testing:**
1. Run `npm run dev`
2. Test donor registration and login
3. Test hospital registration (requires admin approval)
4. Admin approves hospital
5. Hospital creates blood request
6. Donor accepts/declines request

See [ADMIN_TESTING.md](./ADMIN_TESTING.md) for detailed test scenarios.

## 📈 Future Enhancements

- [ ] Real-time push notifications (Firebase)
- [ ] SMS notifications (Twilio)
- [ ] Email notifications (SendGrid/Resend)
- [ ] Interactive map view with Leaflet
- [ ] Advanced analytics dashboard
- [ ] Blood bank inventory management
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Aditya Shirsat Rao**
- GitHub: [@adityashirsatrao007](https://github.com/adityashirsatrao007)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Back4App](https://www.back4app.com/)
- Deployed on [Vercel](https://vercel.com)

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Open an issue on GitHub
3. Contact via email: adityashirsatrao007@gmail.com

---

**Made with ❤️ to save lives**
