import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, EmailAuthProvider, linkWithCredential, signOut, signInWithCredential } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, orderBy } from "firebase/firestore";
import { sendWelcomeEmail, sendBookingApprovalEmail, sendBookingRejectionEmail } from "./src/utils/emailService.js";

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
const saveGoogleUserData = async (uid, username, phoneNumber, password, userType = "guest", email = null, profilePicture = null) => {
    try {
        const phoneNumberNum = phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) || 0 : 0;
        
        // Note: Firebase Auth doesn't allow directly linking email/password to a Google-authenticated account
        // The password is saved in Firestore for reference
        // Users can log in with Google button, or if they want email/password login, 
        // they would need a separate account (which we'll handle in the login flow)
        
        // Use provided email or fall back to auth.currentUser email
        const userEmail = email || auth.currentUser?.email || "";
        
        const userData = {
            Username: username,
            Number: phoneNumberNum,
            Password: password || "String", // Store password (in production, this should be hashed)
            UserType: userType,
            googleAcc: userEmail
        };
        
        // Add profile picture if provided
        if (profilePicture) {
            userData.ProfilePicture = profilePicture;
        }
        
        await setDoc(doc(db, "Resergodb", uid), userData);
        console.log('User data saved to Firestore with UID:', uid);
        
        // Send welcome email after successful registration
        if (userEmail) {
            console.log('📧 Attempting to send welcome email to:', userEmail, 'UserType:', userType);
            try {
                const emailResult = await sendWelcomeEmail(userEmail, username, userType);
                if (emailResult.success) {
                    console.log('✅ Welcome email sent successfully to:', userEmail);
                } else {
                    console.warn('⚠️ Failed to send welcome email:', emailResult.error);
                }
            } catch (emailError) {
                // Log error but don't fail registration
                console.error('❌ Error sending welcome email:', emailError);
                console.error('❌ Error stack:', emailError.stack);
            }
        } else {
            console.warn('⚠️ No email address available, skipping welcome email');
        }
        
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
const saveHostUserData = async (uid, username, phoneNumber, password, email = null, profilePicture = null) => {
    try {
        const phoneNumberNum = phoneNumber ? parseInt(phoneNumber.replace(/\D/g, '')) || 0 : 0;
        
        // Use provided email or fall back to auth.currentUser email
        const userEmail = email || auth.currentUser?.email || "";
        
        const userData = {
            Username: username,
            Number: phoneNumberNum,
            Password: password || "String", // Store password (in production, this should be hashed)
            UserType: "host",
            googleAcc: userEmail
        };
        
        // Add profile picture if provided
        if (profilePicture) {
            userData.ProfilePicture = profilePicture;
        }
        
        await setDoc(doc(db, "Resergodb", uid), userData);
        console.log('Host user data saved to Firestore with UID:', uid);
        
        // Send welcome email after successful registration
        if (userEmail) {
            console.log('📧 Attempting to send welcome email to host:', userEmail);
            try {
                const emailResult = await sendWelcomeEmail(userEmail, username, "host");
                if (emailResult.success) {
                    console.log('✅ Welcome email sent successfully to host:', userEmail);
                } else {
                    console.warn('⚠️ Failed to send welcome email:', emailResult.error);
                }
            } catch (emailError) {
                // Log error but don't fail registration
                console.error('❌ Error sending welcome email:', emailError);
                console.error('❌ Error stack:', emailError.stack);
            }
        } else {
            console.warn('⚠️ No email address available, skipping welcome email');
        }
        
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
        console.warn("User document does not exist for UID:", uid);
        return null;
    } catch (error) {
        console.error("Error getting user data for UID:", uid, error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        // Check if it's a permission error
        if (error.code === 'permission-denied') {
            console.error("Permission denied - check Firestore security rules for Resergodb collection");
        }
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
            promos: listingData.promos || [],
            images: listingData.images || [],
            location: listingData.location || {
                city: "",
                address: "",
                latitude: 0,
                longitude: 0
            },
            description: listingData.description || "",
            basics: listingData.basics || {
                guests: 1,
                bedrooms: 1,
                beds: 1,
                bathrooms: 1
            },
            amenities: listingData.amenities || [],
            category: listingData.category || "Home", // Home, Experience, Service
            availability: listingData.availability || {},
            isDraft: isDraft,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        // Log images being saved
        console.log('Saving listing with images count:', listing.images?.length || 0);
        if (listing.images && listing.images.length > 0) {
            console.log('First image preview:', listing.images[0]?.substring(0, 100));
            console.log('First image starts with data:', listing.images[0]?.startsWith('data:'));
            // Calculate approximate size
            const totalSize = listing.images.reduce((sum, img) => sum + (img?.length || 0), 0);
            console.log('Total images size (approx):', (totalSize / 1024).toFixed(2), 'KB');
        }
        
        await setDoc(listingRef, listing);
        console.log('Listing saved to Firestore with ID:', listingId);
        console.log('Basics saved:', listing.basics);
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
        
        // Ensure basics are included if provided
        if (listingData.basics) {
            updateData.basics = listingData.basics;
        }
        
        await updateDoc(listingRef, updateData);
        console.log('Listing updated in Firestore:', listingId);
        if (updateData.basics) {
            console.log('Basics updated:', updateData.basics);
        }
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
            const data = { id: listingDoc.id, ...listingDoc.data() };
            console.log('Retrieved listing:', listingId);
            console.log('Listing images count:', data.images?.length || 0);
            if (data.images && data.images.length > 0) {
                console.log('First image preview:', data.images[0]?.substring(0, 100));
                console.log('First image starts with data:', data.images[0]?.startsWith('data:'));
            }
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting listing:', error);
        throw error;
    }
};

// Delete listing from Firestore
const deleteListing = async (listingId) => {
    try {
        // Verify user is authenticated
        if (!auth.currentUser) {
            throw new Error("User must be authenticated to delete listings");
        }

        // Verify the listing belongs to the current user
        const listing = await getListing(listingId);
        if (!listing) {
            throw new Error("Listing not found");
        }
        if (listing.hostId !== auth.currentUser.uid) {
            throw new Error("You can only delete your own listings");
        }

        const listingRef = doc(db, "listings", listingId);
        await deleteDoc(listingRef);
        console.log('Listing deleted from Firestore:', listingId);
        return { success: true };
    } catch (error) {
        console.error('Error deleting listing:', error);
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

// Get all published listings (for guest page)
// Optionally filter by category: "Home", "Experience", or "Service"
// Optionally filter by searchFilters: { location, guests }
const getPublishedListings = async (category = null, searchFilters = {}) => {
    try {
        const listingsRef = collection(db, "listings");
        
        // Query for published listings only (isDraft: false)
        let q;
        if (category) {
            // Filter by both isDraft and category
            q = query(
                listingsRef, 
                where("isDraft", "==", false),
                where("category", "==", category)
            );
        } else {
            // Only filter by isDraft
            q = query(listingsRef, where("isDraft", "==", false));
        }
        
        const querySnapshot = await getDocs(q);
        
        const listings = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            listings.push({
                id: doc.id,
                ...data
            });
        });
        
        // Client-side filtering for location and guests
        let filteredListings = listings;
        
        // Filter by location (case-insensitive search in city, address, or full location)
        if (searchFilters.location && searchFilters.location.trim()) {
            const locationLower = searchFilters.location.toLowerCase().trim();
            filteredListings = filteredListings.filter(listing => {
                const location = listing.location || {};
                const city = (location.city || "").toLowerCase();
                const address = (location.address || "").toLowerCase();
                const fullAddress = (location.fullAddress || "").toLowerCase();
                return city.includes(locationLower) || 
                       address.includes(locationLower) || 
                       fullAddress.includes(locationLower);
            });
        }
        
        // Filter by guests (listing must accommodate at least the requested number of guests)
        if (searchFilters.guests && searchFilters.guests > 0) {
            filteredListings = filteredListings.filter(listing => {
                const maxGuests = listing.basics?.guests || 1;
                return maxGuests >= searchFilters.guests;
            });
        }
        
        // Note: Date filtering (checkIn/checkOut) would require a booking system
        // For now, we'll skip date filtering as bookings are not yet implemented
        
        // Sort by createdAt (newest first)
        filteredListings.sort((a, b) => {
            const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return bTime - aTime;
        });
        
        return filteredListings;
    } catch (error) {
        console.error('Error getting published listings:', error);
        throw error;
    }
};

// Save review/comment for a listing
const saveReview = async (listingId, guestId, reviewData) => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be authenticated to leave a review");
        }

        if (guestId !== auth.currentUser.uid) {
            throw new Error("Guest ID must match the authenticated user's ID");
        }

        // Get guest data for the review
        const guestData = await getUserData(guestId);
        if (!guestData) {
            throw new Error("Guest data not found");
        }

        // Get listing to verify it exists
        const listing = await getListing(listingId);
        if (!listing) {
            throw new Error("Listing not found");
        }

        // Check if user already reviewed this listing
        const reviewsRef = collection(db, "reviews");
        const existingReviewQuery = query(
            reviewsRef,
            where("listingId", "==", listingId),
            where("guestId", "==", guestId)
        );
        const existingReviews = await getDocs(existingReviewQuery);
        
        if (!existingReviews.empty) {
            throw new Error("You have already reviewed this listing");
        }

        // Get guest profile picture - check multiple sources
        // Use placeholder if no profile picture is available (don't save empty string)
        const guestAvatar = (guestData.ProfilePicture && guestData.ProfilePicture.trim() !== "")
                           ? guestData.ProfilePicture
                           : (guestData.photoURL && guestData.photoURL.trim() !== "")
                           ? guestData.photoURL
                           : (auth.currentUser?.photoURL && auth.currentUser.photoURL.trim() !== "")
                           ? auth.currentUser.photoURL
                           : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%239ca3af'%3EGuest%3C/text%3E%3C/svg%3E";

        // Create review document
        const reviewRef = doc(collection(db, "reviews"));
        const review = {
            listingId: listingId,
            hostId: listing.hostId,
            guestId: guestId,
            guestName: guestData.Username || guestData.displayName || "Guest",
            guestAvatar: guestAvatar,
            rating: reviewData.rating || 5,
            comment: reviewData.comment || "",
            categoryRatings: reviewData.categoryRatings || {
                cleanliness: reviewData.rating || 5,
                accuracy: reviewData.rating || 5,
                checkin: reviewData.rating || 5,
                communication: reviewData.rating || 5,
                location: reviewData.rating || 5,
                value: reviewData.rating || 5
            },
            createdAt: serverTimestamp()
        };

        await setDoc(reviewRef, review);

        // Update listing rating
        await updateListingRating(listingId);

        // Add points to host for receiving a review (25 points per review)
        try {
            await addPoints(listing.hostId, 25, `Review received for ${listing.title}`, "earned");
            console.log("✅ Points added to host for received review");
        } catch (pointsError) {
            console.error("❌ Error adding points for review:", pointsError);
            // Don't fail the review save if points fail
        }

        console.log('Review saved successfully');
        return { success: true, reviewId: reviewRef.id };
    } catch (error) {
        console.error('Error saving review:', error);
        throw error;
    }
};

