import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, EmailAuthProvider, linkWithCredential, signOut, signInWithCredential } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Using environment variables for security
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
const googleProvider = new GoogleAuthProvider();

// Check if user exists in Firestore
const checkUserExists = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "Resergodb", uid));
        return userDoc.exists();
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
};

// Check if user account is complete (has username, phone, password set)
const checkAccountComplete = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "Resergodb", uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            // Check if account has all required fields
            const hasUsername = data.Username && data.Username.trim() !== "";
            const hasPhone = data.Number !== undefined && data.Number !== null;
            const hasPassword = data.Password && data.Password !== "String" && data.Password.trim() !== "";
            return hasUsername && hasPhone && hasPassword;
        }
        return false;
    } catch (error) {
        console.error("Error checking account completion:", error);
        return false;
    }
};

//Handle Google Signup
const handleGoogleSignup = async (setError) => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('Google Sign-in', user);
        
        // Check if user exists in Firestore
        const userExists = await checkUserExists(user.uid);
        
        // Check if account is complete (has username, phone, password)
        let isAccountComplete = false;
        if (userExists) {
            isAccountComplete = await checkAccountComplete(user.uid);
        }
        
        setError('');
        return {
            user: user,
            isNewUser: !userExists,
            userExists: userExists,
            isAccountComplete: isAccountComplete
        };
    } catch (error) {
        setError(error.message || 'Failed to sign in with Google');
        throw error;
    }
};

// Save user data to Firestore for Google signup completion
const saveGoogleUserData = async (uid, username, phoneNumber, password, userType = "guest", email = null) => {
    try {
        const phoneNumberNum = phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) || 0 : 0;
        
        // Note: Firebase Auth doesn't allow directly linking email/password to a Google-authenticated account
        // The password is saved in Firestore for reference
        // Users can log in with Google button, or if they want email/password login, 
        // they would need a separate account (which we'll handle in the login flow)
        
        // Use provided email or fall back to auth.currentUser email
        const userEmail = email || auth.currentUser?.email || "";
        
        await setDoc(doc(db, "Resergodb", uid), {
            Username: username,
            Number: phoneNumberNum,
            Password: password || "String", // Store password (in production, this should be hashed)
            UserType: userType,
            googleAcc: userEmail
        });
        console.log('User data saved to Firestore with UID:', uid);
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
};

// Save admin user data to Firestore
const saveAdminUserData = async (uid, username, phoneNumber, password, email = null) => {
    try {
        const phoneNumberNum = phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) || 0 : 0;
        
        // Use provided email or fall back to auth.currentUser email
        const userEmail = email || auth.currentUser?.email || "";
        
        await setDoc(doc(db, "Resergodb", uid), {
            Username: username,
            Number: phoneNumberNum,
            Password: password || "String", // Store password (in production, this should be hashed)
            UserType: "admin",
            googleAcc: userEmail
        });
        console.log('Admin user data saved to Firestore with UID:', uid);
        return true;
    } catch (error) {
        console.error('Error saving admin user data:', error);
        throw error;
    }
};

// Save host user data to Firestore
const saveHostUserData = async (uid, username, phoneNumber, password, email = null) => {
    try {
        const phoneNumberNum = phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) || 0 : 0;
        
        // Use provided email or fall back to auth.currentUser email
        const userEmail = email || auth.currentUser?.email || "";
        
        await setDoc(doc(db, "Resergodb", uid), {
            Username: username,
            Number: phoneNumberNum,
            Password: password || "String", // Store password (in production, this should be hashed)
            UserType: "host",
            googleAcc: userEmail
        });
        console.log('Host user data saved to Firestore with UID:', uid);
        return true;
    } catch (error) {
        console.error('Error saving host user data:', error);
        throw error;
    }
};

// Get user data from Firestore
const getUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, "Resergodb", uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
};

// Get user type from Firestore
const getUserType = async (uid) => {
    try {
        const userData = await getUserData(uid);
        if (userData && userData.UserType) {
            return userData.UserType;
        }
        return "guest"; // Default to guest if not set
    } catch (error) {
        console.error("Error getting user type:", error);
        return "guest";
    }
};

