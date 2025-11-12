import { useState, useEffect } from 'react'  
// import resergo from '/resergo.svg'
import Navbar from './components/Navbar.jsx'
import LandingPage from './components/LandingPage.jsx';
import Lpfooter from './components/Lpfooter.jsx';
import Guestpage from './guest/Guestpage.jsx';
import Hostpage from './host/Hostpage.jsx';
import UserDetails from './components/UserDetails.jsx';
import Loginmodal from './auth/Loginmodal';
import UserSignup from './auth/UserSignup';
import { auth, checkAccountComplete, getUserType } from '../Config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState("home"); // 'home', 'guest', 'host', 'userDetails'
  const [previousPage, setPreviousPage] = useState("home"); // Track previous page for back navigation
  const [showGoogleSignupModal, setShowGoogleSignupModal] = useState(false); // Modal for new Google users
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null); // Store user info (uid, email) for signup modal
  const [signupModalLoginType, setSignupModalLoginType] = useState("guest"); // Track loginType for signup modal

  // Check if signed-in user has completed account setup and verify user type
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && (currentPage === "guest" || currentPage === "host")) {
          // Check if account is complete
          try {
            const isComplete = await checkAccountComplete(user.uid);
            if (!isComplete) {
              // Account not complete - keep authenticated and show signup modal
              console.log("Account incomplete, showing signup modal (keeping authenticated)");
              setCurrentPage("home");
              // Store user info for the modal
              setPendingGoogleUser({
                uid: user.uid,
                email: user.email
              });
              setSignupModalLoginType(currentPage === "host" ? "host" : "guest");
              setShowGoogleSignupModal(true);
            } else {
              // Check user type - prevent guest users from accessing host page
              if (currentPage === "host") {
                try {
                  const userType = await getUserType(user.uid);
                  if (userType !== "host") {
                    console.log("Guest user trying to access host page, redirecting to guest page");
                    setCurrentPage("guest");
                  }
                } catch (error) {
                  console.error("Error checking user type:", error);
                  // Don't block navigation on error, just log it
                }
              }
            }
          } catch (error) {
            console.error("Error checking account completion:", error);
            // Don't block the app if there's an error checking account
          }
        }
      } catch (error) {
        console.error("Error in auth state change handler:", error);
        // Ensure the app still renders even if there's an error
      }
    });

    return () => unsubscribe();
  }, [currentPage]);

  console.log("App component rendering, currentPage:", currentPage);
  
  return (
    <div className="min-h-screen">
      {currentPage !== "host" && (
        <Navbar 
          currentPage={currentPage}
          onNavigateToUserDetails={() => {
            // Store current page before navigating to UserDetails
            // Only allow navigation from guest or host pages
            if (currentPage === "guest" || currentPage === "host") {
              console.log("Navigating to UserDetails from:", currentPage);
              setPreviousPage(currentPage);
              setCurrentPage("userDetails");
            } else {
              console.warn("Cannot navigate to UserDetails from:", currentPage);
            }
          }}
          onNavigateToGuest={() => {
            console.log("Navigating to guest page");
            setCurrentPage("guest");
          }}
          onNavigateToHost={() => {
            console.log("Navigating to host page");
            setCurrentPage("host");
          }}
          onNavigateToHome={() => {
            setCurrentPage("home");
            setShowGoogleSignupModal(false);
          }}
          onShowGoogleSignupModal={(userInfo, loginType = "guest") => {
            if (userInfo) {
              setPendingGoogleUser(userInfo);
              setSignupModalLoginType(loginType);
            }
            setShowGoogleSignupModal(true);
          }}
        />
      )}
      
      <main>
        {currentPage === "userDetails" ? (
          <UserDetails onBack={async () => {
            console.log("Back button clicked, previousPage:", previousPage);
            
            // If previousPage is a valid page (guest or host), use it
            if (previousPage === "guest" || previousPage === "host") {
              setCurrentPage(previousPage);
            } else {
              // Otherwise, determine based on user type
              try {
                const user = auth.currentUser;
                if (user) {
                  const userType = await getUserType(user.uid);
                  if (userType === "host") {
                    console.log("User is a host, navigating to host page");
                    setCurrentPage("host");
                  } else {
                    console.log("User is a guest, navigating to guest page");
                    setCurrentPage("guest");
                  }
                } else {
                  // No user logged in, default to guest
                  console.log("No user logged in, defaulting to guest page");
                  setCurrentPage("guest");
                }
              } catch (error) {
                console.error("Error getting user type, defaulting to guest:", error);
                setCurrentPage("guest");
              }
            }
          }} />
        ) : currentPage === "guest" ? (
          <Guestpage />
        ) : currentPage === "host" ? (
          <Hostpage />
        ) : (
          <LandingPage
            onNavigateToGuest={() => {
              console.log("Navigating to guest page");
              setCurrentPage("guest");
            }}
            onNavigateToHost={() => {
              console.log("Navigating to host page");
              setCurrentPage("host");
            }}
            onShowGoogleSignupModal={(userInfo, loginType = "guest") => {
              if (userInfo) {
                setPendingGoogleUser(userInfo);
                setSignupModalLoginType(loginType);
              }
              setShowGoogleSignupModal(true);
            }}
          />
        )}
      </main>
      
      {/* Google Signup Modal for New Users */}
      <Loginmodal 
        isOpen={showGoogleSignupModal} 
        onClose={() => setShowGoogleSignupModal(false)}
        disableOutsideClick={true}
      >
        <UserSignup
          title="Complete Your Account"
          loginType={signupModalLoginType}
          onClose={() => {
            setShowGoogleSignupModal(false);
            setPendingGoogleUser(null);
          }}
          onNavigateToGuest={() => {
            setShowGoogleSignupModal(false);
            setPendingGoogleUser(null);
            setCurrentPage("guest");
          }}
          onNavigateToHost={() => {
            setShowGoogleSignupModal(false);
            setPendingGoogleUser(null);
            setCurrentPage("host");
          }}
          isGoogleSignup={true}
          pendingUser={pendingGoogleUser}
        />
      </Loginmodal>
      
      {currentPage !== "host" && <Lpfooter />}
    </div>
  );
}
export default App
