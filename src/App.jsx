import { useState, useEffect } from 'react'  
// import resergo from '/resergo.svg'
import Navbar from './components/Navbar.jsx'
import LandingPage from './components/LandingPage.jsx';
import Lpfooter from './components/Lpfooter.jsx';
import Guestpage from './guest/Guestpage.jsx';
import Hostpage from './host/Hostpage.jsx';
import Adminpage from './admin/Adminpage.jsx';
import UserDetails from './components/UserDetails.jsx';
import Loginmodal from './auth/Loginmodal';
import UserSignup from './auth/UserSignup';
import FloatingMessageButton from './components/FloatingMessageButton.jsx';
import { auth, checkAccountComplete, getUserType } from '../Config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState("home"); // 'home', 'guest', 'host', 'admin', 'userDetails'
  const [previousPage, setPreviousPage] = useState("home"); // Track previous page for back navigation
  const [showGoogleSignupModal, setShowGoogleSignupModal] = useState(false); // Modal for new Google users
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null); // Store user info (uid, email) for signup modal
  const [signupModalLoginType, setSignupModalLoginType] = useState("guest"); // Track loginType for signup modal
  const [guestView, setGuestView] = useState("listings"); // 'listings', 'favorites', or 'messages' for guest page
  const [searchFilters, setSearchFilters] = useState({}); // Search filters for guest listings

  // Check if signed-in user has completed account setup and verify user type
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && (currentPage === "guest" || currentPage === "host" || currentPage === "admin")) {
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
              // Check user type - prevent unauthorized access
              try {
                const userType = await getUserType(user.uid);
                if (currentPage === "host" && userType !== "host" && userType !== "admin") {
                  console.log("Non-host user trying to access host page, redirecting to guest page");
                  setCurrentPage("guest");
                } else if (currentPage === "guest" && userType === "admin") {
                  // Admin can access guest page, but we might want to redirect to admin
                  console.log("Admin user on guest page");
                } else if (currentPage === "admin" && userType !== "admin") {
                  console.log("Non-admin user trying to access admin page, redirecting");
                  setCurrentPage(userType === "host" ? "host" : "guest");
                }
              } catch (error) {
                console.error("Error checking user type:", error);
                // Don't block navigation on error, just log it
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
      {currentPage !== "host" && currentPage !== "admin" && (
        <Navbar 
          currentPage={currentPage}
          onNavigateToUserDetails={() => {
            // Store current page before navigating to UserDetails
            // Only allow navigation from guest, host, or admin pages
            if (currentPage === "guest" || currentPage === "host" || currentPage === "admin") {
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
            setGuestView("listings");
          }}
          onNavigateToFavorites={() => {
            console.log("Navigating to favorites page");
            setCurrentPage("guest");
            setGuestView("favorites");
          }}
          onNavigateToPayments={() => {
            console.log("Navigating to payments page");
            setCurrentPage("guest");
            setGuestView("payments");
          }}
          onNavigateToBookings={() => {
            console.log("Navigating to bookings page");
            setCurrentPage("guest");
            setGuestView("bookings");
          }}
          onNavigateToMessages={() => {
            // Just dispatch the event to open the modal - no navigation
            window.dispatchEvent(new CustomEvent('openMessagesModal'));
          }}
          onSearchFilters={(filters) => {
            setSearchFilters(filters);
          }}
          searchFilters={searchFilters}
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
            
            // If previousPage is a valid page (guest, host, or admin), use it
            if (previousPage === "guest" || previousPage === "host" || previousPage === "admin") {
              setCurrentPage(previousPage);
            } else {
              // Otherwise, determine based on user type
              try {
                const user = auth.currentUser;
                if (user) {
                  const userType = await getUserType(user.uid);
                  if (userType === "admin") {
                    console.log("User is an admin, navigating to admin page");
                    setCurrentPage("admin");
                  } else if (userType === "host") {
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
          <Guestpage 
            currentView={guestView} 
            onBackToListings={() => {
              setGuestView("listings");
            }}
            onNavigateToMessages={() => {
              // Don't change view, let Guestpage handle modal state
            }}
            searchFilters={searchFilters}
            onSearchFilters={(filters) => {
              setSearchFilters(filters);
            }}
          />
        ) : currentPage === "host" ? (
          <Hostpage />
        ) : currentPage === "admin" ? (
          <Adminpage />
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
            onNavigateToAdmin={() => {
              console.log("Navigating to admin page");
              setCurrentPage("admin");
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
      
      {/* Floating Message Button - Show only on guest page */}
      {currentPage === "guest" && (
        <FloatingMessageButton />
      )}
      
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
      
      {currentPage !== "host" && currentPage !== "admin" && <Lpfooter />}
    </div>
  );
}
export default App