// Update a review
const updateReview = async (reviewId, reviewData) => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be authenticated to update a review");
        }

        // Get the review to verify ownership
        const reviewRef = doc(db, "reviews", reviewId);
        const reviewDoc = await getDoc(reviewRef);
        
        if (!reviewDoc.exists()) {
            throw new Error("Review not found");
        }

        const review = reviewDoc.data();
        
        // Verify the review belongs to the current user
        if (review.guestId !== auth.currentUser.uid) {
            throw new Error("You can only update your own reviews");
        }

        // Update the review
        await updateDoc(reviewRef, {
            rating: reviewData.rating || review.rating,
            comment: reviewData.comment || review.comment,
            categoryRatings: reviewData.categoryRatings || review.categoryRatings,
            updatedAt: serverTimestamp()
        });

        // Update listing rating
        await updateListingRating(review.listingId);

        console.log('Review updated successfully');
        return { success: true };
    } catch (error) {
        console.error('Error updating review:', error);
        throw error;
    }
};

// Get reviews for a listing
const getListingReviews = async (listingId) => {
    try {
        const reviewsRef = collection(db, "reviews");
        const reviewsQuery = query(
            reviewsRef,
            where("listingId", "==", listingId)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        const reviews = [];
        reviewsSnapshot.forEach((doc) => {
            reviews.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort by creation date (newest first)
        reviews.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            }
            return 0;
        });

        return reviews;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
};

// Update listing rating based on all reviews
const updateListingRating = async (listingId) => {
    try {
        const reviews = await getListingReviews(listingId);
        
        if (reviews.length === 0) {
            return;
        }

        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = totalRating / reviews.length;

        // Calculate average category ratings
        const categoryTotals = {
            cleanliness: 0,
            accuracy: 0,
            checkin: 0,
            communication: 0,
            location: 0,
            value: 0
        };

        reviews.forEach(review => {
            if (review.categoryRatings) {
                Object.keys(categoryTotals).forEach(category => {
                    categoryTotals[category] += review.categoryRatings[category] || 0;
                });
            }
        });

        const categoryAverages = {};
        Object.keys(categoryTotals).forEach(category => {
            categoryAverages[category] = categoryTotals[category] / reviews.length;
        });

        // Update listing with new rating
        const listingRef = doc(db, "listings", listingId);
        await updateDoc(listingRef, {
            rating: parseFloat(averageRating.toFixed(2)),
            reviewsCount: reviews.length,
            categoryRatings: categoryAverages,
            updatedAt: serverTimestamp()
        });

        console.log('Listing rating updated:', averageRating);
    } catch (error) {
        console.error('Error updating listing rating:', error);
        throw error;
    }
};

// Favorites functions
/**
 * Add a listing to user's favorites
 * @param {string} userId - The user's UID
 * @param {string} listingId - The listing ID to add to favorites
 * @returns {Promise<void>}
 */
export const addFavorite = async (userId, listingId) => {
    try {
        const favoritesRef = doc(db, "favorites", userId);
        const favoritesDoc = await getDoc(favoritesRef);
        
        if (favoritesDoc.exists()) {
            // Update existing favorites document
            const favorites = favoritesDoc.data().listingIds || [];
            if (!favorites.includes(listingId)) {
                favorites.push(listingId);
                await updateDoc(favoritesRef, {
                    listingIds: favorites,
                    updatedAt: serverTimestamp()
                });
            }
        } else {
            // Create new favorites document
            await setDoc(favoritesRef, {
                listingIds: [listingId],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error adding favorite:", error);
        throw error;
    }
};

/**
 * Remove a listing from user's favorites
 * @param {string} userId - The user's UID
 * @param {string} listingId - The listing ID to remove from favorites
 * @returns {Promise<void>}
 */
export const removeFavorite = async (userId, listingId) => {
    try {
        const favoritesRef = doc(db, "favorites", userId);
        const favoritesDoc = await getDoc(favoritesRef);
        
        if (favoritesDoc.exists()) {
            const favorites = favoritesDoc.data().listingIds || [];
            const updatedFavorites = favorites.filter(id => id !== listingId);
            await updateDoc(favoritesRef, {
                listingIds: updatedFavorites,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error removing favorite:", error);
        throw error;
    }
};

/**
 * Get all favorite listing IDs for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<string[]>} - Array of listing IDs
 */
export const getFavorites = async (userId) => {
    try {
        const favoritesRef = doc(db, "favorites", userId);
        const favoritesDoc = await getDoc(favoritesRef);
        
        if (favoritesDoc.exists()) {
            return favoritesDoc.data().listingIds || [];
        }
        return [];
    } catch (error) {
        console.error("Error getting favorites:", error);
        throw error;
    }
};

/**
 * Check if a listing is favorited by a user
 * @param {string} userId - The user's UID
 * @param {string} listingId - The listing ID to check
 * @returns {Promise<boolean>}
 */
export const isFavorite = async (userId, listingId) => {
    try {
        const favorites = await getFavorites(userId);
        return favorites.includes(listingId);
    } catch (error) {
        console.error("Error checking favorite:", error);
        return false;
    }
};

/**
 * Get all favorite listings with full data for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<Array>} - Array of listing objects
 */
export const getFavoriteListings = async (userId) => {
    try {
        const favoriteIds = await getFavorites(userId);
        if (favoriteIds.length === 0) {
            return [];
        }
        
        // Fetch all favorite listings
        const listingPromises = favoriteIds.map(listingId => getListing(listingId));
        const listings = await Promise.all(listingPromises);
        
        // Filter out any null/undefined listings (in case a listing was deleted)
        return listings.filter(listing => listing !== null && listing !== undefined);
    } catch (error) {
        console.error("Error getting favorite listings:", error);
        throw error;
    }
};

// Messaging functions
/**
 * Send a message between users
 * @param {string} senderId - The sender's UID
 * @param {string} receiverId - The receiver's UID
 * @param {string} listingId - The listing ID (optional, for context)
 * @param {string} messageText - The message content
 * @returns {Promise<string>} - The message ID
 */
export const sendMessage = async (senderId, receiverId, listingId, messageText) => {
    try {
        // Verify user is authenticated
        if (!auth.currentUser) {
            throw new Error("User must be authenticated to send a message");
        }
        
        // Verify senderId matches authenticated user
        if (senderId !== auth.currentUser.uid) {
            throw new Error("senderId must match authenticated user's UID");
        }
        
        // Validate required fields
        if (!receiverId) {
            throw new Error("receiverId is required");
        }
        
        if (!messageText || messageText.trim() === "") {
            throw new Error("message text is required");
        }
        
        // Create a conversation ID (sorted to ensure consistency)
        const conversationId = [senderId, receiverId].sort().join('_');
        
        // Create message document
        const messageData = {
            senderId,
            receiverId,
            listingId: listingId || null,
            message: messageText.trim(),
            read: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        console.log("Sending message with data:", {
            senderId,
            receiverId,
            listingId: listingId || null,
            message: messageText.trim(),
            currentUser: auth.currentUser.uid
        });
        
        const messagesRef = collection(db, "messages");
        
        // Log the exact data being sent for debugging
        console.log("Attempting to create message with:", {
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            listingId: messageData.listingId,
            message: messageData.message,
            read: messageData.read,
            currentUserUid: auth.currentUser?.uid,
            senderIdMatches: messageData.senderId === auth.currentUser?.uid
        });
        
        const messageDoc = await addDoc(messagesRef, messageData);
        console.log("✅ Message created successfully with ID:", messageDoc.id);
        
        // Update or create conversation document
        // Use setDoc with merge to avoid read permission issues
        try {
            const conversationRef = doc(db, "conversations", conversationId);
            console.log("Updating/creating conversation:", conversationId);
            console.log("Current user UID:", auth.currentUser?.uid);
            console.log("Sender ID:", senderId);
            console.log("Receiver ID:", receiverId);
            
            const sortedIds = [senderId, receiverId].sort();
            const conversationData = {
                participant1Id: sortedIds[0],
                participant2Id: sortedIds[1],
                listingId: listingId || null,
                lastMessage: messageText,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            // Only set createdAt if this is a new conversation
            // Use setDoc with merge: true to update if exists, create if not
            // This avoids needing read permission to check if it exists
            try {
                // Try to get the document first to check if createdAt exists
                const conversationDoc = await getDoc(conversationRef);
                if (!conversationDoc.exists()) {
                    // New conversation - add createdAt
                    conversationData.createdAt = serverTimestamp();
                }
            } catch (readError) {
                // If read fails, assume it's new and add createdAt
                console.log("Could not read conversation, assuming new:", readError);
                conversationData.createdAt = serverTimestamp();
            }
            
            console.log("Conversation data:", conversationData);
            console.log("User is participant1:", conversationData.participant1Id === auth.currentUser?.uid);
            console.log("User is participant2:", conversationData.participant2Id === auth.currentUser?.uid);
            console.log("Will pass create/update rule:", conversationData.participant1Id === auth.currentUser?.uid || conversationData.participant2Id === auth.currentUser?.uid);
            
            // Use setDoc with merge to create or update in one operation
            await setDoc(conversationRef, conversationData, { merge: true });
            console.log("✅ Conversation created/updated successfully");
        } catch (conversationError) {
            console.error("❌ Error updating/creating conversation:", conversationError);
            console.error("Conversation error code:", conversationError.code);
            console.error("Conversation error message:", conversationError.message);
            console.error("Conversation ID:", conversationId);
            console.error("Current user UID:", auth.currentUser?.uid);
            console.error("Sender ID:", senderId);
            console.error("Receiver ID:", receiverId);
            // Don't throw - message was already created, so we return success
            // The conversation can be created/updated later
            console.warn("⚠️ Message sent but conversation update failed. Message ID:", messageDoc.id);
        }
        
        return messageDoc.id;
    } catch (error) {
        console.error("Error sending message:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Current user:", auth.currentUser?.uid);
        
        // Log message data if available (using variables in scope)
        try {
            console.error("Message data that failed:", {
                senderId,
                receiverId,
                listingId: listingId || null,
                message: messageText?.trim(),
                currentUserUid: auth.currentUser?.uid
            });
        } catch (logError) {
            console.error("Could not log message data (variables out of scope)");
        }
        
        // Provide more helpful error message
        if (error.code === 'permission-denied') {
            console.error("⚠️ PERMISSION DENIED - Firestore rules need to be updated!");
            console.error("Go to Firebase Console > Firestore Database > Rules");
            console.error("Copy the rules from FIRESTORE_RULES_LISTINGS.md and publish them");
        }
        
        throw error;
    }
};

/**
 * Get all messages between two users
 * @param {string} userId1 - First user's UID
 * @param {string} userId2 - Second user's UID
 * @returns {Promise<Array>} - Array of message objects
 */
export const getMessages = async (userId1, userId2) => {
    try {
        const messagesRef = collection(db, "messages");
        
        // Get messages where user1 is sender and user2 is receiver
        const q1 = query(
            messagesRef,
            where("senderId", "==", userId1),
            where("receiverId", "==", userId2)
        );
        
        // Get messages where user2 is sender and user1 is receiver
        const q2 = query(
            messagesRef,
            where("senderId", "==", userId2),
            where("receiverId", "==", userId1)
        );
        
        const [snapshot1, snapshot2] = await Promise.all([
            getDocs(q1),
            getDocs(q2)
        ]);
        
        const messages = [];
        
        snapshot1.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        snapshot2.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by creation time
        messages.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeA - timeB;
        });
        
        return messages;
    } catch (error) {
        console.error("Error getting messages:", error);
        throw error;
    }
};

/**
 * Get all conversations for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<Array>} - Array of conversation objects
 */
export const getConversations = async (userId) => {
    try {
        const conversationsRef = collection(db, "conversations");
        
        // Get conversations where user is participant1 or participant2
        const q1 = query(conversationsRef, where("participant1Id", "==", userId));
        const q2 = query(conversationsRef, where("participant2Id", "==", userId));
        
        const [snapshot1, snapshot2] = await Promise.all([
            getDocs(q1),
            getDocs(q2)
        ]);
        
        const conversations = [];
        
        snapshot1.forEach((doc) => {
            conversations.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        snapshot2.forEach((doc) => {
            conversations.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by last message time
        conversations.sort((a, b) => {
            const timeA = a.lastMessageTime?.toMillis() || 0;
            const timeB = b.lastMessageTime?.toMillis() || 0;
            return timeB - timeA; // Most recent first
        });
        
        return conversations;
    } catch (error) {
        console.error("Error getting conversations:", error);
        throw error;
    }
};

/**
 * Mark messages as read
 * @param {string} userId - The user's UID (receiver)
 * @param {string} senderId - The sender's UID
 * @returns {Promise<void>}
 */
export const markMessagesAsRead = async (userId, senderId) => {
    try {
        const messagesRef = collection(db, "messages");
        const q = query(
            messagesRef,
            where("senderId", "==", senderId),
            where("receiverId", "==", userId),
            where("read", "==", false)
        );
        
        const snapshot = await getDocs(q);
        const updatePromises = [];
        
        snapshot.forEach((doc) => {
            updatePromises.push(updateDoc(doc.ref, {
                read: true,
                readAt: serverTimestamp()
            }));
        });
        
        await Promise.all(updatePromises);
    } catch (error) {
        console.error("Error marking messages as read:", error);
        throw error;
    }
};

/**
 * Delete a conversation and all associated messages
 * @param {string} userId - The user's UID who is deleting the conversation
 * @param {string} otherUserId - The other participant's UID
 * @returns {Promise<void>}
 */
export const deleteConversation = async (userId, otherUserId) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== userId) {
            throw new Error("Unauthorized: Only the user can delete their own conversations");
        }

        // Generate conversation ID (sorted IDs joined with underscore)
        const conversationId = [userId, otherUserId].sort().join('_');
        const conversationRef = doc(db, "conversations", conversationId);
        
        // Check if conversation exists and user is a participant
        const conversationDoc = await getDoc(conversationRef);
        if (!conversationDoc.exists()) {
            throw new Error("Conversation not found");
        }
        
        const conversationData = conversationDoc.data();
        if (conversationData.participant1Id !== userId && conversationData.participant2Id !== userId) {
            throw new Error("Unauthorized: User is not a participant in this conversation");
        }

        // Delete all messages between the two users (both directions)
        const messagesRef = collection(db, "messages");
        
        // Query 1: Messages where userId is sender and otherUserId is receiver
        const q1 = query(
            messagesRef,
            where("senderId", "==", userId),
            where("receiverId", "==", otherUserId)
        );
        
        // Query 2: Messages where otherUserId is sender and userId is receiver
        const q2 = query(
            messagesRef,
            where("senderId", "==", otherUserId),
            where("receiverId", "==", userId)
        );
        
        const [snapshot1, snapshot2] = await Promise.all([
            getDocs(q1),
            getDocs(q2)
        ]);
        
        // Delete all messages
        const deletePromises = [];
        snapshot1.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        snapshot2.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(deletePromises);
        console.log(`✅ Deleted ${snapshot1.size + snapshot2.size} messages`);
        
        // Delete the conversation document
        await deleteDoc(conversationRef);
        console.log(`✅ Deleted conversation: ${conversationId}`);
        
    } catch (error) {
        console.error("Error deleting conversation:", error);
        throw error;
    }
};

/**
 * Get unread message count for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<number>} - Number of unread messages
 */
export const getUnreadMessageCount = async (userId) => {
    try {
        const messagesRef = collection(db, "messages");
        const q = query(
            messagesRef,
            where("receiverId", "==", userId),
            where("read", "==", false)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error("Error getting unread message count:", error);
        return 0;
    }
};

/**
 * Get unread message count per conversation for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<Object>} - Object with conversationId as key and unread count as value
 */
export const getUnreadCountsByConversation = async (userId) => {
    try {
        const messagesRef = collection(db, "messages");
        const q = query(
            messagesRef,
            where("receiverId", "==", userId),
            where("read", "==", false)
        );
        
        const snapshot = await getDocs(q);
        const counts = {};
        
        snapshot.forEach((doc) => {
            const message = doc.data();
            const conversationId = [message.senderId, message.receiverId].sort().join('_');
            counts[conversationId] = (counts[conversationId] || 0) + 1;
        });
        
        return counts;
    } catch (error) {
        console.error("Error getting unread counts by conversation:", error);
        return {};
    }
};

// Wallet Functions
// Get wallet balance for a user
export const getWalletBalance = async (userId) => {
    try {
        const walletRef = doc(db, "wallets", userId);
        const walletDoc = await getDoc(walletRef);
        
        if (walletDoc.exists()) {
            return walletDoc.data().balance || 0;
        } else {
            // Create wallet with 0 balance if it doesn't exist
            await setDoc(walletRef, {
                balance: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return 0;
        }
    } catch (error) {
        console.error("Error getting wallet balance:", error);
        throw error;
    }
};

// Top-up wallet using PayPal
export const topUpWallet = async (userId, amount, paymentMethod = "paypal", transactionId = null) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== userId) {
            throw new Error("Unauthorized: User must be authenticated");
        }
        
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }
        
        const walletRef = doc(db, "wallets", userId);
        const walletDoc = await getDoc(walletRef);
        
        const currentBalance = walletDoc.exists() ? (walletDoc.data().balance || 0) : 0;
        const newBalance = currentBalance + amount;
        
        // Update wallet balance
        await setDoc(walletRef, {
            balance: newBalance,
            updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Create transaction record
        const transactionRef = collection(db, "transactions");
        await addDoc(transactionRef, {
            userId,
            type: "topup",
            amount,
            paymentMethod,
            transactionId: transactionId || `paypal_${Date.now()}`,
            status: "completed",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        return { success: true, newBalance };
    } catch (error) {
        console.error("Error topping up wallet:", error);
        throw error;
    }
};

// Withdraw from wallet
export const withdrawFromWallet = async (userId, amount, paymentMethod = "paypal", accountDetails = {}) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== userId) {
            throw new Error("Unauthorized: User must be authenticated");
        }
        
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }
        
        const walletRef = doc(db, "wallets", userId);
        const walletDoc = await getDoc(walletRef);
        
        const currentBalance = walletDoc.exists() ? (walletDoc.data().balance || 0) : 0;
        
        if (currentBalance < amount) {
            throw new Error("Insufficient balance");
        }
        
        // DON'T deduct money yet - wait for admin approval
        // Just create a pending transaction record
        const transactionRef = collection(db, "transactions");
        const transactionDoc = await addDoc(transactionRef, {
            userId,
            type: "withdrawal",
            amount,
            paymentMethod,
            accountDetails,
            status: "pending", // Pending until admin approves
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        // Return current balance (unchanged) and transaction ID
        return { success: true, newBalance: currentBalance, transactionId: transactionDoc.id };
    } catch (error) {
        console.error("Error creating withdrawal request:", error);
        throw error;
    }
};

// Approve withdrawal - deduct money and update status
export const approveWithdrawal = async (transactionId) => {
    try {
        if (!auth.currentUser) {
            throw new Error("Unauthorized: User must be authenticated");
        }
        
        // Check if user is admin
        const userType = await getUserType(auth.currentUser.uid);
        if (userType !== "admin") {
            throw new Error("Unauthorized: Only admins can approve withdrawals");
        }
        
        const transactionRef = doc(db, "transactions", transactionId);
        const transactionDoc = await getDoc(transactionRef);
        
        if (!transactionDoc.exists()) {
            throw new Error("Transaction not found");
        }
        
        const transaction = transactionDoc.data();
        
        // Check if already processed
        if (transaction.status !== "pending") {
            throw new Error(`Transaction is already ${transaction.status}`);
        }
        
        // Check if it's a withdrawal
        if (transaction.type !== "withdrawal") {
            throw new Error("Can only approve withdrawal transactions");
        }
        
        const userId = transaction.userId;
        const amount = transaction.amount;
        
        // Check current balance
        const walletRef = doc(db, "wallets", userId);
        const walletDoc = await getDoc(walletRef);
        const currentBalance = walletDoc.exists() ? (walletDoc.data().balance || 0) : 0;
        
        if (currentBalance < amount) {
            // Update transaction status to rejected due to insufficient balance
            await updateDoc(transactionRef, {
                status: "rejected",
                rejectionReason: "Insufficient balance at time of approval",
                updatedAt: serverTimestamp()
            });
            throw new Error("Insufficient balance - withdrawal rejected");
        }
        
        const newBalance = currentBalance - amount;
        
        // Deduct money from wallet
        await setDoc(walletRef, {
            balance: newBalance,
            updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Update transaction status to completed
        await updateDoc(transactionRef, {
            status: "completed",
            approvedBy: auth.currentUser.uid,
            approvedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        return { success: true, newBalance };
    } catch (error) {
        console.error("Error approving withdrawal:", error);
        throw error;
    }
};

// Reject withdrawal - just update status, don't deduct money
export const rejectWithdrawal = async (transactionId, reason = "") => {
    try {
        if (!auth.currentUser) {
            throw new Error("Unauthorized: User must be authenticated");
        }
        
        // Check if user is admin
        const userType = await getUserType(auth.currentUser.uid);
        if (userType !== "admin") {
            throw new Error("Unauthorized: Only admins can reject withdrawals");
        }
        
        const transactionRef = doc(db, "transactions", transactionId);
        const transactionDoc = await getDoc(transactionRef);
        
        if (!transactionDoc.exists()) {
            throw new Error("Transaction not found");
        }
        
        const transaction = transactionDoc.data();
        
        // Check if already processed
        if (transaction.status !== "pending") {
            throw new Error(`Transaction is already ${transaction.status}`);
        }
        
        // Update transaction status to rejected
        await updateDoc(transactionRef, {
            status: "rejected",
            rejectionReason: reason || "Withdrawal rejected by admin",
            rejectedBy: auth.currentUser.uid,
            rejectedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error rejecting withdrawal:", error);
        throw error;
    }
};

// Get transaction history
export const getTransactionHistory = async (userId, limit = 50) => {
    try {
        const transactionsRef = collection(db, "transactions");
        const q = query(
            transactionsRef,
            where("userId", "==", userId)
        );
        
        const snapshot = await getDocs(q);
        const transactions = [];
        
        snapshot.forEach((doc) => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by createdAt descending (newest first)
        transactions.sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return bTime - aTime;
        });
        
        return transactions.slice(0, limit);
    } catch (error) {
        console.error("Error getting transaction history:", error);
        throw error;
    }
};

// Coupon Functions
// Create a coupon for a host
export const createCoupon = async (hostId, couponData) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== hostId) {
            throw new Error("Unauthorized: User must be authenticated and match hostId");
        }
        
        const couponRef = collection(db, "coupons");
        const couponDoc = {
            hostId,
            code: couponData.code.toUpperCase().trim(),
            discountType: couponData.discountType || "percentage", // "percentage" or "fixed"
            discountValue: couponData.discountValue, // percentage (0-100) or fixed amount
            description: couponData.description || "",
            expiresAt: couponData.expiresAt, // Firestore Timestamp
            isActive: couponData.isActive !== undefined ? couponData.isActive : true,
            usedBy: [], // Array of guest user IDs who have used this coupon (one use per guest)
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        await addDoc(couponRef, couponDoc);
        return { success: true };
    } catch (error) {
        console.error("Error creating coupon:", error);
        throw error;
    }
};

// Get all coupons for a host
export const getHostCoupons = async (hostId) => {
    try {
        const couponsRef = collection(db, "coupons");
        const q = query(
            couponsRef,
            where("hostId", "==", hostId)
        );
        
        const snapshot = await getDocs(q);
        const coupons = [];
        
        snapshot.forEach((doc) => {
            coupons.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by createdAt descending (newest first)
        coupons.sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return bTime - aTime;
        });
        
        return coupons;
    } catch (error) {
        console.error("Error getting host coupons:", error);
        throw error;
    }
};

// Get coupons for a specific listing (by hostId)
export const getListingCoupons = async (hostId) => {
    try {
        // Get all active coupons for the host
        const coupons = await getHostCoupons(hostId);
        const now = new Date();
        
        // Filter active, non-expired coupons
        return coupons.filter(coupon => {
            if (!coupon.isActive) return false;
            if (coupon.expiresAt) {
                const expiresAt = coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt);
                if (expiresAt < now) return false;
            }
            return true;
        });
    } catch (error) {
        console.error("Error getting listing coupons:", error);
        throw error;
    }
};

// Validate and apply a coupon code
export const validateCoupon = async (couponCode, hostId, listingPrice, guestId = null) => {
    try {
        if (!auth.currentUser) {
            return { valid: false, error: "You must be logged in to use a coupon" };
        }

        // Use current user as guestId if not provided
        const userId = guestId || auth.currentUser.uid;

        const couponsRef = collection(db, "coupons");
        // First, find the coupon by code (without hostId filter to check if it exists)
        const codeQuery = query(
            couponsRef,
            where("code", "==", couponCode.toUpperCase().trim()),
            where("isActive", "==", true)
        );
        
        const codeSnapshot = await getDocs(codeQuery);
        
        if (codeSnapshot.empty) {
            return { valid: false, error: "Invalid coupon code" };
        }
        
        // Now check if the coupon belongs to the listing's host
        const couponDoc = codeSnapshot.docs[0];
        const couponData = couponDoc.data();
        
        // Verify the coupon belongs to the listing's host
        if (couponData.hostId !== hostId) {
            return { valid: false, error: "This coupon is not valid for this listing. Coupons can only be used on the host's own listings." };
        }
        
        // If we get here, the coupon is valid for this host's listing
        const coupon = couponData;
        const couponId = couponDoc.id;
        const now = new Date();
        
        // Check expiration
        if (coupon.expiresAt) {
            const expiresAt = coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt);
            if (expiresAt < now) {
                return { valid: false, error: "Coupon has expired" };
            }
        }
        
        // Check if this guest has already used the coupon
        const usedBy = coupon.usedBy || [];
        if (usedBy.includes(userId)) {
            return { valid: false, error: "You have already used this coupon" };
        }
        
        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === "percentage") {
            discountAmount = (listingPrice * coupon.discountValue) / 100;
        } else {
            discountAmount = Math.min(coupon.discountValue, listingPrice); // Fixed amount, can't exceed price
        }
        
        return {
            valid: true,
            couponId,
            discountAmount,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            description: coupon.description
        };
    } catch (error) {
        console.error("Error validating coupon:", error);
        return { valid: false, error: "Error validating coupon" };
    }
};

// Mark coupon as used by a guest (call this after successful booking)
export const markCouponAsUsed = async (couponId, guestId) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== guestId) {
            throw new Error("Unauthorized: User must be authenticated and match guestId");
        }

        const couponRef = doc(db, "coupons", couponId);
        const couponDoc = await getDoc(couponRef);
        
        if (!couponDoc.exists()) {
            throw new Error("Coupon not found");
        }

        const coupon = couponDoc.data();
        const usedBy = coupon.usedBy || [];
        
        // Only add if not already in the list
        if (!usedBy.includes(guestId)) {
            await updateDoc(couponRef, {
                usedBy: [...usedBy, guestId],
                updatedAt: serverTimestamp()
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error marking coupon as used:", error);
        throw error;
    }
};

// Update coupon
export const updateCoupon = async (couponId, hostId, updateData) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== hostId) {
            throw new Error("Unauthorized: User must be authenticated and match hostId");
        }
        
        const couponRef = doc(db, "coupons", couponId);
        await updateDoc(couponRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error updating coupon:", error);
        throw error;
    }
};

// Delete coupon
export const deleteCoupon = async (couponId, hostId) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== hostId) {
            throw new Error("Unauthorized: User must be authenticated and match hostId");
        }
        
        const couponRef = doc(db, "coupons", couponId);
        await deleteDoc(couponRef);
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting coupon:", error);
        throw error;
    }
};

// ========== BOOKING FUNCTIONS ==========

// Create a new booking (pending status, no payment deduction)
export const createBooking = async (listingId, bookingData) => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be authenticated to create a booking");
        }

        const guestId = auth.currentUser.uid;
        const listingDoc = await getDoc(doc(db, "listings", listingId));
        
        if (!listingDoc.exists()) {
            throw new Error("Listing not found");
        }

        const listing = listingDoc.data();
        const hostId = listing.hostId;

        // Calculate total amount
        const checkInDate = new Date(bookingData.checkIn);
        const checkOutDate = new Date(bookingData.checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        // Use 'rate' field (not 'price') as that's what listings use
        const listingRate = listing.rate || listing.price || 0;
        const basePrice = listingRate * nights;
        
        // Apply coupon discount if provided
        let finalPrice = basePrice;
        let couponId = null;
        let couponCode = null;
        
        if (bookingData.couponCode) {
            const couponResult = await validateCoupon(bookingData.couponCode, listingId);
            if (couponResult.valid) {
                finalPrice = basePrice - couponResult.discountAmount;
                couponId = couponResult.couponId;
                couponCode = bookingData.couponCode;
            }
        }

        // Get guest data for email
        const guestData = await getUserData(guestId);
        const hostData = await getUserData(hostId);

        // Create booking document
        const bookingRef = await addDoc(collection(db, "bookings"), {
            listingId: listingId,
            listingTitle: listing.title,
            hostId: hostId,
            hostName: hostData?.Username || "Host",
            hostEmail: hostData?.Email || auth.currentUser.email,
            guestId: guestId,
            guestName: guestData?.Username || "Guest",
            guestEmail: guestData?.Email || auth.currentUser.email,
            checkIn: Timestamp.fromDate(checkInDate),
            checkOut: Timestamp.fromDate(checkOutDate),
            guests: bookingData.guests || 1,
            status: "pending", // pending, active, canceled, cancel_requested
            totalAmount: finalPrice,
            basePrice: basePrice,
            couponId: couponId,
            couponCode: couponCode,
            discountAmount: basePrice - finalPrice,
            paymentStatus: "pending", // pending, paid, refunded
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return { success: true, bookingId: bookingRef.id };
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

// Get bookings for a host
export const getHostBookings = async (hostId) => {
    try {
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("hostId", "==", hostId)
        );
        
        const querySnapshot = await getDocs(bookingsQuery);
        const bookings = [];
        
        querySnapshot.forEach((doc) => {
            bookings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by check-in date (upcoming first)
        bookings.sort((a, b) => {
            const dateA = a.checkIn?.toMillis() || 0;
            const dateB = b.checkIn?.toMillis() || 0;
            return dateA - dateB;
        });
        
        return bookings;
    } catch (error) {
        console.error("Error fetching host bookings:", error);
        throw error;
    }
};

// Get bookings for a guest
export const getGuestBookings = async (guestId) => {
    try {
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("guestId", "==", guestId)
        );
        
        const querySnapshot = await getDocs(bookingsQuery);
        const bookings = [];
        
        querySnapshot.forEach((doc) => {
            bookings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by check-in date (upcoming first)
        bookings.sort((a, b) => {
            const dateA = a.checkIn?.toMillis() || 0;
            const dateB = b.checkIn?.toMillis() || 0;
            return dateA - dateB;
        });
        
        return bookings;
    } catch (error) {
        console.error("Error fetching guest bookings:", error);
        throw error;
    }
};

// Update booking status (approve or cancel)
export const updateBookingStatus = async (bookingId, status, hostId) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== hostId) {
            throw new Error("Unauthorized: Only the host can update booking status");
        }

        const bookingRef = doc(db, "bookings", bookingId);
        const bookingDoc = await getDoc(bookingRef);
        
        if (!bookingDoc.exists()) {
            throw new Error("Booking not found");
        }

        const booking = bookingDoc.data();
        
        // Verify hostId matches
        if (booking.hostId !== hostId) {
            console.error("Booking hostId mismatch:", { bookingHostId: booking.hostId, currentHostId: hostId });
            throw new Error("Unauthorized: Booking does not belong to this host");
        }
        
        if (booking.status !== "pending") {
            throw new Error(`Cannot update booking with status: ${booking.status}`);
        }

        if (status === "active") {
            // Deduct payment from guest's wallet
            const guestWalletRef = doc(db, "wallets", booking.guestId);
            const guestWalletDoc = await getDoc(guestWalletRef);
            
            let currentBalance = 0;
            if (guestWalletDoc.exists()) {
                currentBalance = guestWalletDoc.data().balance || 0;
            }
            
            if (currentBalance < booking.totalAmount) {
                throw new Error("Guest has insufficient funds");
            }

            // Deduct from guest wallet
            try {
                await setDoc(guestWalletRef, {
                    balance: currentBalance - booking.totalAmount,
                    updatedAt: serverTimestamp()
                }, { merge: true });
                console.log("✅ Guest wallet updated successfully");
            } catch (walletError) {
                console.error("❌ Error updating guest wallet:", walletError);
                throw new Error(`Failed to update guest wallet: ${walletError.message}`);
            }

            // Add to host wallet
            const hostWalletRef = doc(db, "wallets", hostId);
            const hostWalletDoc = await getDoc(hostWalletRef);
            
            let hostBalance = 0;
            if (hostWalletDoc.exists()) {
                hostBalance = hostWalletDoc.data().balance || 0;
            }
            
            try {
                await setDoc(hostWalletRef, {
                    balance: hostBalance + booking.totalAmount,
                    updatedAt: serverTimestamp()
                }, { merge: true });
                console.log("✅ Host wallet updated successfully");
            } catch (walletError) {
                console.error("❌ Error updating host wallet:", walletError);
                throw new Error(`Failed to update host wallet: ${walletError.message}`);
            }

            // Create transaction records
            try {
                await addDoc(collection(db, "transactions"), {
                    userId: booking.guestId,
                    type: "booking_payment",
                    amount: -booking.totalAmount,
                    description: `Booking payment for ${booking.listingTitle}`,
                    bookingId: bookingId,
                    createdAt: serverTimestamp()
                });
                console.log("✅ Guest transaction created successfully");
            } catch (transactionError) {
                console.error("❌ Error creating guest transaction:", transactionError);
                throw new Error(`Failed to create guest transaction: ${transactionError.message}`);
            }

            // Add points to host for completed booking (50 points per booking)
            try {
                await addPoints(hostId, 50, `Booking completed: ${booking.listingTitle}`, "earned");
                console.log("✅ Points added to host for completed booking");
            } catch (pointsError) {
                console.error("❌ Error adding points for booking:", pointsError);
                // Don't fail the booking update if points fail
            }

            try {
                await addDoc(collection(db, "transactions"), {
                    userId: hostId,
                    type: "booking_revenue",
                    amount: booking.totalAmount,
                    description: `Booking revenue from ${booking.guestName}`,
                    bookingId: bookingId,
                    createdAt: serverTimestamp()
                });
                console.log("✅ Host transaction created successfully");
            } catch (transactionError) {
                console.error("❌ Error creating host transaction:", transactionError);
                throw new Error(`Failed to create host transaction: ${transactionError.message}`);
            }

            // Update booking status
            try {
                await updateDoc(bookingRef, {
                    status: "active",
                    paymentStatus: "paid",
                    updatedAt: serverTimestamp()
                });
                console.log("✅ Booking status updated successfully");
            } catch (updateError) {
                console.error("❌ Error updating booking status:", updateError);
                console.error("Booking data:", booking);
                console.error("Host ID:", hostId);
                console.error("Current user:", auth.currentUser?.uid);
                throw new Error(`Failed to update booking status: ${updateError.message}`);
            }

            // Send approval email to guest
            if (booking.guestEmail) {
                try {
                    // Format dates for email
                    const checkInDate = booking.checkIn?.toDate ? booking.checkIn.toDate() : (booking.checkIn ? new Date(booking.checkIn) : null);
                    const checkOutDate = booking.checkOut?.toDate ? booking.checkOut.toDate() : (booking.checkOut ? new Date(booking.checkOut) : null);
                    
                    const checkInFormatted = checkInDate ? checkInDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'N/A';
                    
                    const checkOutFormatted = checkOutDate ? checkOutDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'N/A';

                    const emailResult = await sendBookingApprovalEmail(
                        booking.guestEmail,
                        booking.guestName || 'Guest',
                        booking.listingTitle || 'Your Booking',
                        checkInFormatted,
                        checkOutFormatted,
                        booking.totalAmount || 0
                    );
                    
                    if (emailResult.success) {
                        console.log('✅ Booking approval email sent successfully to:', booking.guestEmail);
                    } else {
                        console.warn('⚠️ Failed to send booking approval email:', emailResult.error);
                    }
                } catch (emailError) {
                    // Log error but don't fail booking approval
                    console.error('❌ Error sending booking approval email:', emailError);
                }
            }

        } else if (status === "canceled") {
            // Update booking status
            try {
                await updateDoc(bookingRef, {
                    status: "canceled",
                    updatedAt: serverTimestamp()
                });
                console.log("✅ Booking status updated to canceled successfully");
            } catch (updateError) {
                console.error("❌ Error updating booking status to canceled:", updateError);
                console.error("Booking data:", booking);
                console.error("Host ID:", hostId);
                console.error("Current user:", auth.currentUser?.uid);
                throw new Error(`Failed to update booking status: ${updateError.message}`);
            }

            // Send rejection email to guest
            if (booking.guestEmail) {
                try {
                    // Format dates for email
                    const checkInDate = booking.checkIn?.toDate ? booking.checkIn.toDate() : (booking.checkIn ? new Date(booking.checkIn) : null);
                    const checkOutDate = booking.checkOut?.toDate ? booking.checkOut.toDate() : (booking.checkOut ? new Date(booking.checkOut) : null);
                    
                    const checkInFormatted = checkInDate ? checkInDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'N/A';
                    
                    const checkOutFormatted = checkOutDate ? checkOutDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'N/A';

                    const emailResult = await sendBookingRejectionEmail(
                        booking.guestEmail,
                        booking.guestName || 'Guest',
                        booking.listingTitle || 'Your Booking',
                        checkInFormatted,
                        checkOutFormatted
                    );
                    
                    if (emailResult.success) {
                        console.log('✅ Booking rejection email sent successfully to:', booking.guestEmail);
                    } else {
                        console.warn('⚠️ Failed to send booking rejection email:', emailResult.error);
                    }
                } catch (emailError) {
                    // Log error but don't fail booking rejection
                    console.error('❌ Error sending booking rejection email:', emailError);
                }
            }
        } else if (status === "cancel_requested") {
            // Guest requested cancellation - needs host approval
            try {
                await updateDoc(bookingRef, {
                    status: "cancel_requested",
                    updatedAt: serverTimestamp()
                });
                console.log("✅ Booking status updated to cancel_requested successfully");
            } catch (updateError) {
                console.error("❌ Error updating booking status to cancel_requested:", updateError);
                console.error("Booking data:", booking);
                console.error("Host ID:", hostId);
                console.error("Current user:", auth.currentUser?.uid);
                throw new Error(`Failed to update booking status: ${updateError.message}`);
            }
        } else {
            throw new Error(`Invalid status: ${status}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating booking status:", error);
        throw error;
    }
};

// Request cancellation (guest function)
export const requestCancelBooking = async (bookingId, guestId) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== guestId) {
            throw new Error("Unauthorized: Only the guest can request cancellation");
        }

        const bookingRef = doc(db, "bookings", bookingId);
        const bookingDoc = await getDoc(bookingRef);
        
        if (!bookingDoc.exists()) {
            throw new Error("Booking not found");
        }

        const booking = bookingDoc.data();
        
        if (booking.status !== "active" && booking.status !== "pending") {
            throw new Error(`Cannot cancel booking with status: ${booking.status}`);
        }

        // Update booking status to cancel_requested
        await updateDoc(bookingRef, {
            status: "cancel_requested",
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error("Error requesting cancellation:", error);
        throw error;
    }
};

// Approve cancellation request (host function)
export const approveCancelBooking = async (bookingId, hostId) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== hostId) {
            throw new Error("Unauthorized: Only the host can approve cancellation");
        }

        const bookingRef = doc(db, "bookings", bookingId);
        const bookingDoc = await getDoc(bookingRef);
        
        if (!bookingDoc.exists()) {
            throw new Error("Booking not found");
        }

        const booking = bookingDoc.data();
        
        if (booking.status !== "cancel_requested") {
            throw new Error(`Cannot approve cancellation for booking with status: ${booking.status}`);
        }

        // If payment was already made, refund to guest
        if (booking.paymentStatus === "paid") {
            // Refund to guest wallet
            const guestWalletRef = doc(db, "wallets", booking.guestId);
            const guestWalletDoc = await getDoc(guestWalletRef);
            
            let currentBalance = 0;
            if (guestWalletDoc.exists()) {
                currentBalance = guestWalletDoc.data().balance || 0;
            }
            
            await setDoc(guestWalletRef, {
                balance: currentBalance + booking.totalAmount,
                updatedAt: serverTimestamp()
            }, { merge: true });

            // Deduct from host wallet
            const hostWalletRef = doc(db, "wallets", hostId);
            const hostWalletDoc = await getDoc(hostWalletRef);
            
            let hostBalance = 0;
            if (hostWalletDoc.exists()) {
                hostBalance = hostWalletDoc.data().balance || 0;
            }
            
            await setDoc(hostWalletRef, {
                balance: hostBalance - booking.totalAmount,
                updatedAt: serverTimestamp()
            }, { merge: true });

            // Create transaction records
            await addDoc(collection(db, "transactions"), {
                userId: booking.guestId,
                type: "booking_refund",
                amount: booking.totalAmount,
                description: `Refund for canceled booking: ${booking.listingTitle}`,
                bookingId: bookingId,
                createdAt: serverTimestamp()
            });

            await addDoc(collection(db, "transactions"), {
                userId: hostId,
                type: "booking_refund",
                amount: -booking.totalAmount,
                description: `Refund for canceled booking from ${booking.guestName}`,
                bookingId: bookingId,
                createdAt: serverTimestamp()
            });
        }

        // Update booking status to canceled
        await updateDoc(bookingRef, {
            status: "canceled",
            paymentStatus: booking.paymentStatus === "paid" ? "refunded" : "pending",
            updatedAt: serverTimestamp()
        });

        // Email sending removed - only registration emails are sent

        return { success: true };
    } catch (error) {
        console.error("Error approving cancellation:", error);
        throw error;
    }
};

// ========== ADMIN FUNCTIONS ==========

// Get all bookings (admin only)
export const getAllBookings = async () => {
    try {
        const bookingsQuery = query(collection(db, "bookings"));
        const querySnapshot = await getDocs(bookingsQuery);
        const bookings = [];
        
        querySnapshot.forEach((doc) => {
            bookings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by creation date (newest first)
        bookings.sort((a, b) => {
            const dateA = a.createdAt?.toMillis() || 0;
            const dateB = b.createdAt?.toMillis() || 0;
            return dateB - dateA;
        });
        
        return bookings;
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        throw error;
    }
};

// Get all reviews (admin only)
export const getAllReviews = async () => {
    try {
        const reviewsQuery = query(collection(db, "reviews"));
        const querySnapshot = await getDocs(reviewsQuery);
        const reviews = [];
        
        querySnapshot.forEach((doc) => {
            reviews.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by date (newest first)
        reviews.sort((a, b) => {
            const dateA = a.createdAt?.toMillis() || 0;
            const dateB = b.createdAt?.toMillis() || 0;
            return dateB - dateA;
        });
        
        return reviews;
    } catch (error) {
        console.error("Error fetching all reviews:", error);
        throw error;
    }
};

// Get all listings (admin only)
export const getAllListings = async () => {
    try {
        const listingsQuery = query(collection(db, "listings"));
        const querySnapshot = await getDocs(listingsQuery);
        const listings = [];
        
        querySnapshot.forEach((doc) => {
            listings.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by creation date (newest first)
        listings.sort((a, b) => {
            const dateA = a.createdAt?.toMillis() || 0;
            const dateB = b.createdAt?.toMillis() || 0;
            return dateB - dateA;
        });
        
        return listings;
    } catch (error) {
        console.error("Error fetching all listings:", error);
        throw error;
    }
};

// Get all users (admin only)
export const getAllUsers = async () => {
    try {
        const usersQuery = query(collection(db, "Resergodb"));
        const querySnapshot = await getDocs(usersQuery);
        const users = [];
        
        querySnapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return users;
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
    }
};

// Get all transactions (admin only)
export const getAllTransactions = async () => {
    try {
        const transactionsQuery = query(collection(db, "transactions"));
        const querySnapshot = await getDocs(transactionsQuery);
        const transactions = [];
        
        querySnapshot.forEach((doc) => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by date (newest first)
        transactions.sort((a, b) => {
            const dateA = a.timestamp?.toMillis() || 0;
            const dateB = b.timestamp?.toMillis() || 0;
            return dateB - dateA;
        });
        
        return transactions;
    } catch (error) {
        console.error("Error fetching all transactions:", error);
        throw error;
    }
};

// Save Rules & Regulations (Admin only)
export const saveRulesAndRegulations = async (regulations) => {
    try {
        const rulesRef = doc(db, "platformSettings", "rulesAndRegulations");
        await setDoc(rulesRef, {
            regulations: regulations,
            updatedAt: serverTimestamp()
        }, { merge: true });
        console.log("Rules & Regulations saved successfully");
        return true;
    } catch (error) {
        console.error("Error saving rules & regulations:", error);
        throw error;
    }
};

// Get Rules & Regulations
export const getRulesAndRegulations = async () => {
    try {
        const rulesRef = doc(db, "platformSettings", "rulesAndRegulations");
        const rulesDoc = await getDoc(rulesRef);
        
        if (rulesDoc.exists()) {
            return rulesDoc.data().regulations || "";
        }
        return "";
    } catch (error) {
        console.error("Error fetching rules & regulations:", error);
        return "";
    }
};

// Save Terms & Conditions (Admin only)
export const saveTermsAndConditions = async (terms) => {
    try {
        const termsRef = doc(db, "platformSettings", "termsAndConditions");
        await setDoc(termsRef, {
            terms: terms,
            updatedAt: serverTimestamp()
        }, { merge: true });
        console.log("Terms & Conditions saved successfully");
        return true;
    } catch (error) {
        console.error("Error saving terms & conditions:", error);
        throw error;
    }
};

// Get Terms & Conditions
export const getTermsAndConditions = async () => {
    try {
        const termsRef = doc(db, "platformSettings", "termsAndConditions");
        const termsDoc = await getDoc(termsRef);
        
        if (termsDoc.exists()) {
            return termsDoc.data().terms || "";
        }
        return "";
    } catch (error) {
        console.error("Error fetching terms & conditions:", error);
        return "";
    }
};

// Save Privacy Policy (Admin only)
export const savePrivacyPolicy = async (policy) => {
    try {
        const policyRef = doc(db, "platformSettings", "privacyPolicy");
        await setDoc(policyRef, {
            policy: policy,
            updatedAt: serverTimestamp()
        }, { merge: true });
        console.log("Privacy Policy saved successfully");
        return true;
    } catch (error) {
        console.error("Error saving privacy policy:", error);
        throw error;
    }
};

// Get Privacy Policy
export const getPrivacyPolicy = async () => {
    try {
        const policyRef = doc(db, "platformSettings", "privacyPolicy");
        const policyDoc = await getDoc(policyRef);
        
        if (policyDoc.exists()) {
            return policyDoc.data().policy || "";
        }
        return "";
    } catch (error) {
        console.error("Error fetching privacy policy:", error);
        return "";
    }
};

// Points & Rewards System

// Get host points
export const getHostPoints = async (hostId) => {
    try {
        const pointsRef = doc(db, "hostPoints", hostId);
        const pointsDoc = await getDoc(pointsRef);
        
        if (pointsDoc.exists()) {
            const data = pointsDoc.data();
            return {
                currentPoints: data.currentPoints || 0,
                totalEarned: data.totalEarned || 0,
                level: calculateLevel(data.currentPoints || 0)
            };
        }
        return {
            currentPoints: 0,
            totalEarned: 0,
            level: "Bronze"
        };
    } catch (error) {
        console.error("Error fetching host points:", error);
        return {
            currentPoints: 0,
            totalEarned: 0,
            level: "Bronze"
        };
    }
};

// Calculate level based on points
const calculateLevel = (points) => {
    if (points >= 5000) return "Platinum";
    if (points >= 2000) return "Gold";
    if (points >= 1000) return "Silver";
    return "Bronze";
};

// Get next level points threshold
export const getNextLevelPoints = (currentPoints) => {
    if (currentPoints < 1000) return 1000;
    if (currentPoints < 2000) return 2000;
    if (currentPoints < 5000) return 5000;
    return 10000; // Next level after Platinum
};

// Add points to host
export const addPoints = async (hostId, points, description, type = "earned") => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be authenticated");
        }
        
        const pointsRef = doc(db, "hostPoints", hostId);
        const pointsDoc = await getDoc(pointsRef);
        
        let currentPoints = 0;
        let totalEarned = 0;
        
        if (pointsDoc.exists()) {
            const data = pointsDoc.data();
            currentPoints = data.currentPoints || 0;
            totalEarned = data.totalEarned || 0;
        }
        
        const newCurrentPoints = currentPoints + points;
        const newTotalEarned = type === "earned" ? totalEarned + points : totalEarned;
        
        await setDoc(pointsRef, {
            currentPoints: newCurrentPoints,
            totalEarned: newTotalEarned,
            updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Create transaction record
        const transactionRef = collection(db, "pointsTransactions");
        await addDoc(transactionRef, {
            hostId,
            points: points,
            description,
            type,
            createdAt: serverTimestamp()
        });
        
        return { success: true, newPoints: newCurrentPoints };
    } catch (error) {
        console.error("Error adding points:", error);
        throw error;
    }
};

// Deduct points from host (for reward redemption)
export const deductPoints = async (hostId, points, description) => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be authenticated");
        }
        
        const pointsRef = doc(db, "hostPoints", hostId);
        const pointsDoc = await getDoc(pointsRef);
        
        if (!pointsDoc.exists()) {
            throw new Error("Host points not found");
        }
        
        const data = pointsDoc.data();
        const currentPoints = data.currentPoints || 0;
        
        if (currentPoints < points) {
            throw new Error("Insufficient points");
        }
        
        const newCurrentPoints = currentPoints - points;
        
        await setDoc(pointsRef, {
            currentPoints: newCurrentPoints,
            updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Create transaction record
        const transactionRef = collection(db, "pointsTransactions");
        await addDoc(transactionRef, {
            hostId,
            points: -points,
            description,
            type: "redeemed",
            createdAt: serverTimestamp()
        });
        
        return { success: true, newPoints: newCurrentPoints };
    } catch (error) {
        console.error("Error deducting points:", error);
        throw error;
    }
};

// Get points transactions
export const getPointsTransactions = async (hostId, limit = 50) => {
    try {
        const transactionsQuery = query(
            collection(db, "pointsTransactions"),
            where("hostId", "==", hostId),
            orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(transactionsQuery);
        const transactions = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            transactions.push({
                id: doc.id,
                points: data.points,
                description: data.description,
                type: data.type,
                date: data.createdAt?.toDate() || new Date()
            });
        });
        
        return transactions.slice(0, limit);
    } catch (error) {
        console.error("Error fetching points transactions:", error);
        return [];
    }
};

// Get personalized recommendations for a guest
export const getRecommendations = async (guestId, category = null, limit = 12) => {
    try {
        if (!guestId) {
            // If no user, return highly rated listings
            return await getHighlyRatedListings(category, limit);
        }

        // Get user's previous bookings
        const bookings = await getGuestBookings(guestId);
        const completedBookings = bookings.filter(b => b.status === "active" || b.status === "completed");
        
        // Get categories from booked listings
        const bookedCategories = new Set();
        const bookedListingIds = new Set();
        for (const booking of completedBookings) {
            bookedListingIds.add(booking.listingId);
            try {
                const bookedListing = await getListing(booking.listingId);
                if (bookedListing?.category) {
                    bookedCategories.add(bookedListing.category);
                }
            } catch (error) {
                console.error("Error fetching booked listing:", error);
            }
        }
        
        // Get user's favorites
        const favoriteIds = await getFavorites(guestId);
        
        // Get all published listings
        const allListings = await getPublishedListings(category);
        
        // Get featured listings (from active rewards)
        const featuredListings = await getFeaturedListings();
        const featuredListingIds = new Set(featuredListings.map(l => l.id));
        
        // Score and rank listings
        const scoredListings = allListings.map(listing => {
            let score = 0;
            
            // Base score from rating
            if (listing.rating) {
                score += listing.rating * 10; // Higher rating = higher score
            }
            
            // Boost for featured listings
            if (featuredListingIds.has(listing.id)) {
                score += 50;
            }
            
            // Boost if in favorites
            if (favoriteIds.includes(listing.id)) {
                score += 30;
            }
            
            // Boost if listing is in same category as previous bookings
            if (bookedCategories.has(listing.category)) {
                score += 25;
            }
            
            // General boost for users with booking history
            if (completedBookings.length > 0) {
                score += 10;
            }
            
            // Boost for listings with more reviews
            if (listing.reviewsCount) {
                score += Math.min(listing.reviewsCount * 2, 20); // Max 20 points for reviews
            }
            
            // Boost for newer listings
            if (listing.createdAt) {
                const daysSinceCreation = (Date.now() - listing.createdAt.toMillis()) / (1000 * 60 * 60 * 24);
                if (daysSinceCreation < 30) {
                    score += 10; // New listings get a boost
                }
            }
            
            return { ...listing, recommendationScore: score };
        });
        
        // Sort by score (highest first) and remove duplicates
        scoredListings.sort((a, b) => b.recommendationScore - a.recommendationScore);
        
        // Remove listings user has already booked
        const filteredListings = scoredListings.filter(l => !bookedListingIds.has(l.id));
        
        // Return top recommendations
        return filteredListings.slice(0, limit);
    } catch (error) {
        console.error("Error getting recommendations:", error);
        // Fallback to highly rated listings
        return await getHighlyRatedListings(category, limit);
    }
};

// Get highly rated listings
const getHighlyRatedListings = async (category = null, limit = 12) => {
    try {
        const listings = await getPublishedListings(category);
        
        // Sort by rating (highest first), then by reviews count
        listings.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            const reviewsA = a.reviewsCount || 0;
            const reviewsB = b.reviewsCount || 0;
            
            if (ratingB !== ratingA) {
                return ratingB - ratingA;
            }
            return reviewsB - reviewsA;
        });
        
        return listings.slice(0, limit);
    } catch (error) {
        console.error("Error getting highly rated listings:", error);
        return [];
    }
};

// Get featured listings (from active rewards)
const getFeaturedListings = async () => {
    try {
        const now = Timestamp.now();
        const rewardsQuery = query(
            collection(db, "hostRewards"),
            where("rewardId", "==", "featured_listing"),
            where("status", "==", "active")
        );
        
        const rewardsSnapshot = await getDocs(rewardsQuery);
        const featuredHostIds = new Set();
        
        rewardsSnapshot.forEach((doc) => {
            const reward = doc.data();
            // Check if reward hasn't expired
            if (!reward.expiresAt || reward.expiresAt.toMillis() > now.toMillis()) {
                featuredHostIds.add(reward.hostId);
            }
        });
        
        // Get listings from featured hosts
        if (featuredHostIds.size === 0) {
            return [];
        }
        
        const allListings = await getPublishedListings();
        const featuredListings = allListings.filter(listing => 
            featuredHostIds.has(listing.hostId)
        );
        
        return featuredListings;
    } catch (error) {
        console.error("Error getting featured listings:", error);
        return [];
    }
};

// Redeem reward
export const redeemReward = async (hostId, rewardId, rewardPoints, rewardTitle) => {
    try {
        if (!auth.currentUser || auth.currentUser.uid !== hostId) {
            throw new Error("Unauthorized");
        }
        
        // Deduct points
        await deductPoints(hostId, rewardPoints, `Redeemed: ${rewardTitle}`);
        
        // Apply reward based on type
        if (rewardId === "featured_listing") {
            // Mark listing as featured (you'll need to implement this based on your listing structure)
            // For now, we'll just track the redemption
            const rewardRef = collection(db, "hostRewards");
            await addDoc(rewardRef, {
                hostId,
                rewardId,
                rewardTitle,
                pointsUsed: rewardPoints,
                status: "active",
                expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
                createdAt: serverTimestamp()
            });
        } else if (rewardId === "premium_badge") {
            const rewardRef = collection(db, "hostRewards");
            await addDoc(rewardRef, {
                hostId,
                rewardId,
                rewardTitle,
                pointsUsed: rewardPoints,
                status: "active",
                createdAt: serverTimestamp()
            });
        } else if (rewardId === "marketing_boost") {
            const rewardRef = collection(db, "hostRewards");
            await addDoc(rewardRef, {
                hostId,
                rewardId,
                rewardTitle,
                pointsUsed: rewardPoints,
                status: "active",
                expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
                createdAt: serverTimestamp()
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error redeeming reward:", error);
        throw error;
    }
};

// Save Cancellation Rules (Admin only)
export const saveCancellationRules = async (cancellationRules) => {
    try {
        const rulesRef = doc(db, "platformSettings", "cancellationRules");
        await setDoc(rulesRef, {
            ...cancellationRules,
            updatedAt: serverTimestamp()
        }, { merge: true });
        console.log("Cancellation rules saved successfully");
        return true;
    } catch (error) {
        console.error("Error saving cancellation rules:", error);
        throw error;
    }
};

// Get Cancellation Rules
export const getCancellationRules = async () => {
    try {
        const rulesRef = doc(db, "platformSettings", "cancellationRules");
        const rulesDoc = await getDoc(rulesRef);
        
        if (rulesDoc.exists()) {
            return rulesDoc.data();
        }
        return {
            freeCancellation: true,
            freeCancellationDays: 7,
            partialRefundDays: 3,
            noRefundDays: 1
        };
    } catch (error) {
        console.error("Error fetching cancellation rules:", error);
        return {
            freeCancellation: true,
            freeCancellationDays: 7,
            partialRefundDays: 3,
            noRefundDays: 1
        };
    }
};

// Save Platform Fee Percentage (Admin only)
export const savePlatformFeePercentage = async (percentage) => {
    try {
        if (!auth.currentUser) {
            throw new Error("User must be authenticated");
        }
        
        const userType = await getUserType(auth.currentUser.uid);
        if (userType !== "admin") {
            throw new Error("Unauthorized: Only admins can update platform fee");
        }
        
        if (percentage < 0 || percentage > 100) {
            throw new Error("Platform fee percentage must be between 0 and 100");
        }
        
        const feeRef = doc(db, "platformSettings", "platformFee");
        await setDoc(feeRef, {
            percentage: parseFloat(percentage),
            hostShare: 100 - parseFloat(percentage),
            updatedAt: serverTimestamp(),
            updatedBy: auth.currentUser.uid
        }, { merge: true });
        
        console.log("Platform fee percentage saved successfully");
        return true;
    } catch (error) {
        console.error("Error saving platform fee percentage:", error);
        throw error;
    }
};

// Get Platform Fee Percentage
export const getPlatformFeePercentage = async () => {
    try {
        const feeRef = doc(db, "platformSettings", "platformFee");
        const feeDoc = await getDoc(feeRef);
        
        if (feeDoc.exists()) {
            const data = feeDoc.data();
            return {
                percentage: data.percentage || 7.5,
                hostShare: data.hostShare || 92.5
            };
        }
        // Default platform fee
        return {
            percentage: 7.5,
            hostShare: 92.5
        };
    } catch (error) {
        console.error("Error fetching platform fee percentage:", error);
        return {
            percentage: 7.5,
            hostShare: 92.5
        };
    }
};

// Get Fee Transactions (from bookings)
export const getFeeTransactions = async () => {
    try {
        // Get all completed bookings
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("status", "==", "active")
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const feeTransactions = [];
        
        // Get current platform fee percentage
        const feeConfig = await getPlatformFeePercentage();
        const platformFeePercent = feeConfig.percentage;
        
        bookingsSnapshot.forEach((doc) => {
            const booking = doc.data();
            if (booking.totalAmount && booking.totalAmount > 0) {
                const platformFee = (booking.totalAmount * platformFeePercent) / 100;
                const hostEarnings = booking.totalAmount - platformFee;
                
                feeTransactions.push({
                    id: doc.id,
                    transactionId: doc.id,
                    bookingId: doc.id,
                    bookingAmount: booking.totalAmount,
                    platformFee: platformFee,
                    hostEarnings: hostEarnings,
                    platformFeePercent: platformFeePercent,
                    date: booking.createdAt,
                    status: booking.paymentStatus === "paid" ? "Transferred" : "Pending",
                    guestId: booking.guestId,
                    hostId: booking.hostId,
                    listingTitle: booking.listingTitle || "Unknown"
                });
            }
        });
        
        // Sort by date (newest first)
        feeTransactions.sort((a, b) => {
            const dateA = a.date?.toMillis() || 0;
            const dateB = b.date?.toMillis() || 0;
            return dateB - dateA;
        });
        
        return feeTransactions;
    } catch (error) {
        console.error("Error fetching fee transactions:", error);
        throw error;
    }
};

// Get Fee Statistics
export const getFeeStatistics = async () => {
    try {
        const feeTransactions = await getFeeTransactions();
        
        const totalFees = feeTransactions.reduce((sum, t) => sum + (t.platformFee || 0), 0);
        
        // Calculate this month's fees
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthFees = feeTransactions
            .filter(t => {
                const transactionDate = t.date?.toDate() || new Date(0);
                return transactionDate >= startOfMonth;
            })
            .reduce((sum, t) => sum + (t.platformFee || 0), 0);
        
        // Calculate last month's fees
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthFees = feeTransactions
            .filter(t => {
                const transactionDate = t.date?.toDate() || new Date(0);
                return transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd;
            })
            .reduce((sum, t) => sum + (t.platformFee || 0), 0);
        
        // Pending transfers (fees from bookings with pending payment status)
        const pendingTransfers = feeTransactions
            .filter(t => t.status === "Pending")
            .reduce((sum, t) => sum + (t.platformFee || 0), 0);
        
        return {
            totalFees,
            thisMonthFees,
            lastMonthFees,
            pendingTransfers
        };
    } catch (error) {
        console.error("Error calculating fee statistics:", error);
        return {
            totalFees: 0,
            thisMonthFees: 0,
            lastMonthFees: 0,
            pendingTransfers: 0
        };
    }
};

export { auth, db, googleProvider, handleGoogleSignup, checkUserExists, checkAccountComplete, saveGoogleUserData, saveAdminUserData, saveHostUserData, getUserData, getUserType, updatePasswordInFirestore, verifyPassword, updateProfilePicture, updateUserProfile, updateUserType, linkEmailPasswordToGoogleAccount, saveListing, updateListing, getListing, deleteListing, getHostListings, getPublishedListings, saveReview, getListingReviews, updateListingRating, updateReview };