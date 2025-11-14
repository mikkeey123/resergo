import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaCheck, FaBan } from "react-icons/fa";
import { auth, getHostBookings, updateBookingStatus, approveCancelBooking } from "../../Config";

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] = useState(null);

    // Fetch bookings on component mount
    useEffect(() => {
        const fetchBookings = async () => {
            if (!auth.currentUser) return;
            
            setLoading(true);
            setError("");
            try {
                const hostBookings = await getHostBookings(auth.currentUser.uid);
                setBookings(hostBookings);
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError("Failed to load bookings. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Filter bookings - only show pending and cancel_requested bookings
    const pendingBookings = bookings.filter(booking => {
        return booking.status === "pending" || booking.status === "cancel_requested";
    });

    // Handle approve booking
    const handleApproveBooking = async (bookingId) => {
        if (!auth.currentUser) return;
        
        if (!window.confirm("Are you sure you want to approve this booking? Payment will be deducted from the guest's wallet.")) {
            return;
        }

        setProcessingId(bookingId);
        setError("");
        try {
            await updateBookingStatus(bookingId, "active", auth.currentUser.uid);
            
            // Refresh bookings
            const hostBookings = await getHostBookings(auth.currentUser.uid);
            setBookings(hostBookings);
        } catch (err) {
            console.error("Error approving booking:", err);
            setError(err.message || "Failed to approve booking. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    // Handle approve cancellation
    const handleApproveCancel = async (bookingId) => {
        if (!auth.currentUser) return;
        
        if (!window.confirm("Are you sure you want to approve this cancellation request? Payment will be refunded to the guest if already paid.")) {
            return;
        }

        setProcessingId(bookingId);
        setError("");
        try {
            await approveCancelBooking(bookingId, auth.currentUser.uid);
            
            // Refresh bookings
            const hostBookings = await getHostBookings(auth.currentUser.uid);
            setBookings(hostBookings);
        } catch (err) {
            console.error("Error approving cancellation:", err);
            setError(err.message || "Failed to approve cancellation. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    // Handle cancel booking
    const handleCancelBooking = async (bookingId) => {
        if (!auth.currentUser) return;
        
        if (!window.confirm("Are you sure you want to cancel this reservation?")) {
            return;
        }

        setProcessingId(bookingId);
        setError("");
        try {
            await updateBookingStatus(bookingId, "canceled", auth.currentUser.uid);
            
            // Refresh bookings
            const hostBookings = await getHostBookings(auth.currentUser.uid);
            setBookings(hostBookings);
        } catch (err) {
            console.error("Error canceling booking:", err);
            setError(err.message || "Failed to cancel booking. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-600">Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
            
            {/* Pending Bookings */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Bookings</h2>
                {pendingBookings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FaCalendarAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                        <p>No pending bookings</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{booking.guestName || "Guest"}</h3>
                                        <p className="text-sm text-gray-600">{booking.listingTitle || "Listing"}</p>
                                        <p className="text-xs text-gray-500 mt-1">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        booking.status === "cancel_requested"
                                            ? "bg-orange-100 text-orange-700 border border-orange-300"
                                            : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                    }`}>
                                        {booking.status === "cancel_requested" ? "Cancel Requested" : "Pending"}
                                    </span>
                                </div>
                                <div className="flex gap-6 text-sm text-gray-600 mt-3">
                                    <div className="flex items-center gap-2">
                                        <FaCheckCircle className="text-blue-600" />
                                        <span>Check-in: <span className="font-medium text-gray-900">{formatDate(booking.checkIn)}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaClock className="text-gray-500" />
                                        <span>Check-out: <span className="font-medium text-gray-900">{formatDate(booking.checkOut)}</span></span>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    <span className="font-medium">Total: </span>
                                    <span className="text-gray-900">₱{booking.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {booking.status === "pending" && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleApproveBooking(booking.id)}
                                            disabled={processingId === booking.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaCheck />
                                            <span>{processingId === booking.id ? "Processing..." : "Approve"}</span>
                                        </button>
                                        <button
                                            onClick={() => handleCancelBooking(booking.id)}
                                            disabled={processingId === booking.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaBan />
                                            <span>{processingId === booking.id ? "Processing..." : "Cancel"}</span>
                                        </button>
                                    </div>
                                )}
                                {booking.status === "cancel_requested" && (
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleApproveCancel(booking.id)}
                                            disabled={processingId === booking.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaCheck />
                                            <span>{processingId === booking.id ? "Processing..." : "Approve Cancellation"}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookings;


