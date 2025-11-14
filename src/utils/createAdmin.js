/**
 * Utility to create admin accounts from browser console
 * 
 * Usage in browser console:
 * import('./src/utils/createAdmin.js').then(m => {
 *   m.createAdmin('admin@resergo.com', 'password123', 'Admin User', '+1234567890');
 * });
 */

import { auth, saveAdminUserData } from "../../Config";
import { createUserWithEmailAndPassword } from "firebase/auth";

/**
 * Create an admin account
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @param {string} username - Admin username
 * @param {string} phoneNumber - Admin phone number (optional)
 */
export const createAdmin = async (email, password, username, phoneNumber = "") => {
  try {
    console.log('🔐 Creating admin account...');
    console.log('📧 Email:', email);
    console.log('👤 Username:', username);
    
    // Step 1: Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth account created with UID:', user.uid);
    
    // Step 2: Save admin data to Firestore
    await saveAdminUserData(user.uid, username, phoneNumber, password, email);
    
    console.log('✅ Admin user data saved to Firestore');
    console.log('🎉 Admin account created successfully!');
    console.log('');
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
    console.log('');
    
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
      errorMessage = 'An account with this email already exists. You can update the existing account to admin in Firestore.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak (must be at least 6 characters)';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    console.error('❌', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Make it available globally in browser for easy access
if (typeof window !== 'undefined') {
  window.createAdmin = createAdmin;
  console.log('💡 Admin creator loaded! Use createAdmin(email, password, username, phoneNumber) in console.');
}

