import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import Loginmodal from "../auth/Loginmodal";
import LoginForm from "../auth/LoginForm"; 
import { FaRegUser, FaSearch, FaCalendarAlt, FaWallet, FaHeart, FaList, FaSignOutAlt } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { auth, getUserData, getUserType } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";
import SearchFilter from "./SearchFilter";

const Navbar = ({ currentPage, onNavigateToUserDetails, onNavigateToGuest, onNavigateToHost, onNavigateToHome, onShowGoogleSignupModal, onNavigateToFavorites, onNavigateToPayments, onNavigateToBookings, onSearchFilters, searchFilters = {} }) => {
    const location = useLocation();
    const [loginOpen, setLoginOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [loginType, setLoginType] = useState("guest"); // 'guest' or 'host' - determines which page to navigate to
    // TODO: Replace with actual auth state from context/API
    // If on guest, host, or userDetails page, user is considered logged in
    const isLoggedIn = currentPage === "guest" || currentPage === "host" || currentPage === "userDetails";
    const [user, setUser] = useState(null); // null = not logged in, object with profilePic and username = logged in
    const [userType, setUserType] = useState(null); // 'guest' or 'host' - user type from Firestore
    const [showSearchFilter, setShowSearchFilter] = useState(false);
    
    // Check if we're on a page where search filter should be hidden
    const shouldHideSearchFilter = location.pathname === '/guest/favorites' || 
                                   location.pathname === '/guest/bookings' || 
                                   location.pathname === '/guest/payments';
    
    // Refs for click outside detection
    const menuRef = useRef(null);
    const userMenuRef = useRef(null);
    const [menuDropdownPosition, setMenuDropdownPosition] = useState({ top: 0, right: 0 });
    const [userMenuDropdownPosition, setUserMenuDropdownPosition] = useState({ top: 0, right: 0 });

    // Fetch user profile picture, username, and user type from Firestore when logged in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && isLoggedIn) {
                try {
                    const userData = await getUserData(user.uid);
                    if (userData) {
                        setUser({ 
                            profilePic: userData.ProfilePicture || user.photoURL || null,
                            username: userData.Username || user.displayName || ""
                        });
                        // Get user type
                        const type = userData.UserType || "guest";
                        setUserType(type);
                    } else if (user.photoURL || user.displayName) {
                        // Fallback to Firebase Auth data if Firestore doesn't have it
                        setUser({ 
                            profilePic: user.photoURL || null,
                            username: user.displayName || ""
                        });
                        setUserType("guest"); // Default to guest
                    } else {
                        setUser({ profilePic: null, username: "" });
                        setUserType(null);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Fallback to Firebase Auth data
                    setUser({ 
                        profilePic: user.photoURL || null,
                        username: user.displayName || ""
                    });
                    setUserType("guest"); // Default to guest
                }
            } else {
                setUser(null);
                setUserType(null);
            }
        });

        return () => unsubscribe();
    }, [isLoggedIn]);

    // Listen for profile updates from UserDetails
    useEffect(() => {
        const handleProfileUpdate = (event) => {
            if (event.detail) {
                setUser(prev => ({
                    ...prev,
                    profilePic: event.detail.profilePicture || prev?.profilePic,
                    username: event.detail.username || prev?.username
                }));
            }
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    // Update dropdown positions when menus open
    useEffect(() => {
        if (menuOpen && menuRef.current) {
            const updatePosition = () => {
                if (menuRef.current) {
                    const rect = menuRef.current.getBoundingClientRect();
                    setMenuDropdownPosition({
                        top: rect.bottom,
                        right: window.innerWidth - rect.right
                    });
                }
            };
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [menuOpen]);

    useEffect(() => {
        if (userMenuOpen && userMenuRef.current) {
            const updatePosition = () => {
                if (userMenuRef.current) {
                    const rect = userMenuRef.current.getBoundingClientRect();
                    setUserMenuDropdownPosition({
                        top: rect.bottom,
                        right: window.innerWidth - rect.right
                    });
                }
            };
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [userMenuOpen]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && 
                !event.target.closest('.navbar-menu-dropdown')) {
                setMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target) && 
                !event.target.closest('.navbar-user-menu-dropdown')) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 py-5 px-4 sm:px-8 md:px-12 lg:px-16">
            <div className="flex items-center max-w-7xl mx-auto relative">

                {/* Left - Logo */}
                <div 
                    className="flex items-center gap-2"
                > 
                    <img src={logo} alt="ReserGo Logo" className="h-8 w-8" />
                    <h1 className="text-2xl font-bold text-blue-600">
                        ReserGo
                    </h1>
                </div>

                {/* Center - Navigation Links (Landing Page) or Search Bar */}
                {currentPage === "home" ? (
                    <>
                        {/* Desktop Navigation - Absolutely Centered */}
                        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-6 lg:gap-8">
                            <button
                                onClick={() => {
                                    const element = document.getElementById("home");
                                    if (element) {
                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }
                                }}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => {
                                    const element = document.getElementById("features");
                                    if (element) {
                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }
                                }}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => {
                                    const element = document.getElementById("guests");
                                    if (element) {
                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }
                                }}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                            >
                                For Guests
                            </button>
                            <button
                                onClick={() => {
                                    const element = document.getElementById("hosts");
                                    if (element) {
                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }
                                }}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                            >
                                For Hosts
                            </button>
                            <button
                                onClick={() => {
                                    const element = document.getElementById("cta");
                                    if (element) {
                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }
                                }}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                            >
                                Get Started
                            </button>
                        </div>
                        
                        {/* Mobile Navigation Button */}
                        <div className="md:hidden ml-auto">
                            <div className="relative" ref={menuRef}>
                                <button
                                    className="flex items-center justify-center rounded-full w-10 h-10 cursor-pointer shadow-sm hover:shadow-md transition duration-150"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    <FiMenu className="text-xl" />
                                </button>

                                {/* Mobile Dropdown Menu */}
                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                        <div className="py-2">
                                            <button 
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    const element = document.getElementById("home");
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                                    }
                                                }}
                                            >
                                                Home
                                            </button>
                                            <button 
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    const element = document.getElementById("features");
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                                    }
                                                }}
                                            >
                                                Features
                                            </button>
                                            <button 
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    const element = document.getElementById("guests");
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                                    }
                                                }}
                                            >
                                                For Guests
                                            </button>
                                            <button 
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    const element = document.getElementById("hosts");
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                                    }
                                                }}
                                            >
                                                For Hosts
                                            </button>
                                            <button 
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    const element = document.getElementById("cta");
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                                                    }
                                                }}
                                            >
                                                Get Started
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : currentPage !== "host" && !shouldHideSearchFilter ? (
                    <>
                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setShowSearchFilter(true)}
                            className="md:hidden ml-auto mr-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition"
                        >
                            <FaSearch className="text-sm" />
                        </button>
                        {/* Desktop Search Bar */}
                        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 max-w-[90vw]">
                            <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-md hover:shadow-lg transition duration-200">
                            
                            {/* Search Destination */}
                            <button 
                                onClick={() => setShowSearchFilter(true)}
                                className="flex flex-col py-2 md:py-3 px-2 md:px-3 lg:px-4 xl:px-5 cursor-pointer hover:bg-gray-100 rounded-l-full transition min-w-0"
                            >
                                <p className="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Where</p>
                                <p className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap truncate">
                                    {searchFilters?.location || "Search destinations"}
                                </p>
                            </button>
                            
                            {/* Vertical Divider */}
                            <div className="h-6 md:h-8 w-px bg-gray-200 flex-shrink-0"></div>
                            
                            {/* Check In */}
                            <button 
                                onClick={() => setShowSearchFilter(true)}
                                className="flex flex-col py-2 md:py-3 px-2 md:px-3 lg:px-4 xl:px-5 cursor-pointer hover:bg-gray-100 transition min-w-0"
                            >
                                <p className="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Check in</p>
                                <p className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap truncate">
                                    {searchFilters?.checkIn ? new Date(searchFilters.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Add dates"}
                                </p>
                            </button>

                            {/* Vertical Divider */}
                            <div className="h-6 md:h-8 w-px bg-gray-200 flex-shrink-0"></div>

                            {/* Check Out */}
                            <button 
                                onClick={() => setShowSearchFilter(true)}
                                className="flex flex-col py-2 md:py-3 px-2 md:px-3 lg:px-4 xl:px-5 cursor-pointer hover:bg-gray-100 transition min-w-0"
                            >
                                <p className="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Check out</p>
                                <p className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap truncate">
                                    {searchFilters?.checkOut ? new Date(searchFilters.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Add dates"}
                                </p>
                            </button>
                            
                            {/* Vertical Divider */}
                            <div className="h-6 md:h-8 w-px bg-gray-200 flex-shrink-0"></div>
                            
                            {/* Who/Guests */}
                            <button 
                                onClick={() => setShowSearchFilter(true)}
                                className="flex flex-col py-2 md:py-3 px-2 md:px-3 lg:px-4 xl:px-5 cursor-pointer hover:bg-gray-100 transition min-w-0"
                            >
                                <p className="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Who</p>
                                <p className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap truncate">
                                    {searchFilters?.guests ? `${searchFilters.guests} guest${searchFilters.guests > 1 ? 's' : ''}` : "Add guests"}
                                </p>
                            </button>
                            
                            {/* Search Button (Blue Circle) */}
                            <button 
                                onClick={() => setShowSearchFilter(true)}
                                className="p-2 md:p-2.5 lg:p-3 mx-1 md:mx-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition active:scale-95 flex-shrink-0"
                            >
                                <FaSearch className="text-xs md:text-sm lg:text-base" />
                            </button>
                        </div>
                    </div>
                    </>
                ) : null}


                {/* Right - Menu - Hidden on landing page */}
                {currentPage !== "home" && (
                    <div className="flex-1 flex justify-end items-center space-x-4 text-gray-700 min-w-[100px]">

                        {/* Become a Host - Hidden on guest, host, and userDetails pages */}
                        {currentPage !== "guest" && currentPage !== "host" && currentPage !== "userDetails" && (
                            <button className="hidden md:inline-block text-sm font-medium hover:bg-gray-100 rounded-full py-2 px-3 transition" onClick={() => {
                                console.log("Become a Host clicked - setting loginType to host");
                                setLoginType("host");
                                setLoginOpen(true);
                            }}> 
                            Become a Host
                        </button>
                        )}
                        
                        {/* User Icon/Profile Picture */}
                        <div className="relative" ref={userMenuRef}>
                            <div className="flex items-end gap-3">
                                {isLoggedIn && user && user.username && (
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                                        {userType && (
                                            <p className="text-xs text-gray-600 capitalize">{userType}</p>
                                        )}
                                    </div>
                                )}
                            <button
                                    className="flex items-center rounded-full p-0 cursor-pointer shadow-sm hover:shadow-md transition duration-150"
                                    onClick={() => {
                                        if (isLoggedIn && onNavigateToUserDetails) {
                                            // If logged in, navigate directly to UserDetails
                                            onNavigateToUserDetails();
                                        } else {
                                            // If not logged in, toggle the menu
                                            setUserMenuOpen(!userMenuOpen);
                                        }
                                    }}
                            >
                                    {isLoggedIn && user && user.profilePic ? (
                                    <img 
                                        src={user.profilePic} 
                                        alt="Profile" 
                                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <FaRegUser className="text-xl text-gray-600" />
                                        </div>
                                )}
                            </button>
                            </div>

                            {/* User Dropdown Menu - Only show when not logged in */}
                            {userMenuOpen && !isLoggedIn && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
                                    <ul>
                                            <li
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                setLoginType("guest");
                                                    setLoginOpen(true);
                                                    setUserMenuOpen(false);
                                                }}
                                            >
                                                Log in or Sign up
                                            </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Burger Menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                className="flex items-center justify-center rounded-full w-10 h-10 cursor-pointer shadow-sm hover:shadow-md transition duration-150"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                <FiMenu className="text-xl" />
                            </button>

                            {/* Dropdown Menu */}
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                    <div className="py-2">
                                        {/* Guest-specific menu items - only show when logged in as guest */}
                                        {isLoggedIn && userType === "guest" && (
                                            <>
                                                <button 
                                                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-left"
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        if (onNavigateToBookings) {
                                                            onNavigateToBookings();
                                                        }
                                                    }}
                                                >
                                                    <FaCalendarAlt className="text-lg text-gray-500" />
                                                    <span className="text-sm font-medium">Bookings</span>
                                                </button>
                                                <button 
                                                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-left"
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        if (onNavigateToPayments) {
                                                            onNavigateToPayments();
                                                        }
                                                    }}
                                                >
                                                    <FaWallet className="text-lg text-gray-500" />
                                                    <span className="text-sm font-medium">E-wallet</span>
                                                </button>
                                                <button 
                                                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-left"
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        if (onNavigateToFavorites) {
                                                            onNavigateToFavorites();
                                                        }
                                                    }}
                                                >
                                                    <FaHeart className="text-lg text-gray-500" />
                                                    <span className="text-sm font-medium">Favorites</span>
                                                </button>
                                                <button 
                                                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-left"
                                                    onClick={() => setMenuOpen(false)}
                                                >
                                                    <FaList className="text-lg text-gray-500" />
                                                    <span className="text-sm font-medium">Wishlist</span>
                                                </button>
                                            </>
                                        )}
                                        {/* Logout button - only show on guest, host, or userDetails pages */}
                                        {(currentPage === "guest" || currentPage === "host" || currentPage === "userDetails") && (
                                            <>
                                                {(isLoggedIn && userType === "guest") && (
                                                    <div className="border-t border-gray-200 my-1"></div>
                                                )}
                                                <button 
                                                    className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors duration-150 text-left font-medium"
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        // Reset user state and navigate to home
                                                        setUser(null);
                                                        setUserType(null);
                                                        onNavigateToHome && onNavigateToHome();
                                                    }}
                                                >
                                                    <FaSignOutAlt className="text-lg" />
                                                    <span className="text-sm">Log out</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>  
                            )}
                        </div>
                    </div>
                )}

                {/* Login Modal */}
                <Loginmodal isOpen={loginOpen} onClose={() => setLoginOpen(false)}>
                    <LoginForm 
                        loginType={loginType}
                        onNavigateToGuest={onNavigateToGuest}
                        onNavigateToHost={onNavigateToHost}
                        onNavigateToHome={onNavigateToHome}
                        onClose={() => setLoginOpen(false)}
                        onGoogleSignIn={(userInfo) => onShowGoogleSignupModal(userInfo, loginType)}
                    />
                </Loginmodal>

                {/* Search Filter Modal */}
                {currentPage !== "host" && currentPage !== "home" && !shouldHideSearchFilter && (
                    <SearchFilter
                        isOpen={showSearchFilter}
                        onClose={() => setShowSearchFilter(false)}
                        onSearch={(filters) => {
                            if (onSearchFilters) {
                                onSearchFilters(filters);
                            }
                        }}
                        initialFilters={searchFilters}
                    />
                )}

            </div>
        </div>
    );
};

export default Navbar;
