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
    FaShieldAlt
} from "react-icons/fa";
import { auth, getUserData, getUserType } from "../../Config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import UserDetails from "../components/UserDetails";
import EWallet from "../components/EWallet";
import logo from "../assets/logo.png";

const Adminpage = () => {
    const [activeTab, setActiveTab] = useState("analytics");
    const [reviewsSubTab, setReviewsSubTab] = useState("best"); // "best" or "lowest"
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [userType, setUserType] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [profilePicError, setProfilePicError] = useState(false);

    // Function to fetch and update user data
    const fetchUserData = async (user) => {
        if (user) {
            try {
                const userData = await getUserData(user.uid);
                if (userData) {
                    const profilePicture = userData.ProfilePicture || user.photoURL || "";
                    console.log("Adminpage: Fetched user data - ProfilePicture:", profilePicture ? "Exists" : "Not found");
                    setUsername(userData.Username || user.displayName || "");
                    setProfilePic(profilePicture);
                    setProfilePicError(false); // Reset error state when fetching new data
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

    // Fetch user data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            await fetchUserData(user);
        });

        // Listen for profile update events
        const handleProfileUpdate = async (event) => {
            console.log("Adminpage: Profile update event received", event.detail);
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

    // Best Reviews Data
    const bestReviews = [
        { id: 1, guest: "John Doe", listing: "Cozy Mountain Cabin", rating: 5, review: "Amazing experience! The cabin was perfect and the host was very accommodating.", date: "2024-01-10" },
        { id: 2, guest: "Jane Smith", listing: "Beachfront Villa", rating: 5, review: "Absolutely stunning views and pristine accommodations. Highly recommend!", date: "2024-01-08" },
        { id: 3, guest: "Mike Johnson", listing: "Urban Loft", rating: 5, review: "Best stay ever! Location was perfect and everything was spotless.", date: "2024-01-05" },
        { id: 4, guest: "Sarah Wilson", listing: "Mountain Retreat", rating: 5, review: "Exceeded expectations in every way. Will definitely return!", date: "2024-01-03" },
    ];

    // Lowest Reviews Data
    const lowestReviews = [
        { id: 1, guest: "David Brown", listing: "City Center Apartment", rating: 2, review: "The place was not as described. Very disappointed with the cleanliness.", date: "2024-01-09" },
        { id: 2, guest: "Emily Davis", listing: "Luxury Penthouse", rating: 2, review: "Poor communication from host. The property had maintenance issues.", date: "2024-01-07" },
        { id: 3, guest: "Robert Taylor", listing: "Beach House", rating: 1, review: "Unacceptable condition. Would not recommend to anyone.", date: "2024-01-04" },
        { id: 4, guest: "Lisa Anderson", listing: "Cottage by Lake", rating: 2, review: "The location was great but the property needs significant improvements.", date: "2024-01-02" },
    ];

    // Bookings Data
    const bookings = [
        { id: 1, guest: "John Doe", listing: "Cozy Mountain Cabin", host: "Host Name 1", checkIn: "2024-01-15", checkOut: "2024-01-18", status: "Confirmed", amount: "$450" },
        { id: 2, guest: "Jane Smith", listing: "Beachfront Villa", host: "Host Name 2", checkIn: "2024-01-16", checkOut: "2024-01-20", status: "Confirmed", amount: "$800" },
        { id: 3, guest: "Mike Johnson", listing: "Urban Loft", host: "Host Name 3", checkIn: "2024-01-17", checkOut: "2024-01-19", status: "Pending", amount: "$300" },
        { id: 4, guest: "Sarah Wilson", listing: "Mountain Retreat", host: "Host Name 4", checkIn: "2024-01-18", checkOut: "2024-01-22", status: "Confirmed", amount: "$600" },
        { id: 5, guest: "David Brown", listing: "City Center Apartment", host: "Host Name 5", checkIn: "2024-01-19", checkOut: "2024-01-21", status: "Cancelled", amount: "$250" },
        { id: 6, guest: "Emily Davis", listing: "Luxury Penthouse", host: "Host Name 6", checkIn: "2024-01-20", checkOut: "2024-01-25", status: "Confirmed", amount: "$1,200" },
    ];

    // Analytics Stats
    const analyticsStats = [
        { label: "Total Bookings", value: "1,234", icon: FaCalendarAlt, color: "bg-blue-500", change: "+12%" },
        { label: "Total Revenue", value: "$125,000", icon: FaDollarSign, color: "bg-green-500", change: "+8%" },
        { label: "Active Users", value: "5,678", icon: FaUsers, color: "bg-purple-500", change: "+15%" },
        { label: "Active Listings", value: "890", icon: FaHome, color: "bg-orange-500", change: "+5%" },
        { label: "Average Rating", value: "4.5", icon: FaStar, color: "bg-yellow-500", change: "+0.2" },
        { label: "Total Reviews", value: "3,456", icon: FaChartLine, color: "bg-indigo-500", change: "+20%" },
    ];

    const navigationItems = [
        { id: "analytics", label: "Analytics", icon: <FaChartLine /> },
        { id: "reviews", label: "Reviews", icon: <FaStar /> },
        { id: "bookings", label: "Bookings", icon: <FaCalendarAlt /> },
        { id: "policies", label: "Policy & Compliance", icon: <FaShieldAlt /> },
        { id: "reports", label: "Reports", icon: <FaFileAlt /> },
        { id: "payments", label: "Payments", icon: <FaDollarSign /> },
        { id: "settings", label: "Account", icon: <FaUser /> },
    ];

    // Review Rating Component
    const ReviewCard = ({ review, isBest = true }) => (
        <div className={`border rounded-lg p-4 ${isBest ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">{review.guest}</h3>
                    <p className="text-sm text-gray-600">{review.listing}</p>
                </div>
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <FaStar
                            key={i}
                            className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">{review.rating}/5</span>
                </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{review.review}</p>
            <p className="text-xs text-gray-500">{review.date}</p>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}>
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
                        onClick={() => setSidebarOpen(true)}
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
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-gray-900 text-2xl font-semibold">
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
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{username}</p>
                                    <p className="text-xs text-gray-600 capitalize">{userType || "admin"}</p>
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
                    {/* Analytics Tab */}
                    {activeTab === "analytics" && (
                        <div className="space-y-6">
                            {/* Analytics Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {analyticsStats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                                </div>
                                                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                                                    <Icon className="text-2xl" />
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Revenue Chart Placeholder */}
                                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                                    <div className="h-48 flex items-center justify-center text-gray-400">
                                        <p>Chart visualization will be here</p>
                                    </div>
                                </div>

                                {/* Booking Trend */}
                                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Booking Trend</h3>
                                    <div className="h-48 flex items-center justify-center text-gray-400">
                                        <p>Chart visualization will be here</p>
                                    </div>
                                </div>

                                {/* User Growth */}
                                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">User Growth</h3>
                                    <div className="h-48 flex items-center justify-center text-gray-400">
                                        <p>Chart visualization will be here</p>
                                    </div>
                                </div>

                                {/* Rating Distribution */}
                                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((rating) => (
                                            <div key={rating} className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${(6 - rating) * 15}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600 w-12">{(6 - rating) * 15}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === "reviews" && (
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
                                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Best Reviews (5 Stars)</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {bestReviews.map((review) => (
                                            <ReviewCard key={review.id} review={review} isBest={true} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Lowest Reviews */}
                            {reviewsSubTab === "lowest" && (
                                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Lowest Reviews (1-2 Stars)</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {lowestReviews.map((review) => (
                                            <ReviewCard key={review.id} review={review} isBest={false} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {activeTab === "bookings" && (
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">All Bookings</h2>
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
                                        {bookings.map((booking) => (
                                            <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-900 font-medium">{booking.guest}</td>
                                                <td className="py-3 px-4 text-gray-700">{booking.listing}</td>
                                                <td className="py-3 px-4 text-gray-700">{booking.host}</td>
                                                <td className="py-3 px-4 text-gray-700">{booking.checkIn}</td>
                                                <td className="py-3 px-4 text-gray-700">{booking.checkOut}</td>
                                                <td className="py-3 px-4 text-gray-900 font-semibold">{booking.amount}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        booking.status === "Confirmed"
                                                            ? "bg-green-100 text-green-700 border border-green-300"
                                                            : booking.status === "Pending"
                                                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                            : "bg-red-100 text-red-700 border border-red-300"
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Policy & Compliance Tab */}
                    {activeTab === "policies" && (
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Policy & Compliance</h2>
                            <div className="text-center py-12 text-gray-500">
                                <FaShieldAlt className="text-6xl mx-auto mb-4 text-gray-300" />
                                <p className="text-lg mb-2">Policy & Compliance section</p>
                                <p className="text-sm">This section will contain cancellation rules, regulations, and reports.</p>
                            </div>
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === "reports" && (
                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Reports</h2>
                            <div className="text-center py-12 text-gray-500">
                                <FaFileAlt className="text-6xl mx-auto mb-4 text-gray-300" />
                                <p className="text-lg mb-2">Report Generation</p>
                                <p className="text-sm">This section will allow you to generate and download reports.</p>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === "payments" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">E-Wallet</h2>
                                <EWallet />
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Review & Confirmation</h2>
                                <div className="text-center py-12 text-gray-500">
                                    <FaDollarSign className="text-6xl mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg mb-2">Payment Review & Confirmation</p>
                                    <p className="text-sm">This section will allow you to review and confirm payments from hosts.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account Settings Tab */}
                    {activeTab === "settings" && (
                        <UserDetails 
                            onBack={async () => {
                                // Refresh user data when returning from UserDetails
                                const user = auth.currentUser;
                                if (user) {
                                    await fetchUserData(user);
                                }
                                // Stay on admin page, just switch to analytics tab
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