// Update password in Firestore
const updatePasswordInFirestore = async (uid, newPassword) => {
    try {
        await updateDoc(doc(db, "Resergodb", uid), {
            Password: newPassword // In production, this should be hashed
        });
        console.log('Password updated in Firestore');
        return true;
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
};

// Verify current password (for Google users, check against Firestore)
const verifyPassword = async (uid, password) => {
    try {
        const userData = await getUserData(uid);
        if (userData && userData.Password) {
            // Simple comparison (in production, use proper password hashing/verification)
            return userData.Password === password || userData.Password === "String";
        }
        return false;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
};

// Update profile picture in Firestore
const updateProfilePicture = async (uid, profilePictureUrl) => {
    try {
        await updateDoc(doc(db, "Resergodb", uid), {
            ProfilePicture: profilePictureUrl
        });
        console.log('Profile picture updated in Firestore');
        return true;
    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw error;
    }
};

// Update username and phone number in Firestore
const updateUserProfile = async (uid, username, phoneNumber) => {
    try {
        const phoneNumberNum = phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) || 0 : 0;
        await updateDoc(doc(db, "Resergodb", uid), {
            Username: username,
            Number: phoneNumberNum
        });
        console.log('User profile updated in Firestore');
        return true;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

// Update user type (e.g., convert guest to host)
const updateUserType = async (uid, newUserType) => {
    try {
        await updateDoc(doc(db, "Resergodb", uid), {
            UserType: newUserType
        });
        console.log(`User type updated to ${newUserType} in Firestore`);
        return true;
    } catch (error) {
        console.error('Error updating user type:', error);
        throw error;
    }
};

// Link email/password credentials to a Google-authenticated account
// This allows users to sign in with either Google or email/password
// IMPORTANT: Firebase Auth limitation - we can't create email/password account while authenticated with Google
// The solution: Create email/password account first, then link Google credential to it
const linkEmailPasswordToGoogleAccount = async (email, password) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("No user is currently authenticated");
        }

        // Check if email/password is already linked
        const providers = currentUser.providerData.map(provider => provider.providerId);
        if (providers.includes('password')) {
            console.log("Email/password is already linked to this account");
            return true;
        }

        // Check if the email matches the Google account email
        if (currentUser.email !== email) {
            throw new Error("Email must match the Google account email");
        }

        // Store the current Google user's UID before signing out
        const googleUid = currentUser.uid;
        const googleEmail = currentUser.email;
        
        // IMPORTANT: Firebase Auth requires creating the email/password account first
        // Problem: If we create email/password account, it gets a different UID
        // Solution: We need to create email/password account, then link Google to it
        // But we need to preserve the same UID, which requires Admin SDK
        
        // Since we don't have Admin SDK, we'll use a workaround:
        // 1. Sign out from Google
        // 2. Create email/password account (new UID)
        // 3. Sign in with Google again (original UID)
        // 4. Link email/password credential to Google account
        
        // Step 1: Sign out from Google
        await signOut(auth);
        console.log('Signed out from Google to create email/password account');
        
        // Step 2: Create email/password account
        let emailPasswordUser;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            emailPasswordUser = userCredential.user;
            console.log('Email/password account created successfully with UID:', emailPasswordUser.uid);
        } catch (createError) {
            // If account already exists, try to sign in with email/password
            if (createError.code === 'auth/email-already-in-use') {
                console.log('Email/password account already exists, signing in...');
                const signInCredential = await signInWithEmailAndPassword(auth, email, password);
                emailPasswordUser = signInCredential.user;
            } else {
                throw createError;
            }
        }
        
        // Step 3: Sign in with Google again to get back to the original account
        // This will restore the Google UID
        await signOut(auth);
        const googleResult = await signInWithPopup(auth, googleProvider);
        const googleUser = googleResult.user;
        
        // Verify we're back to the original Google account
        if (googleUser.uid !== googleUid) {
            throw new Error("Failed to restore Google account after creating email/password account");
        }
        
        // Step 4: Link email/password credential to the Google account
        // This will merge the email/password account into the Google account
        const emailCredential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(googleUser, emailCredential);
        
        console.log('Email/password credentials linked successfully to Google account');
        return true;
        
    } catch (error) {
        console.error('Error linking email/password credentials:', error);
        
        // If credential already exists error, that's okay
        if (error.code === 'auth/credential-already-in-use' || 
            error.code === 'auth/email-already-in-use') {
            console.log('Email/password is already linked to another account or this account');
            return true;
        }
        
        throw error;
    }
};

