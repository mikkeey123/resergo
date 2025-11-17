import { useState, useEffect } from 'react'  
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import { onAuthStateChanged } from 'firebase/auth';
import './App.css'

// Protected Route Component
const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setAuthorized(false);
        navigate('/');
        return;
      }

      try {
        const isComplete = await checkAccountComplete(user.uid);
        if (!isComplete) {
          setLoading(false);
          setAuthorized(false);
          navigate('/');
          return;
        }

        if (requiredUserType) {
          const userType = await getUserType(user.uid);
          if (requiredUserType === 'host' && userType !== 'host' && userType !== 'admin') {
            setLoading(false);
            setAuthorized(false);
            navigate('/guest');
            return;
          } else if (requiredUserType === 'admin' && userType !== 'admin') {
            setLoading(false);
            setAuthorized(false);
            navigate(userType === 'host' ? '/host' : '/guest');
            return;
          }
        }

        setLoading(false);
        setAuthorized(true);
      } catch (error) {
        console.error("Error checking authorization:", error);
        setLoading(false);
        setAuthorized(false);
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate, requiredUserType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return authorized ? children : null;
};

// App Content Component (uses hooks that need to be inside Router)
const AppContent = () => {
  const [showGoogleSignupModal, setShowGoogleSignupModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [signupModalLoginType, setSignupModalLoginType] = useState("guest");
  const [searchFilters, setSearchFilters] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // Check if signed-in user has completed account setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && (location.pathname.startsWith('/guest') || location.pathname.startsWith('/host') || location.pathname.startsWith('/admin'))) {
        try {
          const isComplete = await checkAccountComplete(user.uid);
          if (!isComplete) {
            setPendingGoogleUser({
              uid: user.uid,
              email: user.email
            });
            setSignupModalLoginType(location.pathname.startsWith('/host') ? 'host' : 'guest');
            setShowGoogleSignupModal(true);
            navigate('/');
          }
        } catch (error) {
          console.error("Error checking account completion:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [location.pathname, navigate]);

  const currentPage = location.pathname === '/' ? 'home' : 
                     location.pathname.startsWith('/guest') ? 'guest' :
                     location.pathname.startsWith('/host') ? 'host' :
                     location.pathname.startsWith('/admin') ? 'admin' : 'home';

  return (
    <div className="min-h-screen">
      {currentPage !== "host" && currentPage !== "admin" && (
        <Navbar 
          currentPage={currentPage}
          onNavigateToUserDetails={() => {
            if (currentPage === "guest" || currentPage === "host" || currentPage === "admin") {
              navigate('/user-details');
            }
          }}
          onNavigateToGuest={() => {
            navigate('/guest');
          }}
          onNavigateToFavorites={() => {
            navigate('/guest/favorites');
          }}
          onNavigateToPayments={() => {
            navigate('/guest/payments');
          }}
          onNavigateToBookings={() => {
            navigate('/guest/bookings');
          }}
          onNavigateToMessages={() => {
            window.dispatchEvent(new CustomEvent('openMessagesModal'));
          }}
          onSearchFilters={(filters) => {
            setSearchFilters(filters);
          }}
          searchFilters={searchFilters}
          onNavigateToHost={() => {
            navigate('/host');
          }}
          onNavigateToHome={() => {
            navigate('/');
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
        <Routes>
          {/* Home/Landing Page */}
          <Route 
            path="/" 
            element={
              <LandingPage
                onNavigateToGuest={() => navigate('/guest')}
                onNavigateToHost={() => navigate('/host')}
                onNavigateToAdmin={() => navigate('/admin')}
                onShowGoogleSignupModal={(userInfo, loginType = "guest") => {
                  if (userInfo) {
                    setPendingGoogleUser(userInfo);
                    setSignupModalLoginType(loginType);
                  }
                  setShowGoogleSignupModal(true);
                }}
              />
            } 
          />

          {/* Guest Routes */}
          <Route 
            path="/guest" 
            element={
              <ProtectedRoute>
                <Guestpage 
                  currentView="listings"
                  onBackToListings={() => navigate('/guest')}
                  onNavigateToMessages={() => {}}
                  searchFilters={searchFilters}
                  onSearchFilters={(filters) => setSearchFilters(filters)}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guest/favorites" 
            element={
              <ProtectedRoute>
                <Guestpage 
                  currentView="favorites"
                  onBackToListings={() => navigate('/guest')}
                  onNavigateToMessages={() => {}}
                  searchFilters={searchFilters}
                  onSearchFilters={(filters) => setSearchFilters(filters)}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guest/payments" 
            element={
              <ProtectedRoute>
                <Guestpage 
                  currentView="payments"
                  onBackToListings={() => navigate('/guest')}
                  onNavigateToMessages={() => {}}
                  searchFilters={searchFilters}
                  onSearchFilters={(filters) => setSearchFilters(filters)}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guest/bookings" 
            element={
              <ProtectedRoute>
                <Guestpage 
                  currentView="bookings"
                  onBackToListings={() => navigate('/guest')}
                  onNavigateToMessages={() => {}}
                  searchFilters={searchFilters}
                  onSearchFilters={(filters) => setSearchFilters(filters)}
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/listing/:id" 
            element={
              <ProtectedRoute>
                <Guestpage 
                  currentView="listings"
                  onBackToListings={() => navigate('/guest')}
                  onNavigateToMessages={() => {}}
                  searchFilters={searchFilters}
                  onSearchFilters={(filters) => setSearchFilters(filters)}
                />
              </ProtectedRoute>
            } 
          />

          {/* Host Route */}
          <Route 
            path="/host/*" 
            element={
              <ProtectedRoute requiredUserType="host">
                <Hostpage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Route */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredUserType="admin">
                <Adminpage />
              </ProtectedRoute>
            } 
          />

          {/* User Details Route */}
          <Route 
            path="/user-details" 
            element={
              <ProtectedRoute>
                <UserDetails 
                  onBack={async () => {
                    try {
                      const user = auth.currentUser;
                      if (user) {
                        const userType = await getUserType(user.uid);
                        if (userType === "admin") {
                          navigate('/admin');
                        } else if (userType === "host") {
                          navigate('/host');
                        } else {
                          navigate('/guest');
                        }
                      } else {
                        navigate('/guest');
                      }
                    } catch (error) {
                      console.error("Error getting user type, defaulting to guest:", error);
                      navigate('/guest');
                    }
                  }} 
                />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      
      {/* Floating Message Button - Show only on guest pages */}
      {location.pathname.startsWith('/guest') && (
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
            navigate('/guest');
          }}
          onNavigateToHost={() => {
            setShowGoogleSignupModal(false);
            setPendingGoogleUser(null);
            navigate('/host');
          }}
          isGoogleSignup={true}
          pendingUser={pendingGoogleUser}
        />
      </Loginmodal>
      
      {currentPage !== "host" && currentPage !== "admin" && <Lpfooter />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App
