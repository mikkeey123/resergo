import React, { useState, useEffect } from "react";
import { 
    FaCalendarAlt, 
    FaCheckCircle, 
    FaClock, 
    FaPlus, 
    FaComments, 
    FaList, 
    FaCreditCard,
    FaUser, 
    FaGift,
    FaHome,
    FaChartLine,
    FaBars,
    FaTimes,
    FaPowerOff,
    FaCalendar,
    FaTicketAlt,
    FaDollarSign,
    FaStar,
    FaEye,
    FaArrowUp,
    FaArrowDown
} from "react-icons/fa";
import Messages from "./Messages";
import Listings from "./Listings";
import Calendar from "./Calendar";
import Bookings from "./Bookings";
import Coupons from "./Coupons";
import PaymentMethods from "./PaymentMethods";
import PointsRewards from "./PointsRewards";
import UserDetails from "../components/UserDetails";
import Wishlists from "./Wishlists";
import { auth, getUserData, getUserType, getUnreadMessageCount, getHostBookings, getHostListings, getWalletBalance } from "../../Config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import logo from "../assets/logo.png";

const Hostpage = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [activeDashboardTab, setActiveDashboardTab] = useState("today");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [userType, setUserType] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [profilePicError, setProfilePicError] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [bookings, setBookings] = useState([]);
    const [listings, setListings] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [dashboardStats, setDashboardStats] = useState({
        totalBookings: 0,
        activeBookings: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        activeListings: 0,
        totalListings: 0,
        averageRating: 0,
        pendingBookings: 0
    });
    const [loadingDashboard, setLoadingDashboard] = useState(true);
    const [tabRefreshKey, setTabRefreshKey] = useState({});

    // Function to fetch and update user data
    const fetchUserData = async (user) => {
        if (user) {
            try {
                const userData = await getUserData(user.uid);
                if (userData) {
                    const profilePicture = userData.ProfilePicture || user.photoURL || "";
                    setUsername(userData.Username || user.displayName || "");
                    setProfilePic(profilePicture);
                    setProfilePicError(false); // Reset error state when fetching new data
                    const type = await getUserType(user.uid);
                    setUserType(type || "host");
                } else {
                    setUsername(user.displayName || "");
                    setProfilePic(user.photoURL || "");
                    setUserType("host");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUsername(user.displayName || "");
                setProfilePic(user.photoURL || "");
                setUserType("host");
            }
        }
    };

    // Fetch user data and unread message count
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            await fetchUserData(user);
            if (user) {
                // Load unread message count
                const count = await getUnreadMessageCount(user.uid);
                setUnreadMessageCount(count);
            }
        });

        // Listen for profile update events
        const handleProfileUpdate = async (event) => {
            console.log("Hostpage: Profile update event received", event.detail);
            const user = auth.currentUser;
            if (user) {
                // Small delay to ensure Firestore has updated
                setTimeout(async () => {
                    // Refresh user data from Firestore
                    await fetchUserData(user);
                }, 500);
            }
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);

        return () => {
            unsubscribe();
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    // Poll for unread message count
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const interval = setInterval(async () => {
            const count = await getUnreadMessageCount(user.uid);
            setUnreadMessageCount(count);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        if (!auth.currentUser || activeTab !== "dashboard") return;
        
        try {
            setLoadingDashboard(true);
            const userId = auth.currentUser.uid;
            
            // Fetch all data in parallel
            const [hostBookings, hostListings, balance] = await Promise.all([
                getHostBookings(userId),
                getHostListings(userId),
                getWalletBalance(userId)
            ]);
            
            setBookings(hostBookings);
            setListings(hostListings);
            setWalletBalance(balance || 0);
            
            // Calculate statistics
            const activeBookings = hostBookings.filter(b => b.status === "active").length;
            const pendingBookings = hostBookings.filter(b => b.status === "pending").length;
            const totalBookings = hostBookings.length;
            
            // Calculate revenue
            const totalRevenue = hostBookings
                .filter(b => b.status === "active" && b.totalAmount)
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            
            // Calculate this month's revenue
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const thisMonthRevenue = hostBookings
                .filter(b => {
                    if (!b.checkIn || b.status !== "active" || !b.totalAmount) return false;
                    const checkInDate = b.checkIn.toDate();
                    return checkInDate >= firstDayOfMonth;
                })
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            
            // Calculate listings stats
            const activeListings = hostListings.filter(l => !l.isDraft).length;
            const totalListings = hostListings.length;
            
            // Calculate average rating (if listings have ratings)
            const listingsWithRatings = hostListings.filter(l => l.rating && l.rating > 0);
            const averageRating = listingsWithRatings.length > 0
                ? listingsWithRatings.reduce((sum, l) => sum + (l.rating || 0), 0) / listingsWithRatings.length
                : 0;
            
            setDashboardStats({
                totalBookings,
                activeBookings,
                totalRevenue,
                thisMonthRevenue,
                activeListings,
                totalListings,
                averageRating,
                pendingBookings
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoadingDashboard(false);
        }
    };

    // Fetch dashboard data when tab is active or refresh key changes
    useEffect(() => {
        if (activeTab === "dashboard") {
            fetchDashboardData();
        }
    }, [activeTab, tabRefreshKey.dashboard]);

    // Filter bookings by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBookings = bookings.filter(booking => {
        if (!booking.checkIn || booking.status === "canceled" || booking.status === "pending" || booking.status === "cancel_requested") return false;
        const checkInDate = booking.checkIn.toDate();
        checkInDate.setHours(0, 0, 0, 0);
        return checkInDate.getTime() === today.getTime();
    });

    const upcomingBookings = bookings.filter(booking => {
        if (!booking.checkIn || booking.status === "canceled" || booking.status === "pending" || booking.status === "cancel_requested") return false;
        const checkInDate = booking.checkIn.toDate();
        checkInDate.setHours(0, 0, 0, 0);
        return checkInDate.getTime() > today.getTime();
    });

    const formatTime = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate();
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const navigationItems = [
        { id: "dashboard", label: "Overview", icon: <FaHome /> },
        { id: "listings", label: "Listings", icon: <FaList /> },
        { id: "messages", label: "Messages", icon: <FaComments /> },
        { id: "calendar", label: "Calendar", icon: <FaCalendarAlt /> },
        { id: "bookings", label: "Bookings", icon: <FaCalendar /> },
        { id: "coupons", label: "Coupons", icon: <FaTicketAlt /> },
        { id: "wishlists", label: "Wishlists", icon: <FaGift /> },
        { id: "payments", label: "E-Wallet", icon: <FaCreditCard /> },
        { id: "rewards", label: "Points and Rewards", icon: <FaGift /> },
        { id: "settings", label: "Account", icon: <FaUser /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar Navigation */}
            <div className={`${
                sidebarOpen 
                    ? 'fixed md:relative w-64 z-50 md:z-auto' 
                    : 'fixed md:relative -translate-x-full md:translate-x-0 w-20 z-50 md:z-auto'
            } bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col overflow-hidden h-full`}>
                {/* Sidebar Header */}
                <div 
                    className={`border-b border-gray-200 flex items-center h-16 relative transition-all duration-300 ${
                        sidebarOpen ? 'px-4' : 'px-2'
                    }`}
                >
                    <div 
                        className={`flex items-center cursor-pointer transition-all duration-300 ${
                            sidebarOpen ? 'gap-3 flex-1' : 'justify-center w-full'
                        }`}
                        onClick={() => !sidebarOpen && setSidebarOpen(true)}
                    >
                        <img src={logo} alt="ReserGo Logo" className="h-8 w-8 flex-shrink-0" />
                        <h2 className={`text-blue-600 font-bold text-lg transition-all duration-300 ease-in-out whitespace-nowrap ${
                            sidebarOpen 
                                ? 'opacity-100 max-w-[200px]' 
                                : 'opacity-0 max-w-0 overflow-hidden'
                        }`}>
                            ReserGo
                        </h2>
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSidebarOpen(false);
                            }}
                            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
                            aria-label="Close sidebar"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className={`flex-1 space-y-2 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
                    sidebarOpen ? 'px-4 py-4' : 'px-2 py-4'
                }`}>
                    {navigationItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const showUnreadBadge = item.id === "messages" && unreadMessageCount > 0;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    // Trigger refresh for this tab
                                    setTabRefreshKey(prev => ({
                                        ...prev,
                                        [item.id]: Date.now()
                                    }));
                                }}
                                className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 ease-in-out relative ${
                                    sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'
                                } ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md hover:shadow-xl hover:bg-blue-700 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium active:scale-95"
                                }`}
                            >
                                <span className={`text-xl flex-shrink-0 transition-colors duration-200 relative ${
                                    isActive ? 'text-white' : 'text-gray-600'
                                }`}>
                                    {item.icon}
                                    {showUnreadBadge && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                                            {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                        </span>
                                    )}
                                </span>
                                <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
                                    sidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'
                                } ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full shadow-sm"></div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="h-16 border-t border-gray-200 flex items-center overflow-hidden">
                    <div className={`w-full ${sidebarOpen ? 'px-4' : 'px-2'}`}>
                        <button
                            onClick={async () => {
                                try {
                                    await signOut(auth);
                                    // Redirect to home page after logout
                                    window.location.href = "/";
                                } catch (error) {
                                    console.error("Error signing out:", error);
                                }
                            }}
                            className={`w-full flex items-center h-10 rounded-lg transition-all duration-300 ease-in-out text-red-600 hover:bg-red-50 hover:text-red-700 ${
                                sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'
                            }`}
                        >
                            <FaPowerOff className="text-xl flex-shrink-0" />
                            <span className={`font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${
                                sidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'
                            }`}>
                                Log out
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 w-full md:w-auto">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 h-16 px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                            aria-label="Toggle menu"
                        >
                            <FaBars className="text-xl text-gray-700" />
                        </button>
                        <h1 className="text-gray-900 text-lg md:text-2xl font-semibold">
                            {activeTab === "dashboard" ? "Overview" : 
                             activeTab === "listings" ? "Listings" :
                             activeTab === "messages" ? "Messages" :
                             activeTab === "calendar" ? "Calendar" :
                             activeTab === "bookings" ? "Bookings" :
                             activeTab === "coupons" ? "Coupons" :
                             activeTab === "wishlists" ? "Wishlists" :
                             activeTab === "payments" ? "E-Wallet" :
                             activeTab === "rewards" ? "Points and Rewards" :
                             activeTab === "settings" ? "Account" : "Dashboard"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {username && (
                            <div className="flex items-end gap-3 pr-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{username}</p>
                                    <p className="text-xs text-gray-600 capitalize">{userType || "host"}</p>
                                </div>
                                {profilePic && profilePic.trim() !== "" && !profilePicError ? (
                                    <img 
                                        src={profilePic} 
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                        onError={() => {
                                            console.error("Error loading profile picture:", profilePic);
                                            setProfilePicError(true);
                                        }}
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                        <FaUser className="text-white text-sm" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "dashboard" && (
                        <div className="space-y-6">
                            {/* Loading State */}
                            {loadingDashboard ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Statistics Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                        {/* Total Revenue Card */}
                                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        ₱{dashboardStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="bg-green-100 p-3 rounded-lg">
                                                    <FaDollarSign className="text-2xl text-green-600" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500">This month:</span>
                                                <span className="text-green-600 font-semibold">
                                                    ₱{dashboardStats.thisMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Active Bookings Card */}
                                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-gray-600 text-sm mb-1">Active Bookings</p>
                                                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeBookings}</p>
                                                </div>
                                                <div className="bg-blue-100 p-3 rounded-lg">
                                                    <FaCheckCircle className="text-2xl text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500">Total:</span>
                                                <span className="text-gray-900 font-semibold">{dashboardStats.totalBookings}</span>
                                                {dashboardStats.pendingBookings > 0 && (
                                                    <>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-yellow-600 font-semibold">{dashboardStats.pendingBookings} pending</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Active Listings Card */}
                                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-gray-600 text-sm mb-1">Active Listings</p>
                                                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeListings}</p>
                                                </div>
                                                <div className="bg-purple-100 p-3 rounded-lg">
                                                    <FaList className="text-2xl text-purple-600" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500">Total:</span>
                                                <span className="text-gray-900 font-semibold">{dashboardStats.totalListings}</span>
                                            </div>
                                        </div>

                                        {/* Wallet Balance Card */}
                                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-gray-600 text-sm mb-1">Wallet Balance</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        ₱{walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="bg-indigo-100 p-3 rounded-lg">
                                                    <FaCreditCard className="text-2xl text-indigo-600" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500">Available</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Stats Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        {/* Average Rating Card */}
                                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm mb-2">Average Rating</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-3xl font-bold text-gray-900">
                                                            {dashboardStats.averageRating > 0 ? dashboardStats.averageRating.toFixed(1) : 'N/A'}
                                                        </p>
                                                        {dashboardStats.averageRating > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <FaStar className="text-yellow-400 text-xl" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bg-yellow-100 p-3 rounded-lg">
                                                    <FaStar className="text-2xl text-yellow-600" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Status Distribution */}
                                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                            <h3 className="text-gray-900 font-semibold mb-4">Booking Status</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { label: "Active", count: dashboardStats.activeBookings, color: "bg-green-500", total: dashboardStats.totalBookings },
                                                    { label: "Pending", count: dashboardStats.pendingBookings, color: "bg-yellow-500", total: dashboardStats.totalBookings },
                                                    { label: "Total", count: dashboardStats.totalBookings, color: "bg-blue-500", total: dashboardStats.totalBookings }
                                                ].map((status) => {
                                                    const percentage = status.total > 0 ? (status.count / status.total) * 100 : 0;
                                                    return (
                                                        <div key={status.label} className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-700 font-medium">{status.label}</span>
                                                                <span className="text-gray-600">{status.count}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`${status.color} h-2 rounded-full transition-all`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dashboard Tab Navigation */}
                                    <div className="flex gap-4 border-b border-gray-200">
                                <button
                                    onClick={() => setActiveDashboardTab("today")}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                                        activeDashboardTab === "today"
                                            ? "border-blue-600 text-blue-600 font-semibold"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <FaCalendarAlt />
                                    <span>Today</span>
                                </button>
                                <button
                                    onClick={() => setActiveDashboardTab("upcomings")}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                                        activeDashboardTab === "upcomings"
                                            ? "border-blue-600 text-blue-600 font-semibold"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <FaClock />
                                    <span>Upcomings</span>
                                </button>
                            </div>

                            {/* Today's Content */}
                            {activeDashboardTab === "today" && (
                                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Bookings</h2>
                                    {todayBookings.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <FaCalendarAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                                            <p>No bookings for today</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {todayBookings.map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{booking.guestName || "Guest"}</h3>
                                                            <p className="text-sm text-gray-600">{booking.listingTitle || "Listing"}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            booking.status === "active"
                                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                                : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                        }`}>
                                                            {booking.status === "active" ? "Active" : "Pending"}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-6 text-sm text-gray-600 mt-3">
                                                        <div className="flex items-center gap-2">
                                                            <FaCheckCircle className="text-blue-600" />
                                                            <span>Check-in: <span className="font-medium text-gray-900">{formatTime(booking.checkIn)}</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FaClock className="text-gray-500" />
                                                            <span>Check-out: <span className="font-medium text-gray-900">{formatTime(booking.checkOut)}</span></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Upcomings Content */}
                            {activeDashboardTab === "upcomings" && (
                                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Bookings</h2>
                                    {upcomingBookings.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <FaClock className="text-4xl mx-auto mb-2 text-gray-300" />
                                            <p>No upcoming bookings</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Guest</th>
                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Listing</th>
                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check-in</th>
                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check-out</th>
                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {upcomingBookings.map((booking) => (
                                                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="py-3 px-4 text-gray-900 font-medium">{booking.guestName || "Guest"}</td>
                                                            <td className="py-3 px-4 text-gray-700">{booking.listingTitle || "Listing"}</td>
                                                            <td className="py-3 px-4 text-gray-700">{formatDate(booking.checkIn)}</td>
                                                            <td className="py-3 px-4 text-gray-700">{formatDate(booking.checkOut)}</td>
                                                            <td className="py-3 px-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    booking.status === "active"
                                                                        ? "bg-green-100 text-green-700 border border-green-300"
                                                                        : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                                }`}>
                                                                    {booking.status === "active" ? "Active" : "Pending"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === "listings" && <Listings key={`listings-${tabRefreshKey.listings || 0}`} />}

                    {activeTab === "messages" && <Messages key={`messages-${tabRefreshKey.messages || 0}`} />}

                    {activeTab === "calendar" && <Calendar key={`calendar-${tabRefreshKey.calendar || 0}`} />}

                    {activeTab === "bookings" && <Bookings key={`bookings-${tabRefreshKey.bookings || 0}`} />}

                    {activeTab === "coupons" && <Coupons key={`coupons-${tabRefreshKey.coupons || 0}`} />}

                    {activeTab === "wishlists" && <Wishlists key={`wishlists-${tabRefreshKey.wishlists || 0}`} />}

                    {activeTab === "payments" && <PaymentMethods key={`payments-${tabRefreshKey.payments || 0}`} />}

                    {activeTab === "rewards" && <PointsRewards key={`rewards-${tabRefreshKey.rewards || 0}`} />}

                    {activeTab === "settings" && (
                        <UserDetails 
                            onBack={async () => {
                                // Refresh user data when returning from UserDetails
                                const user = auth.currentUser;
                                if (user) {
                                    await fetchUserData(user);
                                }
                                // Stay on host page, just switch to dashboard tab
                                setActiveTab("dashboard");
                            }}
                            hideBackButton={true}
                            isHostPage={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Hostpage;
export default Hostpage;

