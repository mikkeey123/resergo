import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to handle map center updates
const MapCenter = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] !== 0 && center[1] !== 0) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

// Draggable Marker Component
const DraggableMarker = ({ position, onPositionChange }) => {
    const [markerPosition, setMarkerPosition] = useState(position);

    useEffect(() => {
        setMarkerPosition(position);
    }, [position]);

    const markerRef = useRef(null);
    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                setMarkerPosition([lat, lng]);
                onPositionChange(lat, lng);
            }
        },
    };

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={markerPosition}
            ref={markerRef}
        />
    );
};

const LocationMap = ({ latitude, longitude, onLocationChange, city, address }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]); // Default to Manila, Philippines
    const [markerPosition, setMarkerPosition] = useState([14.5995, 120.9842]);
    const searchInputRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    // Initialize map center from props
    useEffect(() => {
        if (latitude && longitude && parseFloat(latitude) !== 0 && parseFloat(longitude) !== 0) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            setMapCenter([lat, lng]);
            setMarkerPosition([lat, lng]);
        }
    }, [latitude, longitude]);

    // Search for location using Nominatim (OpenStreetMap geocoding)
    const handleSearch = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setSearchResults([]);
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'ReserGo/1.0', // Required by Nominatim
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                setSearchResults(data);
            } else {
                setSearchResults([]);
                console.log("No results found for:", searchQuery);
            }
        } catch (error) {
            console.error("Error searching location:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search result selection
    const handleSelectResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setMapCenter([lat, lng]);
        setMarkerPosition([lat, lng]);
        setSearchQuery(result.display_name);
        setSearchResults([]);
        
        // Extract city and address from result
        const addressData = result.address || {};
        const extractedCity = addressData.city || 
                             addressData.town || 
                             addressData.municipality || 
                             addressData.county || 
                             addressData.state_district || 
                             "";
        
        // Build address from components or use display_name
        let extractedAddress = "";
        if (addressData.road || addressData.house_number || addressData.house_name) {
            const addressParts = [];
            if (addressData.house_number) addressParts.push(addressData.house_number);
            if (addressData.house_name) addressParts.push(addressData.house_name);
            if (addressData.road) addressParts.push(addressData.road);
            extractedAddress = addressParts.join(" ");
        } else {
            // Fallback to display_name, but try to remove city part
            const parts = result.display_name.split(",");
            extractedAddress = parts.slice(0, Math.max(1, parts.length - 2)).join(",").trim();
        }
        
        // Update parent component
        onLocationChange({
            latitude: lat,
            longitude: lng,
            city: extractedCity || (result.display_name.split(",").slice(-2, -1)[0]?.trim() || ""),
            address: extractedAddress || result.display_name
        });
    };

    // Handle map click to set marker
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        setMapCenter([lat, lng]);
        
        // Reverse geocode to get address
        fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'ReserGo/1.0',
                    'Accept': 'application/json'
                }
            }
        )
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const addressData = data.address || {};
                const extractedCity = addressData.city || 
                                     addressData.town || 
                                     addressData.municipality || 
                                     addressData.county || 
                                     addressData.state_district || 
                                     "";
                
                // Build address from components
                let extractedAddress = "";
                if (addressData.road || addressData.house_number || addressData.house_name) {
                    const addressParts = [];
                    if (addressData.house_number) addressParts.push(addressData.house_number);
                    if (addressData.house_name) addressParts.push(addressData.house_name);
                    if (addressData.road) addressParts.push(addressData.road);
                    extractedAddress = addressParts.join(" ");
                } else {
                    // Fallback to display_name
                    extractedAddress = data.display_name || "";
                }
                
                onLocationChange({
                    latitude: lat,
                    longitude: lng,
                    city: extractedCity,
                    address: extractedAddress
                });
            })
            .catch(error => {
                console.error("Error reverse geocoding:", error);
                onLocationChange({
                    latitude: lat,
                    longitude: lng,
                    city: city || "",
                    address: address || ""
                });
            });
    };

    // Map click handler component
    const MapClickHandler = ({ onMapClick }) => {
        useMapEvents({
            click: onMapClick,
        });
        return null;
    };

    // Handle Enter key in search
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch(e);
        }
    };
    
    // Handle form submission
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSearch(e);
    };
    
    // Update dropdown position when search results change
    useEffect(() => {
        if (searchResults.length > 0 && searchInputRef.current) {
            const updatePosition = () => {
                if (searchInputRef.current) {
                    const rect = searchInputRef.current.getBoundingClientRect();
                    setDropdownPosition({
                        top: rect.bottom,
                        left: rect.left,
                        width: rect.width
                    });
                }
            };
            
            updatePosition();
            // Update on scroll and resize
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [searchResults.length]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (searchResults.length > 0 && 
                !target.closest('.location-search-container') && 
                !target.closest('.location-search-dropdown')) {
                setSearchResults([]);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [searchResults.length]);

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative location-search-container" style={{ position: 'relative', zIndex: 1, isolation: 'isolate' }}>
                <form onSubmit={handleFormSubmit} className="flex gap-2" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex-1 relative" style={{ position: 'relative', zIndex: 1, isolation: 'isolate' }}>
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" style={{ zIndex: 2 }} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Search for a location (e.g., Manila, Philippines)"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                            style={{ position: 'relative', zIndex: 1 }}
                        />
                    </div>
                    <button
                        type="submit"
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                        style={{ position: 'relative', zIndex: 1 }}
                    >
                        {isSearching ? "Searching..." : "Search"}
                    </button>
                </form>

                {/* Search Results Dropdown - Rendered as Portal */}
                {searchResults.length > 0 && typeof document !== 'undefined' && createPortal(
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
                        {searchResults.map((result, index) => (
                            <button
                                key={`${result.place_id || index}-${result.lat}-${result.lon}`}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSelectResult(result);
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

            {/* Map */}
            <div className="border border-gray-300 rounded-lg overflow-hidden relative" style={{ height: "300px", minHeight: "300px" }}>
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCenter center={mapCenter} zoom={13} />
                    <MapClickHandler onMapClick={handleMapClick} />
                    <DraggableMarker 
                        position={markerPosition} 
                        onPositionChange={(lat, lng) => {
                            setMarkerPosition([lat, lng]);
                            setMapCenter([lat, lng]);
                            
                            // Reverse geocode
                            fetch(
                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                                {
                                    headers: {
                                        'User-Agent': 'ReserGo/1.0',
                                        'Accept': 'application/json'
                                    }
                                }
                            )
                                .then(res => {
                                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                                    return res.json();
                                })
                                .then(data => {
                                    const addressData = data.address || {};
                                    const extractedCity = addressData.city || 
                                                         addressData.town || 
                                                         addressData.municipality || 
                                                         addressData.county || 
                                                         addressData.state_district || 
                                                         "";
                                    
                                    // Build address from components
                                    let extractedAddress = "";
                                    if (addressData.road || addressData.house_number || addressData.house_name) {
                                        const addressParts = [];
                                        if (addressData.house_number) addressParts.push(addressData.house_number);
                                        if (addressData.house_name) addressParts.push(addressData.house_name);
                                        if (addressData.road) addressParts.push(addressData.road);
                                        extractedAddress = addressParts.join(" ");
                                    } else {
                                        // Fallback to display_name
                                        extractedAddress = data.display_name || "";
                                    }
                                    
                                    onLocationChange({
                                        latitude: lat,
                                        longitude: lng,
                                        city: extractedCity,
                                        address: extractedAddress
                                    });
                                })
                                .catch(error => {
                                    console.error("Error reverse geocoding:", error);
                                    onLocationChange({
                                        latitude: lat,
                                        longitude: lng,
                                        city: city || "",
                                        address: address || ""
                                    });
                                });
                        }}
                    />
                </MapContainer>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> You can either search for a location using the search bar above, or click directly on the map to set the location. You can also drag the marker to adjust the position.
                </p>
            </div>
        </div>
    );
};

export default LocationMap;