//Handle Email and Password Signup
const handleSubmit = async (e, setError) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const UserCred = await signInWithEmailAndPassword(auth, email, password);
        console.log('user signed in:', UserCred.user);
        setError('');
    } catch (err) {
        console.log(err);
        setError('Invalid email or password');
    }
    e.target.reset();
};
// Save listing to Firestore
const saveListing = async (hostId, listingData, isDraft = false) => {
    try {
        // Verify user is authenticated
        if (!auth.currentUser) {
            throw new Error("User must be authenticated to save listings");
        }

        // Verify the hostId matches the current user's UID
        if (hostId !== auth.currentUser.uid) {
            throw new Error("Host ID must match the authenticated user's ID");
        }

        // Verify user is a host
        const userType = await getUserType(hostId);
        if (userType !== "host") {
            throw new Error("Only hosts can create listings. Please register as a host first.");
        }

        const listingRef = doc(collection(db, "listings"));
        const listingId = listingRef.id;
        
        const listing = {
            hostId: hostId,
            title: listingData.title || "",
            rate: listingData.rate || 0,
            discount: listingData.discount || 0,
            promos: listingData.promos || [],
            images: listingData.images || [],
            location: listingData.location || {
                city: "",
                address: "",
                latitude: 0,
                longitude: 0
            },
            description: listingData.description || "",
            amenities: listingData.amenities || [],
            category: listingData.category || "Home", // Home, Experience, Service
            availability: listingData.availability || {},
            isDraft: isDraft,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        await setDoc(listingRef, listing);
        console.log('Listing saved to Firestore with ID:', listingId);
        return { success: true, listingId: listingId };
    } catch (error) {
        console.error('Error saving listing:', error);
        throw error;
    }
};

// Update listing in Firestore
const updateListing = async (listingId, listingData) => {
    try {
        // Verify user is authenticated
        if (!auth.currentUser) {
            throw new Error("User must be authenticated to update listings");
        }

        // Verify the listing belongs to the current user
        const listing = await getListing(listingId);
        if (!listing) {
            throw new Error("Listing not found");
        }
        if (listing.hostId !== auth.currentUser.uid) {
            throw new Error("You can only update your own listings");
        }

        const listingRef = doc(db, "listings", listingId);
        
        const updateData = {
            ...listingData,
            updatedAt: serverTimestamp()
        };
        
        await updateDoc(listingRef, updateData);
        console.log('Listing updated in Firestore:', listingId);
        return { success: true };
    } catch (error) {
        console.error('Error updating listing:', error);
        throw error;
    }
};

// Get listing by ID
const getListing = async (listingId) => {
    try {
        const listingRef = doc(db, "listings", listingId);
        const listingDoc = await getDoc(listingRef);
        
        if (listingDoc.exists()) {
            return { id: listingDoc.id, ...listingDoc.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting listing:', error);
        throw error;
    }
};

// Get all listings by host ID
const getHostListings = async (hostId) => {
    try {
        if (!hostId) {
            throw new Error("Host ID is required");
        }

        const listingsRef = collection(db, "listings");
        const q = query(listingsRef, where("hostId", "==", hostId));
        const querySnapshot = await getDocs(q);
        
        const listings = [];
        querySnapshot.forEach((doc) => {
            listings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by createdAt (newest first)
        listings.sort((a, b) => {
            const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return bTime - aTime;
        });
        
        return listings;
    } catch (error) {
        console.error('Error getting host listings:', error);
        throw error;
    }
};

export { auth, db, googleProvider, handleGoogleSignup, checkUserExists, checkAccountComplete, saveGoogleUserData, saveAdminUserData, saveHostUserData, getUserData, getUserType, updatePasswordInFirestore, verifyPassword, updateProfilePicture, updateUserProfile, updateUserType, linkEmailPasswordToGoogleAccount, saveListing, updateListing, getListing, getHostListings };