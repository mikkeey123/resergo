/**
 * Script to create an admin account
 * 
 * Usage:
 * 1. Run this script in Node.js environment OR
 * 2. Import and use in browser console (for development)
 * 
 * Example (Browser Console):
 * import('./createAdminAccount.js').then(module => {
 *   module.createAdminAccount('admin@resergo.com', 'admin123', 'Admin User', '+1234567890');
 * });
 */

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Firebase configuration (same as Config.js)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBE4Z_pEiwkhYUSfBy1P33wUDQ2ZcFjHJA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rgdatabase-10798.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://rgdatabase-10798-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rgdatabase-10798",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rgdatabase-10798.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "444928906589",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:444928906589:web:d3a800f61f7dbc22a404b4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-P3E5B4MEJF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Create an admin account
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @param {string} username - Admin username
 * @param {string} phoneNumber - Admin phone number (optional, format: +1234567890)
 * @returns {Promise<{success: boolean, uid?: string, error?: string}>}
 */
export const createAdminAccount = async (email, password, username, phoneNumber = "") => {
  try {
    console.log('🔐 Creating admin account...');
    console.log('📧 Email:', email);
    console.log('👤 Username:', username);
    
    // Step 1: Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth account created with UID:', user.uid);
    
    // Step 2: Save admin data to Firestore
    const phoneNumberNum = phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) || 0 : 0;
    
    await setDoc(doc(db, "Resergodb", user.uid), {
      Username: username,
      Number: phoneNumberNum,
      Password: password, // In production, this should be hashed
      UserType: "admin",
      googleAcc: email
    });
    
    console.log('✅ Admin user data saved to Firestore');
    console.log('🎉 Admin account created successfully!');
    console.log('📋 Account Details:');
    console.log('   - UID:', user.uid);
    console.log('   - Email:', email);
    console.log('   - Username:', username);
    console.log('   - UserType: admin');
    console.log('');
    console.log('🔑 You can now login with:');
    console.log('   - Email:', email);
    console.log('   - Password:', password);
    console.log('   - From either Guest or Host login page');
    
    return {
      success: true,
      uid: user.uid,
      email: email,
      username: username
    };
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    
    let errorMessage = 'Failed to create admin account';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// If running directly (not imported), provide instructions
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('📝 Admin Account Creator');
  console.log('');
  console.log('This script can be used to create admin accounts.');
  console.log('');
  console.log('Usage in Browser Console:');
  console.log('1. Open your browser console (F12)');
  console.log('2. Navigate to your app (localhost:5173)');
  console.log('3. Run:');
  console.log('   import("./createAdminAccount.js").then(m => {');
  console.log('     m.createAdminAccount("admin@example.com", "password123", "Admin User", "+1234567890");');
  console.log('   });');
  console.log('');
  console.log('Or use the createAdminAccountUI() function in the browser console.');
}

// Make it available globally in browser for easy access
if (typeof window !== 'undefined') {
  window.createAdminAccount = createAdminAccount;
  console.log('💡 Admin account creator loaded! Use createAdminAccount(email, password, username, phoneNumber) in console.');
}

