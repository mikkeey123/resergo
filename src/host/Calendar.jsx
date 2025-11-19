import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import { auth, getHostBookings } from "../../Config";

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Fetch bookings on component mount
    useEffect(() => {
        const fetchBookings = async () => {
            if (!auth.currentUser) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                const hostBookings = await getHostBookings(auth.currentUser.uid);
                setBookings(hostBookings);
            } catch (error) {
                console.error("Error fetching bookings for calendar:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const formatDateKey = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    // Convert bookings to date-keyed object
    const bookingsByDate = {};
    bookings.forEach(booking => {
        if (booking.status === "canceled") return;
        
        let bookingDate = null;
        
        // Handle different booking types
        if (booking.checkIn) {
            // Home bookings use checkIn
            bookingDate = booking.checkIn.toDate ? booking.checkIn.toDate() : new Date(booking.checkIn);
        } else if (booking.bookingDate) {
            // Experience/Service bookings use bookingDate
            bookingDate = booking.bookingDate.toDate ? booking.bookingDate.toDate() : new Date(booking.bookingDate);
        }
        
        if (bookingDate) {
            const dateKey = formatDateKey(
                bookingDate.getFullYear(),
                bookingDate.getMonth(),
                bookingDate.getDate()
            );
            
            // If multiple bookings on same date, combine them
            if (!bookingsByDate[dateKey]) {
                bookingsByDate[dateKey] = [];
            }
            
            // Build booking info with time if available
            let bookingInfo = {
                guest: booking.guestName || "Guest",
                listing: booking.listingTitle || "Listing",
                status: booking.status === "active" ? "confirmed" : "pending"
            };
            
            // Add time for Experience/Service bookings
            if (booking.bookingTime) {
                bookingInfo.time = booking.bookingTime;
            }
            
            bookingsByDate[dateKey].push(bookingInfo);
        }
    });

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDateBooking = (day) => {
        if (!day) return null;
        const dateKey = formatDateKey(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        );
        const dateBookings = bookingsByDate[dateKey];
        if (dateBookings && dateBookings.length > 0) {
            // Return first booking or combined info if multiple
            return dateBookings.length === 1 
                ? dateBookings[0]
                : { guest: `${dateBookings.length} bookings`, listing: "", status: "confirmed" };
        }
        return null;
    };

    const handleDateClick = (day) => {
        if (!day) return;
        const dateKey = formatDateKey(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        );
        setSelectedDate(dateKey);
    };

    const days = getDaysInMonth(currentDate);
    const selectedBookings = selectedDate ? bookingsByDate[selectedDate] || [] : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={previousMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
                    >
                        <FaChevronLeft />
                    </button>
                    <h3 className="text-xl font-semibold text-gray-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
                    >
                        <FaChevronRight />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {/* Day headers */}
                    {dayNames.map((day) => (
                        <div
                            key={day}
                            className="text-center font-semibold text-gray-600 py-2 text-sm"
                        >
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    {days.map((day, index) => {
                        const booking = getDateBooking(day);
                        const dateKey = day
                            ? formatDateKey(
                                  currentDate.getFullYear(),
                                  currentDate.getMonth(),
                                  day
                              )
                            : null;
                        const isSelected = selectedDate === dateKey;

                        return (
                            <div
                                key={index}
                                onClick={() => handleDateClick(day)}
                                className={`
                                    aspect-square p-2 border rounded-lg cursor-pointer transition-all duration-200
                                    ${!day ? "bg-transparent border-transparent cursor-default" : ""}
                                    ${isSelected 
                                        ? "bg-blue-600 border-blue-600 text-white shadow-md" 
                                        : "bg-white border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300"}
                                    ${booking && !isSelected ? "bg-blue-50 border-blue-200" : ""}
                                `}
                            >
                                {day && (
                                    <>
                                        <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                            {day}
                                        </div>
                                        {booking && (
                                            <div
                                                className={`w-2 h-2 rounded-full mt-1 ${
                                                    booking.status === "confirmed"
                                                        ? "bg-green-500"
                                                        : "bg-yellow-500"
                                                }`}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Booking Details */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Booking Details
                    </h3>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">Loading bookings...</p>
                        </div>
                    ) : selectedBookings.length > 0 ? (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Date</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    }) : ""}
                                </p>
                            </div>
                            {selectedBookings.map((booking, index) => (
                                <div key={index} className="border-t border-gray-200 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Guest</p>
                                        <p className="font-semibold text-gray-900">
                                            {booking.guest}
                                        </p>
                                    </div>
                                    {booking.listing && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600 mb-1">Listing</p>
                                            <p className="font-semibold text-gray-900">
                                                {booking.listing}
                                            </p>
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            booking.status === "confirmed"
                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                        }`}>
                                            {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FaCalendarAlt className="text-4xl mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Select a date to view booking details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
