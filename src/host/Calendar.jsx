import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Sample bookings data
    const bookings = {
        "2024-01-15": { guest: "John Doe", listing: "Cozy Cabin", status: "confirmed" },
        "2024-01-20": { guest: "Jane Smith", listing: "Beach Villa", status: "pending" },
        "2024-01-25": { guest: "Mike Johnson", listing: "Urban Loft", status: "confirmed" },
    };

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

    const formatDateKey = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };

    const getDateBooking = (day) => {
        if (!day) return null;
        const dateKey = formatDateKey(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        );
        return bookings[dateKey] || null;
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
    const selectedBooking = selectedDate ? bookings[selectedDate] : null;

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
                    {selectedBooking ? (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Date</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(selectedDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Guest</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedBooking.guest}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Listing</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedBooking.listing}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedBooking.status === "confirmed"
                                        ? "bg-green-100 text-green-700 border border-green-300"
                                        : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                }`}>
                                    {selectedBooking.status}
                                </span>
                            </div>
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
