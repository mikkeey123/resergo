import React, { useState } from "react";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaCheck, FaBan } from "react-icons/fa";

const Bookings = () => {
    const [activeTab, setActiveTab] = useState("today");

    // Today's bookings with state management
    const [todayBookings, setTodayBookings] = useState([
        { id: 1, guest: "John Doe", listing: "Cozy Mountain Cabin", checkIn: "10:00 AM", checkOut: "2:00 PM", status: "Active" },
        { id: 2, guest: "Jane Smith", listing: "Beachfront Villa", checkIn: "3:00 PM", checkOut: "11:00 AM", status: "Check-in" },
        { id: 3, guest: "Mike Johnson", listing: "Urban Loft", checkIn: "Completed", checkOut: "11:00 AM", status: "Check-out" },
        { id: 4, guest: "Alex Thompson", listing: "Lakeside Cottage", checkIn: "4:00 PM", checkOut: "11:00 AM", status: "Pending" },
        { id: 5, guest: "Sarah Lee", listing: "Downtown Apartment", checkIn: "5:00 PM", checkOut: "11:00 AM", status: "Pending" },
    ]);

    // Upcoming bookings with state management
    const [upcomingBookings, setUpcomingBookings] = useState([
        { id: 1, guest: "Sarah Wilson", listing: "Mountain Retreat", date: "2024-01-15", time: "2:00 PM", status: "Confirmed" },
        { id: 2, guest: "David Brown", listing: "City Center Apartment", date: "2024-01-16", time: "3:00 PM", status: "Pending" },
        { id: 3, guest: "Emily Davis", listing: "Luxury Penthouse", date: "2024-01-17", time: "12:00 PM", status: "Confirmed" },
        { id: 4, guest: "Robert Taylor", listing: "Beach House", date: "2024-01-18", time: "4:00 PM", status: "Confirmed" },
        { id: 5, guest: "Lisa Anderson", listing: "Cottage by Lake", date: "2024-01-20", time: "1:00 PM", status: "Pending" },
        { id: 6, guest: "Michael Chen", listing: "Modern Studio", date: "2024-01-22", time: "3:00 PM", status: "Pending" },
    ]);

    // Handle approve booking
    const handleApproveBooking = (bookingId, isToday = false) => {
        if (isToday) {
            setTodayBookings(prev => 
                prev.map(booking => 
                    booking.id === bookingId 
                        ? { ...booking, status: "Confirmed" }
                        : booking
                )
            );
        } else {
            setUpcomingBookings(prev => 
                prev.map(booking => 
                    booking.id === bookingId 
                        ? { ...booking, status: "Confirmed" }
                        : booking
                )
            );
        }
    };

    // Handle cancel booking
    const handleCancelBooking = (bookingId, isToday = false) => {
        if (window.confirm("Are you sure you want to cancel this reservation?")) {
            if (isToday) {
                setTodayBookings(prev => prev.filter(booking => booking.id !== bookingId));
            } else {
                setUpcomingBookings(prev => prev.filter(booking => booking.id !== bookingId));
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("today")}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                        activeTab === "today"
                            ? "border-blue-600 text-blue-600 font-semibold"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                    <FaCalendarAlt />
                    <span>Today</span>
                </button>
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                        activeTab === "upcoming"
                            ? "border-blue-600 text-blue-600 font-semibold"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                    <FaClock />
                    <span>Upcoming</span>
                </button>
            </div>

            {/* Today's Bookings */}
            {activeTab === "today" && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Reservations</h2>
                    {todayBookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FaCalendarAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                            <p>No reservations for today</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todayBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{booking.guest}</h3>
                                            <p className="text-sm text-gray-600">{booking.listing}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            booking.status === "Active"
                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                : booking.status === "Check-in"
                                                ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                : booking.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
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
                                    {booking.status === "Pending" && (
                                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => handleApproveBooking(booking.id, true)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
                                            >
                                                <FaCheck />
                                                <span>Approve</span>
                                            </button>
                                            <button
                                                onClick={() => handleCancelBooking(booking.id, true)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md"
                                            >
                                                <FaBan />
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Upcoming Bookings */}
            {activeTab === "upcoming" && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Reservations</h2>
                    {upcomingBookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FaClock className="text-4xl mx-auto mb-2 text-gray-300" />
                            <p>No upcoming reservations</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Guest</th>
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Listing</th>
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Time</th>
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Actions</th>
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
                                            <td className="py-3 px-4">
                                                {booking.status === "Pending" ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApproveBooking(booking.id, false)}
                                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-1 shadow-md"
                                                            title="Approve"
                                                        >
                                                            <FaCheck className="text-xs" />
                                                            <span>Approve</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelBooking(booking.id, false)}
                                                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-1 shadow-md"
                                                            title="Cancel"
                                                        >
                                                            <FaBan className="text-xs" />
                                                            <span>Cancel</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Bookings;

