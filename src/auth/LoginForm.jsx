import React, { useState, useEffect } from "react";
import UserSignup from "./UserSignup";
import { handleGoogleSignup, auth, getUserType, updateUserType } from "../../Config";
import { signOut, signInWithEmailAndPassword } from "firebase/auth";

const LoginForm = ({ title = "Login", loginType = "guest", onNavigateToGuest, onNavigateToHost, onNavigateToHome, onClose, onGoogleSignIn, showSignup = false, onSwitchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(showSignup);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Debug: Log when loginType prop changes
  useEffect(() => {
    console.log("LoginForm - loginType prop changed to:", loginType);
  }, [loginType]);

  // Update isSignup when showSignup prop changes
  useEffect(() => {
    setIsSignup(showSignup);
  }, [showSignup]);

  // If showing signup, render UserSignup
  if (isSignup) {
    return (
      <UserSignup
        title="Sign Up"
        loginType={loginType}
        onNavigateToGuest={onNavigateToGuest}
        onNavigateToHost={onNavigateToHost}
        onClose={onClose}
        onSwitchToLogin={() => setIsSignup(false)}
        onGoogleSignIn={onGoogleSignIn}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    console.log("LoginForm handleSubmit - loginType:", loginType);
    
    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    try {
      // Authenticate with email/password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Email/password login successful for user:", user.uid);
      
      // Check user type and validate against loginType
      try {
        const userType = await getUserType(user.uid);
        
        // If trying to access host page, user must be a host
        if (loginType === "host") {
          if (userType !== "host") {
            setError("Only host accounts are able to log in here. Please register first.");
            // Sign out the user since they can't access this page
            await signOut(auth);
            return;
          }
        } 
        // If trying to access guest page, user must be a guest
        else if (loginType === "guest") {
          if (userType !== "guest") {
            setError("Only guest accounts are able to log in here. Please register first.");
            // Sign out the user since they can't access this page
            await signOut(auth);
            return;
          }
        }
      } catch (err) {
        console.error("Error checking user type:", err);
        setError("Error verifying account type. Please try again.");
        await signOut(auth);
        return;
      }
      
      // Navigate based on login type
      if (loginType === "host") {
        console.log("Navigating to host page");
        onClose();
        setTimeout(() => {
          if (onNavigateToHost) {
            console.log("Calling onNavigateToHost");
            onNavigateToHost();
          } else {
            console.error("onNavigateToHost is not defined");
          }
        }, 100);
      } else {
        console.log("Navigating to guest page");
        onClose();
        setTimeout(() => {
          if (onNavigateToGuest) {
            onNavigateToGuest();
          } else {
            console.error("onNavigateToGuest is not defined");
          }
        }, 100);
      }
    } catch (err) {
      console.error("Login error:", err);
      // Handle specific error codes
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address. Please check your email and try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    console.log("LoginForm handleGoogleLogin - loginType:", loginType);
    setError("");
    
    try {
      // Call handleGoogleSignup for authentication
      const result = await handleGoogleSignup(setError);
      
      if (result && result.isNewUser) {
        // New user - keep authenticated and show signup modal for account setup
        console.log("New Google user detected, showing signup modal for account setup");
        const userInfo = {
          uid: result.user.uid,
          email: result.user.email
        };
        onClose();
        
        // Navigate to home first, then trigger the Google signup modal
        if (onNavigateToHome) {
          onNavigateToHome();
        }
        
        // Trigger the Google signup modal in App.jsx after navigation with user info
        setTimeout(() => {
          if (onGoogleSignIn && typeof onGoogleSignIn === 'function') {
            onGoogleSignIn(userInfo);
          }
        }, 200);
      } else if (result && result.userExists && !result.isAccountComplete) {
        // Existing user but account not complete - keep authenticated and show signup modal
        console.log("Account incomplete, showing signup modal");
        const userInfo = {
          uid: result.user.uid,
          email: result.user.email
        };
        onClose();
        
        // Navigate to home first, then trigger the Google signup modal
        if (onNavigateToHome) {
          onNavigateToHome();
        }
        
        // Trigger the Google signup modal in App.jsx after navigation with user info
        setTimeout(() => {
          if (onGoogleSignIn && typeof onGoogleSignIn === 'function') {
            onGoogleSignIn(userInfo);
          }
        }, 200);
      } else if (result && result.userExists && result.isAccountComplete) {
        // Existing user with complete account - check user type before navigating
        console.log("Existing Google user with complete account, logging in");
        
        // Check user type and validate against loginType
        try {
          const userType = await getUserType(result.user.uid);
          
          // If trying to access host page, check and convert if needed
          if (loginType === "host") {
            if (userType === "guest") {
              // User has guest account with same Gmail - convert to host
              console.log("Converting guest account to host account");
              try {
                await updateUserType(result.user.uid, "host");
                setSuccess("Your account has been upgraded to host!");
              } catch (err) {
                console.error("Error converting to host:", err);
                setError("Failed to upgrade account. Please try again.");
                return;
              }
            } else if (userType !== "host") {
              setError("Only host accounts are able to log in here. Please register first.");
              return;
            }
          } 
          // If trying to access guest page, user must be a guest
          else if (loginType === "guest") {
            if (userType !== "guest") {
              setError("Only guest accounts are able to log in here. Please register first.");
              return;
            }
          }
        } catch (err) {
          console.error("Error checking user type:", err);
          setError("Error verifying account type. Please try again.");
          return;
        }
        
        onClose();
        
        // Navigate based on login type
        setTimeout(() => {
          if (loginType === "host") {
            console.log("Navigating to host page via Google");
            if (onNavigateToHost) {
              onNavigateToHost();
            } else {
              console.error("onNavigateToHost is not defined");
            }
          } else {
            console.log("Navigating to guest page via Google");
            if (onNavigateToGuest) {
              onNavigateToGuest();
            } else {
              console.error("onNavigateToGuest is not defined");
            }
          }
        }, 100);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Failed to sign in with Google");
    }
  };

  // Set title based on loginType
  const displayTitle = loginType === "host" ? "Login as a Host" : (title || "Login");

  return (

    /*card*/
    <div className="w-full max-w-4xl px-10 py-10 bg-white shadow-lg rounded-2xl border border-gray-100 mx-auto">

      {/* Title */}
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        {displayTitle}
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

      {/* Login form */}
      <form onSubmit={handleSubmit} className="space-y-5 w-90">

        {/* Email */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
          />
        </div>

        {/* Forgot password */}
        <div className="flex items-center justify-between text-sm">
          <a href="#" className="text-indigo-600 hover:underline">
            Forgot password?
          </a>
        </div>

        {/* Sign in button */}
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          Sign in
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-8">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="px-3 text-gray-500 text-sm">Register Or continue with</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Google */}
      <div className="w-full">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition duration-200"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
