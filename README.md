# ReserGo 🏠

An Airbnb-like booking platform built with React and Firebase, allowing guests to discover and book unique accommodations, and hosts to manage their listings.

## Features

### For Guests
- 🏠 Browse and search listings
- 📅 Book accommodations
- ❤️ Save favorite listings
- ⭐ Leave reviews
- 📱 Responsive design

### For Hosts
- 📝 Create and manage listings
- 📊 Dashboard with analytics
- 📅 Calendar management
- 💰 Payment tracking
- 💬 Guest messaging
- 🎫 Coupon management
- 🏆 Points and rewards system

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Icons**: React Icons
- **Email**: EmailJS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- EmailJS account (for email functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/resergo.git
cd resergo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_DATABASE_URL=your_database_url_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
resergo/
├── src/
│   ├── assets/          # Images, logos, videos
│   ├── auth/            # Authentication components
│   ├── components/      # Reusable components
│   ├── guest/           # Guest-specific pages
│   ├── host/            # Host-specific pages
│   └── utils/           # Utility functions
├── Config.js            # Firebase configuration
├── .env                 # Environment variables (not in git)
└── .env.example         # Environment variables template
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Set up Firebase Storage
5. Copy your Firebase config to `.env`

## EmailJS Setup

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Set up an email service
3. Create email templates for guest and host welcome emails
4. Configure EmailJS in your code

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Security Notes

- ⚠️ Never commit `.env` file to Git
- ⚠️ Firebase API keys are safe to expose in client-side code, but keep your Firestore security rules strict
- ⚠️ Use environment variables for all sensitive configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Contact

For questions or support, please contact the development team.

---

Built with ❤️ using React and Firebase
