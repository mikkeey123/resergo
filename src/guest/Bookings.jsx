import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimes, FaBan, FaChevronDown, FaChevronUp, FaMoneyBillWave, FaTag, FaUser, FaHome, FaArrowLeft } from "react-icons/fa";
import { auth, getGuestBookings, requestCancelBooking } from "../../Config";

const Bookings = ({ onBack }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [expandedBookings, setExpandedBookings] = useState(new Set());
    const [statusFilter, setStatusFilter] = useState("All"); // All, Pending, Approved, Rejected
    const [typeFilter, setTypeFilter] = useState("All"); // All, Reservation, Cancellation

    // Fetch bookings on component mount
    useEffect(() => {
        const fetchBookings = async () => {
            if (!auth.currentUser) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError("");
            try {
                const guestBookings = await getGuestBookings(auth.currentUser.uid);
                setBookings(guestBookings);
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError("Failed to load bookings. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Filter bookings by status and type
    const getFilteredBookings = () => {
        let filtered = [...bookings];

        // Filter by status first
        if (statusFilter === "Pending") {
            filtered = filtered.filter(booking => booking.status === "pending");
        } else if (statusFilter === "Approved") {
            filtered = filtered.filter(booking => booking.status === "active");
        } else if (statusFilter === "Rejected") {
            // Rejected includes canceled bookings (rejected by host) and cancel_requested (pending cancellation approval)
            filtered = filtered.filter(booking => 
                booking.status === "canceled" || booking.status === "cancel_requested"
            );
        }
        // "All" shows all statuses

        // Then filter by type
        if (typeFilter === "Reservation") {
            // Reservations are active bookings (pending or approved, not canceled)
            filtered = filtered.filter(booking => 
                booking.status === "pending" || booking.status === "active"
            );
        } else if (typeFilter === "Cancellation") {
            // Cancellations are bookings that are canceled or have cancel requested
            filtered = filtered.filter(booking => 
                booking.status === "canceled" || booking.status === "cancel_requested"
            );
        }
        // "All" shows all types

        return filtered;
    };

    const filteredBookings = getFilteredBookings();

    // Handle cancel booking request
    const handleCancelBooking = async (bookingId) => {
        if (!auth.currentUser) return;
        
        if (!window.confirm("Are you sure you want to cancel this booking? The host will need to approve the cancellation.")) {
            return;
        }

        setProcessingId(bookingId);
        setError("");
        setSuccess("");
        try {
            await requestCancelBooking(bookingId, auth.currentUser.uid);
            
            setSuccess("Cancellation request submitted! Waiting for host approval.");
            
            // Refresh bookings
            const guestBookings = await getGuestBookings(auth.currentUser.uid);
            setBookings(guestBookings);
            
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error("Error requesting cancellation:", err);
            setError(err.message || "Failed to request cancellation. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate();
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const formatFullDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
    };

    const toggleBookingDetails = (bookingId) => {
        const newExpanded = new Set(expandedBookings);
        if (newExpanded.has(bookingId)) {
            newExpanded.delete(bookingId);
        } else {
            newExpanded.add(bookingId);
        }
        setExpandedBookings(newExpanded);
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen py-8 px-4 sm:px-8 md:px-12 lg:px-16">
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-600">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-8 px-4 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Back to Listings</span>
                    </button>
                )}

                {/* Page Title */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-gray-600 mt-1">View and manage your bookings</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        {/* Status Filter */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</label>
                            <div className="flex gap-2 flex-wrap">
                                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            statusFilter === status
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Type:</label>
                            <div className="flex gap-2 flex-wrap">
                                {["All", "Reservation", "Cancellation"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            typeFilter === type
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results Count */}
                        {filteredBookings.length > 0 && (
                            <div className="ml-auto text-sm text-gray-600">
                                <span className="font-medium">{filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}</span>
                            </div>
                        )}
                    </div>
                </div>
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-600">{success}</p>
                </div>
            )}

            {/* Filtered Bookings */}
            {filteredBookings.length > 0 ? (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        {statusFilter === "All" && typeFilter === "All" 
                            ? "All Bookings" 
                            : `${statusFilter !== "All" ? statusFilter : ""} ${typeFilter !== "All" ? typeFilter : ""} Bookings`.trim()}
                    </h2>
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => {
                            // Determine status badge
                            const getStatusBadge = () => {
                                if (booking.status === "active") {
                                    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">Approved</span>;
                                } else if (booking.status === "pending") {
                                    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">Pending</span>;
                                } else if (booking.status === "cancel_requested") {
                                    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">Cancel Requested</span>;
                                } else if (booking.status === "canceled") {
                                    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-300">Rejected/Canceled</span>;
                                }
                                return null;
                            };

                            return (
                            <div
                                key={booking.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{booking.listingTitle || "Listing"}</h3>
                                        <p className="text-sm text-gray-600">{booking.hostName || "Host"}</p>
                                        <p className="text-xs text-gray-500 mt-1">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                                    </div>
                                    {getStatusBadge()}
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
                                
                                {/* Booking Details Toggle */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => toggleBookingDetails(booking.id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
                                    >
                                        {expandedBookings.has(booking.id) ? (
                                            <>
                                                <FaChevronUp />
                                                <span>Hide Details</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaChevronDown />
                                                <span>View Details</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Expanded Booking Details */}
                                {expandedBookings.has(booking.id) && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-start gap-2">
                                                <FaHome className="text-blue-600 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-500">Listing</p>
                                                    <p className="font-medium text-gray-900">{booking.listingTitle || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <FaUser className="text-green-600 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-500">Host</p>
                                                    <p className="font-medium text-gray-900">{booking.hostName || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <FaCalendarAlt className="text-purple-600 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-500">Booking Date</p>
                                                    <p className="font-medium text-gray-900">{booking.createdAt ? formatFullDate(booking.createdAt) : "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <FaMoneyBillWave className="text-yellow-600 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-gray-500">Payment Status</p>
                                                    <p className={`font-medium ${booking.paymentStatus === 'paid' ? 'text-green-600' : booking.paymentStatus === 'refunded' ? 'text-blue-600' : 'text-yellow-600'}`}>
                                                        {booking.paymentStatus ? booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1) : "Pending"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Pricing Details */}
                                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Pricing Breakdown</p>
                                            {booking.basePrice && booking.basePrice !== booking.totalAmount && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Base Price:</span>
                                                    <span className="text-gray-900">₱{booking.basePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            {booking.couponCode && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 flex items-center gap-1">
                                                        <FaTag className="text-red-500" />
                                                        Discount ({booking.couponCode}):
                                                    </span>
                                                    <span className="text-red-600">-₱{booking.discountAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                                                <span className="text-gray-900">Total Amount:</span>
                                                <span className="text-gray-900">₱{booking.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p><span className="font-medium">Booking ID:</span> {booking.id}</p>
                                            {booking.listingId && (
                                                <p><span className="font-medium">Listing ID:</span> {booking.listingId}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Cancel Button - Only show for active bookings (pending or approved) */}
                                {(booking.status === "pending" || booking.status === "active") && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleCancelBooking(booking.id)}
                                            disabled={processingId === booking.id}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaBan />
                                            <span>{processingId === booking.id ? "Processing..." : "Request Cancellation"}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 text-center py-12">
                    <FaCalendarAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">
                        {bookings.length === 0 
                            ? "No bookings found" 
                            : `No bookings match the selected filters`}
                    </p>
                </div>
            )}
            </div>
        </div>
    );
};

export default Bookings;

