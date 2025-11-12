import React, { useState, useEffect } from "react";
import { saveGoogleUserData, auth, googleProvider } from "../../Config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, linkWithCredential, signOut, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";

const UserSignup = ({ title = "Sign Up", loginType = "guest", onNavigateToGuest, onNavigateToHost, onClose, onSwitchToLogin, onGoogleSignIn, isGoogleSignup = false, pendingUser = null }) => {
  const [username, setUsername] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-hide alerts after 2.5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 2500); // 2.5 seconds

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    console.log("UserSignup handleSubmit - loginType:", loginType, "isGoogleSignup:", isGoogleSignup);
    
    try {
      // If this is a Google signup completion, create email/password account first, then link Google
      if (isGoogleSignup) {
        const userEmail = pendingUser?.email || null;
        
        if (!userEmail) {
          throw new Error("Email is required to complete account setup");
        }
        
        // Step 1: Create email/password account first (user is NOT authenticated at this point)
        console.log("Creating email/password account with email:", userEmail);
        let emailPasswordUser;
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);
          emailPasswordUser = userCredential.user;
          console.log("Email/password account created successfully with UID:", emailPasswordUser.uid);
        } catch (createError) {
          // If account already exists, it might be:
          // 1. An email/password account with the same email
          // 2. A Google account with the same email (which we're trying to link)
          if (createError.code === 'auth/email-already-in-use') {
            console.log('Email already in use, attempting to sign in with email/password...');
            try {
              // Try to sign in with the password the user provided
              const signInCredential = await signInWithEmailAndPassword(auth, userEmail, password);
              emailPasswordUser = signInCredential.user;
              console.log('Successfully signed in with existing email/password account');
            } catch (signInError) {
              // If sign-in fails, it's likely a Google-only account
              // Check if user is still authenticated with Google (from pendingUser)
              if (signInError.code === 'auth/invalid-credential' || signInError.code === 'auth/wrong-password' || signInError.code === 'auth/user-not-found') {
                console.log('Email is associated with Google account, checking if user is still authenticated...');
                
                try {
                  // Check if user is still authenticated with Google
                  let googleUser = auth.currentUser;
                  
                  // If not authenticated, check if we have pendingUser info
                  if (!googleUser && pendingUser) {
                    // User was authenticated with Google but might have been signed out
                    // Try to use the pendingUser UID - but we can't sign in without popup
                    // Instead, just save the data with the pendingUser UID and skip linking
                    console.log("User was authenticated with Google but is no longer signed in. Using pendingUser UID.");
                    emailPasswordUser = null; // We'll use pendingUser.uid for Firestore
                    // Skip credential linking - user can sign in with Google next time
                    throw new Error("Cannot link email/password to Google account. Please sign in with Google to complete setup, or use a different email for email/password account.");
                  }
                  
                  // If user is authenticated, verify it's the same email
                  if (googleUser && googleUser.email === userEmail) {
                    // Check if email/password is already linked
                    const providers = googleUser.providerData.map(provider => provider.providerId);
                    if (providers.includes('password')) {
                      console.log("Email/password is already linked to this Google account");
                      emailPasswordUser = googleUser;
                    } else {
                      // Link email/password credential to Google account
                      const emailCredential = EmailAuthProvider.credential(userEmail, password);
                      await linkWithCredential(googleUser, emailCredential);
                      console.log("Email/password credential linked successfully to Google account");
                      emailPasswordUser = googleUser;
                    }
                  } else if (googleUser) {
                    throw new Error("Email mismatch. Please use the same email as your Google account.");
                  } else {
                    // User is not authenticated - can't link without Google sign-in
                    throw new Error("Cannot link email/password to Google account. Please sign in with Google first, or use a different email for email/password account.");
                  }
                } catch (linkError) {
                  // If linking fails, provide helpful error message
                  if (linkError.code === 'auth/credential-already-in-use' || linkError.code === 'auth/email-already-in-use') {
                    // Credential is already linked, that's okay
                    console.log("Email/password is already linked to this account");
                    emailPasswordUser = auth.currentUser;
                  } else {
                    throw linkError;
                  }
                }
              } else {
                throw signInError;
              }
            }
          } else if (createError.code === 'auth/invalid-email') {
            throw new Error("Invalid email address. Please check your email and try again.");
          } else if (createError.code === 'auth/weak-password') {
            throw new Error("Password is too weak. Please choose a stronger password.");
          } else {
            throw createError;
          }
        }
        
        // Step 2: Save user data to Firestore using the appropriate UID
        // Use emailPasswordUser.uid if available, otherwise use pendingUser.uid
        const uid = emailPasswordUser ? emailPasswordUser.uid : (pendingUser?.uid || null);
        if (!uid) {
          throw new Error("Unable to determine user ID. Please try signing in with Google again.");
        }
        console.log("Saving user data to Firestore with UID:", uid, "Username:", username, "Phone:", number, "UserType:", loginType);
        await saveGoogleUserData(uid, username, number, password, loginType, userEmail);
        console.log("User data saved to Firestore successfully");
        
        // Step 3: Account setup complete
        // Check if account has both Google and password providers
        let hasGoogle = false;
        let hasPassword = false;
        if (emailPasswordUser) {
          const providers = emailPasswordUser.providerData.map(provider => provider.providerId);
          hasGoogle = providers.includes('google.com');
          hasPassword = providers.includes('password');
        } else {
          // If using pendingUser, assume it's a Google account
          hasGoogle = true;
          hasPassword = false; // Password not linked yet
        }
        
        if (hasGoogle && hasPassword) {
          console.log("Account setup completed with Google account linked to email/password");
          setSuccess("Account setup completed successfully! You can sign in with Google or email/password.");
        } else if (hasGoogle) {
          console.log("Account setup completed with Google account (email/password not linked)");
          setSuccess("Account setup completed successfully! You can sign in with Google.");
        } else {
          console.log("Email/password account created successfully with UID:", uid);
          setSuccess("Account setup completed successfully! You can sign in with email/password.");
        }
        
        // Wait a bit to show success message before navigating
        setLoading(false);
        setTimeout(() => {
          onClose();
          setTimeout(() => {
            if (loginType === "host") {
              console.log("Navigating to host page after signup");
              if (onNavigateToHost) {
                onNavigateToHost();
              } else {
                console.error("onNavigateToHost is not defined");
              }
            } else {
              console.log("Navigating to guest page after signup");
              if (onNavigateToGuest) {
                onNavigateToGuest();
              } else {
                console.error("onNavigateToGuest is not defined");
              }
            }
          }, 100);
        }, 1500);
        return;
      }
      
      // Not a Google signup - just navigate
      onClose();
      setTimeout(() => {
        if (loginType === "host") {
          console.log("Navigating to host page after signup");
          if (onNavigateToHost) {
            onNavigateToHost();
          } else {
            console.error("onNavigateToHost is not defined");
          }
        } else {
          console.log("Navigating to guest page after signup");
          if (onNavigateToGuest) {
            onNavigateToGuest();
          } else {
            console.error("onNavigateToGuest is not defined");
          }
        }
      }, 100);
    } catch (err) {
      console.error("Error saving user data:", err);
      // Customize error messages for better user experience
      if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError("Invalid password. Please check your password and try again.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address. Please check your email and try again.");
      } else {
        setError(err.message || "Failed to save user data. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("UserSignup handleGoogleSignup - loginType:", loginType);
    
    // Close modal
    onClose();
    
    // Navigate based on login type
    setTimeout(() => {
      if (loginType === "host") {
        console.log("Navigating to host page via Google signup");
        if (onNavigateToHost) {
          onNavigateToHost();
        } else {
          console.error("onNavigateToHost is not defined");
        }
      } else {
        console.log("Navigating to guest page via Google signup");
        if (onNavigateToGuest) {
          onNavigateToGuest();
        } else {
          console.error("onNavigateToGuest is not defined");
        }
      }
    }, 100);
  };

  return (
    <div className="w-full max-w-4xl px-10 py-10 bg-white shadow-lg rounded-2xl border border-gray-100 mx-auto">
      {/* Title */}
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {title}
      </h2>

      {/* Error/Success Messages - Centered Pop-up */}
      {(error || success) && (
        <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className={`px-6 py-4 rounded-lg shadow-2xl animate-fade-in pointer-events-auto ${
            error 
              ? "bg-red-100 border-2 border-red-400 text-red-700" 
              : "bg-green-100 border-2 border-green-400 text-green-700"
          }`}>
            <p className="font-semibold text-center">
              {error || success}
            </p>
          </div>
        </div>
      )}

      {/* Signup form */}
      <form onSubmit={handleSubmit} className="space-y-4 w-90">
        {/* Username */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Enter your username"
          />
        </div>

        {/* Number */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Password */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={isGoogleSignup ? "Create a password for future logins" : "Enter your password"}
          />
          {isGoogleSignup && (
            <p className="mt-1 text-xs text-gray-500">
              You can use this password to log in with your email, or continue using Google
            </p>
          )}
        </div>

        {/* Sign up button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : isGoogleSignup ? "Complete Account" : "Sign up"}
        </button>
      </form>

      {/* Switch to Login - Only show for non-Google signup */}
      {!isGoogleSignup && onSwitchToLogin && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-indigo-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default UserSignup;

