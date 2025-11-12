import React, { useState } from "react";
import { FaStar, FaThumbsDown, FaCalendarAlt, FaUsers, FaChartLine, FaDollarSign, FaHome } from "react-icons/fa";

const Adminpage = () => {
    const [activeTab, setActiveTab] = useState("analytics");

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
        <div className="bg-white py-8 px-4 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard - Analytics</h1>

                {/* Analytics Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                            activeTab === "analytics"
                                ? "border-indigo-600 text-indigo-600 font-semibold"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaChartLine />
                        <span>Analytics Overview</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("best-reviews")}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                            activeTab === "best-reviews"
                                ? "border-indigo-600 text-indigo-600 font-semibold"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaStar />
                        <span>Best Reviews</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("lowest-reviews")}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                            activeTab === "lowest-reviews"
                                ? "border-indigo-600 text-indigo-600 font-semibold"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaThumbsDown />
                        <span>Lowest Reviews</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("bookings")}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                            activeTab === "bookings"
                                ? "border-indigo-600 text-indigo-600 font-semibold"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        <FaCalendarAlt />
                        <span>Bookings</span>
                    </button>
                </div>

                {/* Analytics Overview Tab */}
                {activeTab === "analytics" && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics Overview</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Revenue Chart Placeholder */}
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                                <div className="h-48 flex items-center justify-center text-gray-400">
                                    <p>Chart visualization will be here</p>
                                </div>
                            </div>

                            {/* Booking Trend */}
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Booking Trend</h3>
                                <div className="h-48 flex items-center justify-center text-gray-400">
                                    <p>Chart visualization will be here</p>
                                </div>
                            </div>

                            {/* User Growth */}
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">User Growth</h3>
                                <div className="h-48 flex items-center justify-center text-gray-400">
                                    <p>Chart visualization will be here</p>
                                </div>
                            </div>

                            {/* Rating Distribution */}
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
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

                {/* Best Reviews Tab */}
                {activeTab === "best-reviews" && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Best Reviews (5 Stars)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bestReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} isBest={true} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Lowest Reviews Tab */}
                {activeTab === "lowest-reviews" && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Lowest Reviews (1-2 Stars)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lowestReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} isBest={false} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === "bookings" && (
                    <div className="bg-white rounded-lg shadow-md p-6">
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
                                                        ? "bg-green-100 text-green-700"
                                                        : booking.status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
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
        </div>
    );
};

export default Adminpage;

