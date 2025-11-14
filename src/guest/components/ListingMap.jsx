import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";
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

/**
 * Read-only map component for displaying listing location
 * @param {number} latitude - Latitude of the listing
 * @param {number} longitude - Longitude of the listing
 * @param {string} address - Address of the listing (for display)
 */
const ListingMap = ({ latitude, longitude, address }) => {
    const lat = parseFloat(latitude) || 0;
    const lng = parseFloat(longitude) || 0;
    const center = [lat, lng];
    const zoom = lat !== 0 && lng !== 0 ? 15 : 2;

    // Custom marker icon with blue color to match theme
    const customIcon = new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    if (lat === 0 && lng === 0) {
        return (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                <div className="text-center text-gray-500">
                    <FaMapMarkerAlt className="text-4xl mx-auto mb-2" />
                    <p className="text-sm">Location not available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                scrollWheelZoom={true}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center} icon={customIcon}>
                </Marker>
                <MapCenter center={center} zoom={zoom} />
            </MapContainer>
        </div>
    );
};

export default ListingMap;

