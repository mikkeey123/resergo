import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaSearch, FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";

const SearchFilter = ({ isOpen, onClose, onSearch, initialFilters = {} }) => {
    const [location, setLocation] = useState(initialFilters.location || "");
    const [checkIn, setCheckIn] = useState(initialFilters.checkIn || "");
    const [checkOut, setCheckOut] = useState(initialFilters.checkOut || "");
    const [guests, setGuests] = useState(initialFilters.guests || 1);
    const [locationSearchQuery, setLocationSearchQuery] = useState(initialFilters.location || "");
    const [locationResults, setLocationResults] = useState([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const locationInputRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({
            location: location.trim(),
            checkIn,
            checkOut,
            guests: parseInt(guests) || 1
        });
        onClose();
    };

    // Update location search query when location changes
    useEffect(() => {
        setLocationSearchQuery(location);
    }, [location]);

    // Update form when initialFilters change
    useEffect(() => {
        if (isOpen) {
            setLocation(initialFilters.location || "");
            setCheckIn(initialFilters.checkIn || "");
            setCheckOut(initialFilters.checkOut || "");
            setGuests(initialFilters.guests || 1);
            setLocationSearchQuery(initialFilters.location || "");
        }
    }, [isOpen, initialFilters]);

    // Search for location using Nominatim (OpenStreetMap geocoding)
    useEffect(() => {
        if (!locationSearchQuery.trim() || locationSearchQuery.length < 2) {
            setLocationResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearchingLocation(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearchQuery)}&limit=5&addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': 'ReserGo/1.0',
                            'Accept': 'application/json'
                        }
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (Array.isArray(data) && data.length > 0) {
                    setLocationResults(data);
                } else {
                    setLocationResults([]);
                }
            } catch (error) {
                console.error("Error searching location:", error);
                setLocationResults([]);
            } finally {
                setIsSearchingLocation(false);
            }
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timeoutId);
    }, [locationSearchQuery]);

    // Update dropdown position when location results change
    useEffect(() => {
        if (locationResults.length > 0 && locationInputRef.current) {
            const updatePosition = () => {
                if (locationInputRef.current) {
                    const rect = locationInputRef.current.getBoundingClientRect();
                    setDropdownPosition({
                        top: rect.bottom,
                        left: rect.left,
                        width: rect.width
                    });
                }
            };
            
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [locationResults.length]);

    // Close location results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (locationResults.length > 0 && 
                !target.closest('.location-search-container') && 
                !target.closest('.location-search-dropdown')) {
                setLocationResults([]);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [locationResults.length]);

    // Handle location result selection
    const handleSelectLocation = (result) => {
        const addressData = result.address || {};
        const extractedCity = addressData.city || 
                             addressData.town || 
                             addressData.municipality || 
                             addressData.county || 
                             addressData.state_district || 
                             "";
        
        // Use display_name as location string
        const locationString = result.display_name || locationSearchQuery;
        setLocation(locationString);
        setLocationSearchQuery(locationString);
        setLocationResults([]);
    };

    const handleReset = () => {
        setLocation("");
        setLocationSearchQuery("");
        setCheckIn("");
        setCheckOut("");
        setGuests(1);
        setLocationResults([]);
        onSearch({
            location: "",
            checkIn: "",
            checkOut: "",
            guests: 1
        });
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Search Filters</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSearch} className="p-6 space-y-5">
                    {/* Location */}
                    <div className="location-search-container" style={{ position: 'relative', zIndex: 1 }}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaMapMarkerAlt className="inline mr-2 text-blue-600" />
                            Where
                        </label>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                ref={locationInputRef}
                                type="text"
                                value={locationSearchQuery}
                                onChange={(e) => setLocationSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
                                placeholder="Search destinations (city, address)"
                            />
                            {isSearchingLocation && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                        </div>

                        {/* Location Results Dropdown - Rendered as Portal */}
                        {locationResults.length > 0 && typeof document !== 'undefined' && createPortal(
                            <div 
                                className="location-search-dropdown bg-white border border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
                                style={{
                                    position: 'fixed',
                                    top: `${dropdownPosition.top}px`,
                                    left: `${dropdownPosition.left}px`,
                                    width: `${dropdownPosition.width}px`,
                                    zIndex: 99999,
                                    marginTop: '8px'
                                }}
                            >
                                {locationResults.map((result, index) => (
                                    <button
                                        key={`${result.place_id || index}-${result.lat}-${result.lon}`}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSelectLocation(result);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 transition cursor-pointer"
                                    >
                                        <div className="flex items-start gap-2">
                                            <FaMapMarkerAlt className="text-blue-600 mt-1 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm break-words">{result.display_name}</p>
                                                {result.type && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{result.type}</p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>,
                            document.body
                        )}
                    </div>

                    {/* Check In */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaCalendarAlt className="inline mr-2 text-blue-600" />
                            Check In
                        </label>
                        <input
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Check Out */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaCalendarAlt className="inline mr-2 text-blue-600" />
                            Check Out
                        </label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Guests */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaUsers className="inline mr-2 text-blue-600" />
                            Guests
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setGuests(Math.max(1, guests - 1))}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={guests}
                                onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                                min="1"
                                className="w-20 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                            />
                            <button
                                type="button"
                                onClick={() => setGuests(guests + 1)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                +
                            </button>
                            <span className="text-sm text-gray-600">guests</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
                        >
                            <FaSearch />
                            <span>Search</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SearchFilter;

