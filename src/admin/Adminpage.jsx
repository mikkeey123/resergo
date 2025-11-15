import React, { useState, useEffect } from "react";
import { 
    FaStar, 
    FaThumbsDown, 
    FaCalendarAlt, 
    FaUsers, 
    FaChartLine, 
    FaDollarSign, 
    FaHome,
    FaBars,
    FaTimes,
    FaPowerOff,
    FaUser,
    FaFileAlt,
    FaShieldAlt,
    FaDownload,
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaEdit
} from "react-icons/fa";
import { auth, getUserData, getUserType, getAllBookings, getAllReviews, getAllListings, getAllUsers, getAllTransactions, getListing, getWalletBalance, saveRulesAndRegulations, getRulesAndRegulations, saveCancellationRules, getCancellationRules, approveWithdrawal, rejectWithdrawal } from "../../Config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import UserDetails from "../components/UserDetails";
import EWallet from "../components/EWallet";
import logo from "../assets/logo.png";

const Adminpage = () => {
    const [activeTab, setActiveTab] = useState("analytics");
    const [reviewsSubTab, setReviewsSubTab] = useState("best");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [userType, setUserType] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [profilePicError, setProfilePicError] = useState(false);
    
    // Data states
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyticsStats, setAnalyticsStats] = useState([]);
    
    // Policy states
    const [cancellationRules, setCancellationRules] = useState({
        freeCancellation: true,
        freeCancellationDays: 7,
        partialRefundDays: 3,
        noRefundDays: 1
    });
    const [regulations, setRegulations] = useState("");

    // Function to fetch and update user data
    const fetchUserData = async (user) => {
        if (user) {
            try {
                const userData = await getUserData(user.uid);
                if (userData) {
                    const profilePicture = userData.ProfilePicture || user.photoURL || "";
                    setUsername(userData.Username || user.displayName || "");
                    setProfilePic(profilePicture);
                    setProfilePicError(false);
                    const type = await getUserType(user.uid);
                    setUserType(type || "admin");
                } else {
                    setUsername(user.displayName || "");
                    setProfilePic(user.photoURL || "");
                    setUserType("admin");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUsername(user.displayName || "");
                setProfilePic(user.photoURL || "");
                setUserType("admin");
            }
        }
    };

    // Fetch all admin data
    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [bookingsData, reviewsData, listingsData, usersData, transactionsData] = await Promise.all([
                getAllBookings(),
                getAllReviews(),
                getAllListings(),
                getAllUsers(),
                getAllTransactions()
            ]);

            setBookings(bookingsData);
            setReviews(reviewsData);
            setListings(listingsData);
            setUsers(usersData);
            setTransactions(transactionsData);

            // Calculate analytics stats
            const totalRevenue = bookingsData
                .filter(b => b.status === "active" && b.totalAmount)
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            
            const activeListings = listingsData.filter(l => !l.isDraft).length;
            const activeUsers = usersData.filter(u => u.UserType === "guest" || u.UserType === "host").length;
            const avgRating = reviewsData.length > 0
                ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length
                : 0;

            setAnalyticsStats([
                { label: "Total Bookings", value: bookingsData.length.toString(), icon: FaCalendarAlt, color: "bg-blue-500", change: "+12%" },
                { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FaDollarSign, color: "bg-green-500", change: "+8%" },
                { label: "Active Users", value: activeUsers.toString(), icon: FaUsers, color: "bg-purple-500", change: "+15%" },
                { label: "Active Listings", value: activeListings.toString(), icon: FaHome, color: "bg-orange-500", change: "+5%" },
                { label: "Average Rating", value: avgRating.toFixed(1), icon: FaStar, color: "bg-yellow-500", change: "+0.2" },
                { label: "Total Reviews", value: reviewsData.length.toString(), icon: FaChartLine, color: "bg-indigo-500", change: "+20%" },
            ]);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            await fetchUserData(user);
        });

        const handleProfileUpdate = async (event) => {
            const user = auth.currentUser;
            if (user) {
                setTimeout(async () => {
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

    // Fetch admin data when tab changes
    useEffect(() => {
        if (activeTab === "analytics" || activeTab === "reviews" || activeTab === "bookings" || activeTab === "payments") {
            fetchAdminData();
        }
        if (activeTab === "policies") {
            fetchPolicyData();
        }
    }, [activeTab]);

    // Fetch policy data (rules & regulations, cancellation rules)
    const fetchPolicyData = async () => {
        try {
            const [regulationsData, cancellationRulesData] = await Promise.all([
                getRulesAndRegulations(),
                getCancellationRules()
            ]);
            setRegulations(regulationsData);
            setCancellationRules(cancellationRulesData);
        } catch (error) {
            console.error("Error fetching policy data:", error);
        }
    };

    // State for formatted reviews
    const [formattedBestReviews, setFormattedBestReviews] = useState([]);
    const [formattedLowestReviews, setFormattedLowestReviews] = useState([]);

    // Format reviews with user and listing data
    useEffect(() => {
        const formatReviews = async () => {
            const best = reviews.filter(r => r.rating === 5).slice(0, 20);
            const lowest = reviews.filter(r => r.rating <= 2).slice(0, 20);

            const formattedBest = await Promise.all(best.map(async (review) => {
                try {
                    const [guestData, listingData] = await Promise.all([
                        getUserData(review.guestId).catch(() => null),
                        getListing(review.listingId).catch(() => null)
                    ]);
                    return {
                        ...review,
                        guest: guestData?.Username || "Guest",
                        listing: listingData?.title || "Unknown Listing",
                        date: review.createdAt?.toDate().toLocaleDateString() || "N/A"
                    };
                } catch (error) {
                    return {
                        ...review,
                        guest: "Guest",
                        listing: "Unknown Listing",
                        date: review.createdAt?.toDate().toLocaleDateString() || "N/A"
                    };
                }
            }));

            const formattedLowest = await Promise.all(lowest.map(async (review) => {
                try {
                    const [guestData, listingData] = await Promise.all([
                        getUserData(review.guestId).catch(() => null),
                        getListing(review.listingId).catch(() => null)
                    ]);
                    return {
                        ...review,
                        guest: guestData?.Username || "Guest",
                        listing: listingData?.title || "Unknown Listing",
                        date: review.createdAt?.toDate().toLocaleDateString() || "N/A"
                    };
                } catch (error) {
                    return {
                        ...review,
                        guest: "Guest",
                        listing: "Unknown Listing",
                        date: review.createdAt?.toDate().toLocaleDateString() || "N/A"
                    };
                }
            }));

            setFormattedBestReviews(formattedBest);
            setFormattedLowestReviews(formattedLowest);
        };

        if (reviews.length > 0) {
            formatReviews();
        }
    }, [reviews]);

    // State for formatted bookings
    const [formattedBookings, setFormattedBookings] = useState([]);

    // Format booking data with user names
    useEffect(() => {
        const formatBookings = async () => {
            const formatted = await Promise.all(bookings.map(async (booking) => {
                try {
                    const [guestData, hostData, listingData] = await Promise.all([
                        getUserData(booking.guestId).catch(() => null),
                        getUserData(booking.hostId).catch(() => null),
                        getListing(booking.listingId).catch(() => null)
                    ]);
                    
                    return {
                        ...booking,
                        guestName: guestData?.Username || "Guest",
                        hostName: hostData?.Username || "Host",
                        listingTitle: listingData?.title || "Unknown Listing",
                        checkInDate: booking.checkIn?.toDate().toLocaleDateString() || "N/A",
                        checkOutDate: booking.checkOut?.toDate().toLocaleDateString() || "N/A",
                        amount: `₱${(booking.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    };
                } catch (error) {
                    return {
                        ...booking,
                        guestName: "Guest",
                        hostName: "Host",
                        listingTitle: "Unknown Listing",
                        checkInDate: booking.checkIn?.toDate().toLocaleDateString() || "N/A",
                        checkOutDate: booking.checkOut?.toDate().toLocaleDateString() || "N/A",
                        amount: `₱${(booking.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    };
                }
            }));
            setFormattedBookings(formatted);
        };

        if (bookings.length > 0) {
            formatBookings();
        }
    }, [bookings]);

    // Generate report
    const generateReport = async (type) => {
        try {
            let reportData = "";
            let filename = "";

            if (type === "bookings") {
                reportData = "Booking ID,Guest,Host,Listing,Check-in,Check-out,Amount,Status\n";
                formattedBookings.forEach(b => {
                    reportData += `${b.id},${b.guestName},${b.hostName},${b.listingTitle},${b.checkInDate},${b.checkOutDate},${b.amount},${b.status}\n`;
                });
                filename = `bookings-report-${new Date().toISOString().split('T')[0]}.csv`;
            } else if (type === "reviews") {
                reportData = "Review ID,Guest,Listing,Rating,Comment,Date\n";
                reviews.forEach(r => {
                    reportData += `${r.id},${r.guestId},${r.listingId},${r.rating},${(r.comment || "").replace(/,/g, ";")},${r.createdAt?.toDate().toLocaleDateString() || "N/A"}\n`;
                });
                filename = `reviews-report-${new Date().toISOString().split('T')[0]}.csv`;
            } else if (type === "users") {
                reportData = "User ID,Username,Email,User Type,Phone Number\n";
                users.forEach(u => {
                    reportData += `${u.id},${u.Username || "N/A"},${u.Email || "N/A"},${u.UserType || "N/A"},${u.Number || "N/A"}\n`;
                });
                filename = `users-report-${new Date().toISOString().split('T')[0]}.csv`;
            }

            // Download CSV
            const blob = new Blob([reportData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Please try again.");
        }
    };

    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
        const count = reviews.filter(r => r.rating === rating).length;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { rating, count, percentage };
    });

    const navigationItems = [
        { id: "analytics", label: "Analytics", icon: <FaChartLine /> },
        { id: "reviews", label: "Reviews", icon: <FaStar /> },
        { id: "bookings", label: "Bookings", icon: <FaCalendarAlt /> },
        { id: "policies", label: "Policy & Compliance", icon: <FaShieldAlt /> },
        { id: "reports", label: "Reports", icon: <FaFileAlt /> },
        { id: "payments", label: "Payments", icon: <FaDollarSign /> },
        { id: "settings", label: "Account", icon: <FaUser /> },
    ];

    // Review Card Component
    const ReviewCard = ({ review, isBest = true }) => (
        <div className={`border rounded-lg p-4 ${isBest ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">{review.guest || "Guest"}</h3>
                    <p className="text-sm text-gray-600">{review.listing || "Unknown Listing"}</p>
                </div>
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <FaStar
                            key={i}
                            className={`text-sm ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">{review.rating || 0}/5</span>
                </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{review.comment || "No comment"}</p>
            <p className="text-xs text-gray-500">{review.date || "N/A"}</p>
        </div>
    );

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
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 ease-in-out relative ${
                                    sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'
                                } ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md hover:shadow-xl hover:bg-blue-700 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium active:scale-95"
                                }`}
                            >
                                <span className={`text-xl flex-shrink-0 transition-colors duration-200 ${
                                    isActive ? 'text-white' : 'text-gray-600'
                                }`}>
                                    {item.icon}
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
                            {activeTab === "analytics" ? "Analytics" : 
                             activeTab === "reviews" ? "Reviews" :
                             activeTab === "bookings" ? "Bookings" :
                             activeTab === "policies" ? "Policy & Compliance" :
                             activeTab === "reports" ? "Reports" :
                             activeTab === "payments" ? "Payments" :
                             activeTab === "settings" ? "Account" : "Admin Dashboard"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {username && (
                            <div className="flex items-end gap-3 pr-4">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold text-gray-900">{username}</p>
                                    <p className="text-xs text-gray-600 capitalize">{userType || "admin"}</p>
                                </div>
                                {profilePic && profilePic.trim() !== "" && !profilePicError ? (
                                    <img 
                                        src={profilePic} 
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                        onError={() => {
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
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {loading && activeTab !== "settings" && (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {!loading && activeTab === "analytics" && (
                        <div className="space-y-6">
                            {/* Analytics Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {analyticsStats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={index} className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                                                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                                                </div>
                                                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                                                    <Icon className="text-xl md:text-2xl" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                                                <span className="text-gray-500 text-xs">vs last month</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Rating Distribution */}
                                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                                    <div className="space-y-2">
                                        {ratingDistribution.map(({ rating, count, percentage }) => (
                                            <div key={rating} className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600 w-16 text-right">{count} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Booking Status Distribution */}
                                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Booking Status</h3>
                                    <div className="space-y-3">
                                        {["active", "pending", "canceled", "cancel_requested"].map(status => {
                                            const count = bookings.filter(b => b.status === status).length;
                                            const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                                            return (
                                                <div key={status} className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700 capitalize">{status.replace("_", " ")}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    status === "active" ? "bg-green-500" :
                                                                    status === "pending" ? "bg-yellow-500" :
                                                                    "bg-red-500"
                                                                }`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {!loading && activeTab === "reviews" && (
                        <div className="space-y-6">
                            {/* Tab Navigation for Reviews */}
                            <div className="flex gap-4 border-b border-gray-200">
                                <button
                                    onClick={() => setReviewsSubTab("best")}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                                        reviewsSubTab === "best"
                                            ? "border-blue-600 text-blue-600 font-semibold"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <FaStar />
                                    <span>Best Reviews</span>
                                </button>
                                <button
                                    onClick={() => setReviewsSubTab("lowest")}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                                        reviewsSubTab === "lowest"
                                            ? "border-blue-600 text-blue-600 font-semibold"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <FaThumbsDown />
                                    <span>Lowest Reviews</span>
                                </button>
                            </div>

                            {/* Best Reviews */}
                            {reviewsSubTab === "best" && (
                                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Best Reviews (5 Stars)</h2>
                                    {formattedBestReviews.length === 0 ? (
                                        <p className="text-center py-8 text-gray-500">No 5-star reviews yet.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {formattedBestReviews.map((review) => (
                                                <ReviewCard key={review.id} review={review} isBest={true} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Lowest Reviews */}
                            {reviewsSubTab === "lowest" && (
                                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Lowest Reviews (1-2 Stars)</h2>
                                    {formattedLowestReviews.length === 0 ? (
                                        <p className="text-center py-8 text-gray-500">No low-rated reviews.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {formattedLowestReviews.map((review) => (
                                                <ReviewCard key={review.id} review={review} isBest={false} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {!loading && activeTab === "bookings" && (
                        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">All Bookings</h2>
                            {bookings.length === 0 ? (
                                <p className="text-center py-8 text-gray-500">No bookings found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Guest</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Listing</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Host</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check-in</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check-out</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Amount</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formattedBookings.length > 0 ? formattedBookings.map((booking) => (
                                                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-900 font-medium">{booking.guestName || "Guest"}</td>
                                                    <td className="py-3 px-4 text-gray-700">{booking.listingTitle || "Unknown"}</td>
                                                    <td className="py-3 px-4 text-gray-700">{booking.hostName || "Host"}</td>
                                                    <td className="py-3 px-4 text-gray-700">{booking.checkInDate || "N/A"}</td>
                                                    <td className="py-3 px-4 text-gray-700">{booking.checkOutDate || "N/A"}</td>
                                                    <td className="py-3 px-4 text-gray-900 font-semibold">{booking.amount || "₱0.00"}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            booking.status === "active"
                                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                                : booking.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                                : booking.status === "cancel_requested"
                                                                ? "bg-orange-100 text-orange-700 border border-orange-300"
                                                                : "bg-red-100 text-red-700 border border-red-300"
                                                        }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="7" className="py-8 text-center text-gray-500">Loading bookings...</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Policy & Compliance Tab */}
                    {activeTab === "policies" && (
                        <div className="space-y-6">
                            {/* Cancellation Rules */}
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Cancellation Rules</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={cancellationRules.freeCancellation}
                                            onChange={(e) => setCancellationRules({...cancellationRules, freeCancellation: e.target.checked})}
                                            className="w-5 h-5 text-blue-600 rounded"
                                        />
                                        <label className="text-gray-700 font-medium">Enable Free Cancellation</label>
                                    </div>
                                    {cancellationRules.freeCancellation && (
                                        <div className="ml-8 space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Free Cancellation Days (before check-in)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={cancellationRules.freeCancellationDays}
                                                    onChange={(e) => setCancellationRules({...cancellationRules, freeCancellationDays: parseInt(e.target.value) || 0})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Partial Refund Days (before check-in)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={cancellationRules.partialRefundDays}
                                                    onChange={(e) => setCancellationRules({...cancellationRules, partialRefundDays: parseInt(e.target.value) || 0})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    No Refund Days (before check-in)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={cancellationRules.noRefundDays}
                                                    onChange={(e) => setCancellationRules({...cancellationRules, noRefundDays: parseInt(e.target.value) || 0})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={async () => {
                                            try {
                                                await saveCancellationRules(cancellationRules);
                                                alert("Cancellation rules saved successfully!");
                                            } catch (error) {
                                                console.error("Error saving cancellation rules:", error);
                                                alert("Failed to save cancellation rules. Please try again.");
                                            }
                                        }}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Save Rules
                                    </button>
                                </div>
                            </div>

                            {/* Rules & Regulations */}
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Rules & Regulations</h2>
                                <textarea
                                    value={regulations}
                                    onChange={(e) => setRegulations(e.target.value)}
                                    placeholder="Enter rules and regulations..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                                />
                                <button
                                    onClick={async () => {
                                        try {
                                            await saveRulesAndRegulations(regulations);
                                            alert("Rules & regulations saved successfully!");
                                        } catch (error) {
                                            console.error("Error saving rules & regulations:", error);
                                            alert("Failed to save rules & regulations. Please try again.");
                                        }
                                    }}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Save Regulations
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === "reports" && (
                        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Reports</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => generateReport("bookings")}
                                    className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                                >
                                    <FaCalendarAlt className="text-4xl text-blue-600" />
                                    <span className="font-semibold text-gray-900">Bookings Report</span>
                                    <span className="text-sm text-gray-600">Download CSV</span>
                                </button>
                                <button
                                    onClick={() => generateReport("reviews")}
                                    className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                                >
                                    <FaStar className="text-4xl text-blue-600" />
                                    <span className="font-semibold text-gray-900">Reviews Report</span>
                                    <span className="text-sm text-gray-600">Download CSV</span>
                                </button>
                                <button
                                    onClick={() => generateReport("users")}
                                    className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                                >
                                    <FaUsers className="text-4xl text-blue-600" />
                                    <span className="font-semibold text-gray-900">Users Report</span>
                                    <span className="text-sm text-gray-600">Download CSV</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {!loading && activeTab === "payments" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">E-Wallet</h2>
                                <EWallet />
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Review & Confirmation</h2>
                                {transactions.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500">No transactions to review.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">User</th>
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Type</th>
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Amount</th>
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.slice(0, 50).map((transaction) => (
                                                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-gray-900 font-medium">{transaction.userId || "N/A"}</td>
                                                        <td className="py-3 px-4 text-gray-700 capitalize">{transaction.type || "N/A"}</td>
                                                        <td className="py-3 px-4 text-gray-900 font-semibold">
                                                            ₱{(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                transaction.status === "completed"
                                                                    ? "bg-green-100 text-green-700 border border-green-300"
                                                                    : transaction.status === "pending"
                                                                    ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                                    : "bg-red-100 text-red-700 border border-red-300"
                                                            }`}>
                                                                {transaction.status || "N/A"}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-700">
                                                            {transaction.timestamp?.toDate().toLocaleDateString() || "N/A"}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                                    title="View Details"
                                                                >
                                                                    <FaEye />
                                                                </button>
                                                                {transaction.status === "pending" && transaction.type === "withdrawal" && (
                                                                    <>
                                                                        <button
                                                                            onClick={async () => {
                                                                                if (window.confirm(`Approve withdrawal of ₱${(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}?`)) {
                                                                                    try {
                                                                                        await approveWithdrawal(transaction.id);
                                                                                        alert("Withdrawal approved successfully!");
                                                                                        // Reload transactions
                                                                                        const transactionsData = await getAllTransactions();
                                                                                        setTransactions(transactionsData);
                                                                                    } catch (error) {
                                                                                        alert(`Error: ${error.message || "Failed to approve withdrawal"}`);
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                                                            title="Approve Withdrawal"
                                                                        >
                                                                            <FaCheckCircle />
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                const reason = window.prompt("Enter rejection reason (optional):");
                                                                                if (reason !== null) { // User didn't cancel
                                                                                    try {
                                                                                        await rejectWithdrawal(transaction.id, reason || "");
                                                                                        alert("Withdrawal rejected successfully!");
                                                                                        // Reload transactions
                                                                                        const transactionsData = await getAllTransactions();
                                                                                        setTransactions(transactionsData);
                                                                                    } catch (error) {
                                                                                        alert(`Error: ${error.message || "Failed to reject withdrawal"}`);
                                                                                    }
                                                                                }
                                                                            }}
                                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                                            title="Reject Withdrawal"
                                                                        >
                                                                            <FaTimesCircle />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Account Settings Tab */}
                    {activeTab === "settings" && (
                        <UserDetails 
                            onBack={async () => {
                                const user = auth.currentUser;
                                if (user) {
                                    await fetchUserData(user);
                                }
                                setActiveTab("analytics");
                            }}
                            hideBackButton={true}
                            isHostPage={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Adminpage;
