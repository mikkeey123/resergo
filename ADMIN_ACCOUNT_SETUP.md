# Admin Account Setup Guide

This guide explains how to create an admin account for ReserGo.

---

## 🔐 Method 1: Using Browser Console (Recommended for Development)

### Step 1: Start Your Development Server
```bash
npm run dev
```

### Step 2: Open Browser Console
1. Navigate to your app (usually `http://localhost:5173`)
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab

### Step 3: Create Admin Account
The admin creator is automatically loaded when the app starts. Simply run:

```javascript
createAdmin('admin@resergo.com', 'AdminPassword123!', 'Admin User', '+1234567890')
  .then(result => {
    if (result.success) {
      console.log('✅ Admin account created!', result);
    } else {
      console.error('❌ Failed:', result.error);
    }
  });
```

**Parameters:**
- `email` (required): Admin email address
- `password` (required): Admin password (must be at least 6 characters)
- `username` (required): Admin username
- `phoneNumber` (optional): Phone number (format: +1234567890)

**Example:**
```javascript
// Minimal (email, password, username)
createAdmin('admin@resergo.com', 'Admin123!', 'Admin User');

// Full (with phone number)
createAdmin('admin@resergo.com', 'Admin123!', 'Admin User', '+1234567890');
```

---

## 🔐 Method 2: Using Firebase Console (Alternative)

### Step 1: Create Firebase Auth User
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rgdatabase-10798`
3. Navigate to **Authentication** → **Users**
4. Click **Add user**
5. Enter:
   - **Email**: `admin@resergo.com`
   - **Password**: `YourSecurePassword123!`
6. Click **Add user**

### Step 2: Add User Data to Firestore
1. In Firebase Console, go to **Firestore Database**
2. Navigate to the `Resergodb` collection
3. Find the user document (UID from Authentication)
4. Add/Update the document with:
   ```json
   {
     "Username": "Admin User",
     "Number": 1234567890,
     "Password": "YourSecurePassword123!",
     "UserType": "admin",
     "googleAcc": "admin@resergo.com"
   }
   ```

---

## 🔐 Method 3: Using Node.js Script (For Production)

Create a file `scripts/createAdmin.js`:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  const email = process.argv[2] || 'admin@resergo.com';
  const password = process.argv[3] || 'AdminPassword123!';
  const username = process.argv[4] || 'Admin User';
  const phoneNumber = process.argv[5] || '+1234567890';

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const phoneNumberNum = phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) || 0 : 0;
    
    await setDoc(doc(db, "Resergodb", user.uid), {
      Username: username,
      Number: phoneNumberNum,
      Password: password,
      UserType: "admin",
      googleAcc: email
    });
    
    console.log('✅ Admin account created!');
    console.log('UID:', user.uid);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdmin();
```

Run:
```bash
node scripts/createAdmin.js admin@resergo.com AdminPassword123! "Admin User" +1234567890
```

---

## ✅ Verify Admin Account

After creating the admin account:

1. **Test Login:**
   - Go to your app's landing page
   - Click "Start Exploring as Guest" or "Become a Host"
   - Login with the admin credentials
   - You should be automatically redirected to the Admin Dashboard

2. **Check User Type:**
   - In Firebase Console → Firestore → `Resergodb` collection
   - Find your admin user document
   - Verify `UserType` is set to `"admin"`

---

## 🔒 Security Notes

⚠️ **Important Security Considerations:**

1. **Strong Passwords:** Always use strong, unique passwords for admin accounts
2. **Limited Access:** Only create admin accounts for trusted personnel
3. **Password Storage:** Currently passwords are stored in plain text in Firestore (for development). In production, implement proper password hashing
4. **Environment Variables:** Store admin credentials securely, never commit them to Git
5. **Firebase Security Rules:** Ensure Firestore security rules restrict admin account creation

---

## 🐛 Troubleshooting

### Error: "Email already in use"
- The email is already registered. Either:
  - Use a different email
  - Delete the existing account from Firebase Console
  - Update the existing account's `UserType` to `"admin"` in Firestore

### Error: "Weak password"
- Use a stronger password (at least 6 characters, include numbers and special characters)

### Admin login doesn't redirect to admin page
- Check that `UserType` is exactly `"admin"` (case-sensitive) in Firestore
- Check browser console for errors
- Verify the admin login logic in `LoginForm.jsx`

---

## 📝 Example Admin Account

For testing purposes, you can create:

- **Email:** `admin@resergo.com`
- **Password:** `Admin123!@#`
- **Username:** `Admin User`
- **Phone:** `+1234567890`

**Remember to change these credentials in production!**

---

*Last Updated: January 2025*

