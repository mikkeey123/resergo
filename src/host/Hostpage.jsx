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
    FaTicketAlt
} from "react-icons/fa";
import Messages from "./Messages";
import Listings from "./Listings";
import Calendar from "./Calendar";
import Bookings from "./Bookings";
import Coupons from "./Coupons";
import PaymentMethods from "./PaymentMethods";
import PointsRewards from "./PointsRewards";
import UserDetails from "../components/UserDetails";
import { auth, getUserData, getUserType } from "../../Config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import logo from "../assets/logo.png";

const Hostpage = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [activeDashboardTab, setActiveDashboardTab] = useState("today");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [userType, setUserType] = useState("");
    const [profilePic, setProfilePic] = useState("");

    // Fetch user data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userData = await getUserData(user.uid);
                    if (userData) {
                        setUsername(userData.Username || user.displayName || "");
                        setProfilePic(userData.ProfilePicture || user.photoURL || "");
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
        });

        return () => unsubscribe();
    }, []);

    // Today's data
    const todayBookings = [
        { id: 1, guest: "John Doe", listing: "Cozy Mountain Cabin", checkIn: "10:00 AM", checkOut: "2:00 PM", status: "Active" },
        { id: 2, guest: "Jane Smith", listing: "Beachfront Villa", checkIn: "3:00 PM", checkOut: "11:00 AM", status: "Check-in" },
        { id: 3, guest: "Mike Johnson", listing: "Urban Loft", checkIn: "Completed", checkOut: "11:00 AM", status: "Check-out" },
    ];

    // Upcoming data
    const upcomingBookings = [
        { id: 1, guest: "Sarah Wilson", listing: "Mountain Retreat", date: "2024-01-15", time: "2:00 PM", status: "Confirmed" },
        { id: 2, guest: "David Brown", listing: "City Center Apartment", date: "2024-01-16", time: "3:00 PM", status: "Confirmed" },
        { id: 3, guest: "Emily Davis", listing: "Luxury Penthouse", date: "2024-01-17", time: "12:00 PM", status: "Confirmed" },
        { id: 4, guest: "Robert Taylor", listing: "Beach House", date: "2024-01-18", time: "4:00 PM", status: "Confirmed" },
        { id: 5, guest: "Lisa Anderson", listing: "Cottage by Lake", date: "2024-01-20", time: "1:00 PM", status: "Confirmed" },
    ];

    const navigationItems = [
        { id: "dashboard", label: "Overview", icon: <FaHome /> },
        { id: "listings", label: "Listings", icon: <FaList /> },
        { id: "messages", label: "Messages", icon: <FaComments /> },
        { id: "calendar", label: "Calendar", icon: <FaCalendarAlt /> },
        { id: "bookings", label: "Bookings", icon: <FaCalendar /> },
        { id: "coupons", label: "Coupons", icon: <FaTicketAlt /> },
        { id: "payments", label: "Payment Method", icon: <FaCreditCard /> },
        { id: "rewards", label: "Points and Rewards", icon: <FaGift /> },
        { id: "settings", label: "Account", icon: <FaUser /> },
    ];

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
                            {activeTab === "dashboard" ? "Overview" : 
                             activeTab === "listings" ? "Listings" :
                             activeTab === "messages" ? "Messages" :
                             activeTab === "calendar" ? "Calendar" :
                             activeTab === "bookings" ? "Bookings" :
                             activeTab === "coupons" ? "Coupons" :
                             activeTab === "payments" ? "Payment Method" :
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
                                {profilePic ? (
                                    <img 
                                        src={profilePic} 
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
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
                                    <div className="space-y-4">
                                        {todayBookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{booking.guest}</h3>
                                                        <p className="text-sm text-gray-600">{booking.listing}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        booking.status === "Active"
                                                            ? "bg-green-100 text-green-700 border border-green-300"
                                                            : booking.status === "Check-in"
                                                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                            : "bg-orange-100 text-orange-700 border border-orange-300"
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="flex gap-6 text-sm text-gray-600 mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <FaCheckCircle className="text-blue-600" />
                                                        <span>Check-in: <span className="font-medium text-gray-900">{booking.checkIn}</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <FaClock className="text-gray-500" />
                                                        <span>Check-out: <span className="font-medium text-gray-900">{booking.checkOut}</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upcomings Content */}
                            {activeDashboardTab === "upcomings" && (
                                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Bookings</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Guest</th>
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Listing</th>
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Time</th>
                                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {upcomingBookings.map((booking) => (
                                                    <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-gray-900 font-medium">{booking.guest}</td>
                                                        <td className="py-3 px-4 text-gray-700">{booking.listing}</td>
                                                        <td className="py-3 px-4 text-gray-700">{booking.date}</td>
                                                        <td className="py-3 px-4 text-gray-700">{booking.time}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                booking.status === "Confirmed"
                                                                    ? "bg-green-100 text-green-700 border border-green-300"
                                                                    : "bg-yellow-100 text-yellow-700 border border-yellow-300"
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
                        </div>
                    )}

                    {activeTab === "listings" && <Listings />}

                    {activeTab === "messages" && <Messages />}

                    {activeTab === "calendar" && <Calendar />}

                    {activeTab === "bookings" && <Bookings />}

                    {activeTab === "coupons" && <Coupons />}

                    {activeTab === "payments" && <PaymentMethods />}

                    {activeTab === "rewards" && <PointsRewards />}

                    {activeTab === "settings" && (
                        <UserDetails 
                            onBack={() => {
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
