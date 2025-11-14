import React, { useState } from "react";
import { auth, saveListing } from "../../Config";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";
import Alert from "../components/Alert";

const AddListing = () => {
    const [category, setCategory] = useState("Home"); // Home, Experience, Service
    const [title, setTitle] = useState("");
    const [rate, setRate] = useState("");
    const [promos, setPromos] = useState([]);
    const [promoInput, setPromoInput] = useState("");
    const [images, setImages] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [description, setDescription] = useState("");
    const [amenities, setAmenities] = useState([]);
    const [amenityInput, setAmenityInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Add promo
    const handleAddPromo = () => {
        if (promoInput.trim() && !promos.includes(promoInput.trim())) {
            setPromos([...promos, promoInput.trim()]);
            setPromoInput("");
        }
    };

    // Remove promo
    const handleRemovePromo = (index) => {
        setPromos(promos.filter((_, i) => i !== index));
    };

    // Add image URL
    const handleAddImage = () => {
        if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
            setImages([...images, imageUrl.trim()]);
            setImageUrl("");
        }
    };

    // Remove image
    const handleRemoveImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Add amenity
    const handleAddAmenity = () => {
        if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
            setAmenities([...amenities, amenityInput.trim()]);
            setAmenityInput("");
        }
    };

    // Remove amenity
    const handleRemoveAmenity = (index) => {
        setAmenities(amenities.filter((_, i) => i !== index));
    };

    // Handle save as draft
    const handleSaveDraft = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("You must be logged in to save a listing");
            }

            const listingData = {
                category,
                title,
                rate: parseFloat(rate) || 0,
                promos,
                images,
                location: {
                    city,
                    address,
                    latitude: parseFloat(latitude) || 0,
                    longitude: parseFloat(longitude) || 0
                },
                description,
                amenities,
                availability: {}
            };

            await saveListing(user.uid, listingData, true);
            setSuccess("Listing saved as draft successfully!");
            
            // Clear form after a delay
            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (error) {
            console.error("Error saving draft:", error);
            setError(error.message || "Failed to save draft");
        } finally {
            setLoading(false);
        }
    };

    // Handle publish listing
    const handlePublish = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Validation
        if (!title.trim()) {
            setError("Title is required");
            setLoading(false);
            return;
        }
        if (!rate || parseFloat(rate) <= 0) {
            setError("Rate must be greater than 0");
            setLoading(false);
            return;
        }
        if (!city.trim() || !address.trim()) {
            setError("City and address are required");
            setLoading(false);
            return;
        }
        if (!description.trim()) {
            setError("Description is required");
            setLoading(false);
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("You must be logged in to publish a listing");
            }

            const listingData = {
                category,
                title,
                rate: parseFloat(rate) || 0,
                promos,
                images,
                location: {
                    city,
                    address,
                    latitude: parseFloat(latitude) || 0,
                    longitude: parseFloat(longitude) || 0
                },
                description,
                amenities,
                availability: {}
            };

            await saveListing(user.uid, listingData, false);
            setSuccess("Listing published successfully!");
            
            // Clear form
            setTimeout(() => {
                setCategory("Home");
                setTitle("");
                setRate("");
                setPromos([]);
                setImages([]);
                setCity("");
                setAddress("");
                setLatitude("");
                setLongitude("");
                setDescription("");
                setAmenities([]);
                setSuccess("");
            }, 2000);
        } catch (error) {
            console.error("Error publishing listing:", error);
            setError(error.message || "Failed to publish listing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white py-8 px-4 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Listing</h1>

                {error && (
                    <div className="mb-6">
                        <Alert
                            type="error"
                            title="Error Message"
                            message={error}
                        />
                    </div>
                )}

                {success && (
                    <div className="mb-6">
                        <Alert
                            type="success"
                            title="Success Message"
                            message={success}
                        />
                    </div>
                )}

                <form onSubmit={handlePublish} className="space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setCategory("Home")}
                                className={`px-4 py-2 rounded-lg border-2 transition ${
                                    category === "Home"
                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                                }`}
                            >
                                Home
                            </button>
                            <button
                                type="button"
                                onClick={() => setCategory("Experience")}
                                className={`px-4 py-2 rounded-lg border-2 transition ${
                                    category === "Experience"
                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                                }`}
                            >
                                Experience
                            </button>
                            <button
                                type="button"
                                onClick={() => setCategory("Service")}
                                className={`px-4 py-2 rounded-lg border-2 transition ${
                                    category === "Service"
                                        ? "border-blue-600 bg-blue-50 text-blue-700"
                                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                                }`}
                            >
                                Service
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Cozy Cabin Retreat"
                            required
                        />
                    </div>

                    {/* Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rate (₱) *
                        </label>
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 150"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    {/* Promos */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Promos
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddPromo();
                                    }
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter promo and press Enter"
                            />
                            <button
                                type="button"
                                onClick={handleAddPromo}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <FaPlus />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {promos.map((promo, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                >
                                    {promo}
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePromo(index)}
                                        className="text-blue-700 hover:text-blue-900"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Images (URLs)
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddImage();
                                    }
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter image URL and press Enter"
                            />
                            <button
                                type="button"
                                onClick={handleAddImage}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <FaPlus />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={image}
                                        alt={`Listing ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Manila"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 123 Main Street"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Latitude
                            </label>
                            <input
                                type="number"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 14.5995"
                                step="any"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Longitude
                            </label>
                            <input
                                type="number"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 120.9842"
                                step="any"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            placeholder="Describe your listing..."
                            required
                        />
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amenities
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={amenityInput}
                                onChange={(e) => setAmenityInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddAmenity();
                                    }
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Wi-Fi, Pool, Parking"
                            />
                            <button
                                type="button"
                                onClick={handleAddAmenity}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <FaPlus />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {amenities.map((amenity, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                    {amenity}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAmenity(index)}
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaSave />
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Publishing..." : "Publish Listing"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddListing;

