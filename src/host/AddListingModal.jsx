import React, { useState, useEffect } from "react";
import { auth, saveListing, updateListing } from "../../Config";
import { FaPlus, FaTrash, FaSave, FaTimes, FaCamera, FaImages, FaWifi, FaTv, FaUtensils, FaTshirt, FaCar, FaDollarSign, FaSnowflake, FaLaptop, FaClock, FaUsers, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import LocationMap from "./components/LocationMap";
import AlertPopup from "../components/AlertPopup";
import { compressImages } from "../utils/imageCompression";

const AddListingModal = ({ isOpen, onClose, onSuccess, editingListing = null }) => {
    const [category, setCategory] = useState("Home");
    const [title, setTitle] = useState("");
    const [rate, setRate] = useState("");
    const [discount, setDiscount] = useState(""); // Discount percentage
    const [images, setImages] = useState([]); // Store image URLs
    const [imageUrl, setImageUrl] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef(null);
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [description, setDescription] = useState("");
    
    // Home-specific fields
    const [guests, setGuests] = useState(1);
    const [bedrooms, setBedrooms] = useState(1);
    const [beds, setBeds] = useState(1);
    const [bathrooms, setBathrooms] = useState(1);
    const [amenities, setAmenities] = useState([]);
    
    // Experience-specific fields
    const [duration, setDuration] = useState(""); // Duration in hours
    const [groupSize, setGroupSize] = useState(1); // Max participants
    const [whatsIncluded, setWhatsIncluded] = useState(""); // What's included in the experience
    const [meetingPoint, setMeetingPoint] = useState(""); // Meeting point address
    const [requirements, setRequirements] = useState(""); // Requirements for guests
    
    // Service-specific fields
    const [serviceType, setServiceType] = useState(""); // Type of service (e.g., "Cleaning", "Photography", "Catering")
    const [serviceDuration, setServiceDuration] = useState(""); // Duration of service
    const [serviceIncludes, setServiceIncludes] = useState(""); // What's included
    const [serviceRequirements, setServiceRequirements] = useState(""); // Requirements
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // Basic amenities
    const basicAmenities = [
        { id: "wifi", label: "Wifi", icon: FaWifi },
        { id: "tv", label: "TV", icon: FaTv },
        { id: "kitchen", label: "Kitchen", icon: FaUtensils },
        { id: "washer", label: "Washer", icon: FaTshirt },
        { id: "free_parking", label: "Free parking on premises", icon: FaCar },
        { id: "paid_parking", label: "Paid parking on premises", icon: FaDollarSign },
        { id: "air_conditioning", label: "Air conditioning", icon: FaSnowflake },
        { id: "dedicated_workspace", label: "Dedicated workspace", icon: FaLaptop },
    ];
    
    const toggleAmenity = (amenityId) => {
        if (amenities.includes(amenityId)) {
            setAmenities(amenities.filter(id => id !== amenityId));
        } else {
            setAmenities([...amenities, amenityId]);
        }
    };
    
    // Auto-dismiss alerts after 2 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError("");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);
    
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess("");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    // Populate form when editing
    useEffect(() => {
        if (editingListing && isOpen) {
            setCategory(editingListing.category || "Home");
            setTitle(editingListing.title || "");
            setRate(editingListing.rate?.toString() || "");
            setDiscount(editingListing.discount?.toString() || "");
            setImages(editingListing.images || []);
            setCity(editingListing.location?.city || "");
            setAddress(editingListing.location?.address || "");
            setLatitude(editingListing.location?.latitude?.toString() || "");
            setLongitude(editingListing.location?.longitude?.toString() || "");
            setDescription(editingListing.description || "");
            
            // Home-specific fields
            setGuests(editingListing.basics?.guests || 1);
            setBedrooms(editingListing.basics?.bedrooms || 1);
            setBeds(editingListing.basics?.beds || 1);
            setBathrooms(editingListing.basics?.bathrooms || 1);
            setAmenities(editingListing.amenities || []);
            
            // Experience-specific fields
            setDuration(editingListing.duration?.toString() || "");
            setGroupSize(editingListing.groupSize || 1);
            setWhatsIncluded(editingListing.whatsIncluded || "");
            setMeetingPoint(editingListing.meetingPoint || "");
            setRequirements(editingListing.requirements || "");
            
            // Service-specific fields
            setServiceType(editingListing.serviceType || "");
            setServiceDuration(editingListing.serviceDuration?.toString() || "");
            setServiceIncludes(editingListing.serviceIncludes || "");
            setServiceRequirements(editingListing.serviceRequirements || "");
        } else if (!editingListing && isOpen) {
            // Reset form when opening for new listing
            setCategory("Home");
            setTitle("");
            setRate("");
            setDiscount("");
            setImages([]);
            setCity("");
            setAddress("");
            setLatitude("");
            setLongitude("");
            setDescription("");
            setGuests(1);
            setBedrooms(1);
            setBeds(1);
            setBathrooms(1);
            setAmenities([]);
            setDuration("");
            setGroupSize(1);
            setWhatsIncluded("");
            setMeetingPoint("");
            setRequirements("");
            setServiceType("");
            setServiceDuration("");
            setServiceIncludes("");
            setServiceRequirements("");
            setError("");
            setSuccess("");
        }
    }, [editingListing, isOpen]);

    if (!isOpen) return null;


    // Handle file selection
    const handleFileSelect = async (files) => {
        const fileArray = Array.from(files);
        const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            setError("Please select valid image files");
            return;
        }
        
        // Limit to 5 images max to stay under Firestore's 1MB limit
        const MAX_IMAGES = 5;
        const remainingSlots = MAX_IMAGES - images.length;
        
        if (remainingSlots <= 0) {
            setError(`You can only add up to ${MAX_IMAGES} images per listing to stay within size limits.`);
            return;
        }
        
        const filesToProcess = imageFiles.slice(0, remainingSlots);
        if (imageFiles.length > remainingSlots) {
            setError(`You can only add ${remainingSlots} more image(s). Only the first ${remainingSlots} will be processed.`);
        }
        
        try {
            setLoading(true);
            
            // Aggressively compress images: 600x600px, 50% quality to keep under 1MB limit
            const compressedDataUrls = await compressImages(filesToProcess, 600, 600, 0.5);
            
            // Check total size before adding
            const currentSize = images.reduce((sum, img) => sum + (img?.length || 0), 0);
            const newSize = compressedDataUrls.reduce((sum, img) => sum + (img?.length || 0), 0);
            const totalSize = currentSize + newSize;
            
            // Firestore limit is ~1MB (1,048,576 bytes), leave some buffer
            const MAX_SIZE = 900000; // ~900KB to leave buffer
            
            if (totalSize > MAX_SIZE) {
                setError(`Adding these images would exceed the size limit. Please remove some images or use fewer images. Current size: ${(currentSize / 1024).toFixed(0)}KB, Adding: ${(newSize / 1024).toFixed(0)}KB`);
                setLoading(false);
                return;
            }
            
            // Store compressed data URLs (these will be saved to Firestore and persist)
            setImages(prevImages => [...prevImages, ...compressedDataUrls]);
            setError(""); // Clear any previous errors
        } catch (error) {
            console.error("Error processing images:", error);
            setError("Failed to process images. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await handleFileSelect(files);
        }
    };

    // Handle file input change
    const handleFileInputChange = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await handleFileSelect(files);
        }
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

    // Set cover photo (first image)
    const setCoverPhoto = (index) => {
        const newImages = [...images];
        const [coverImage] = newImages.splice(index, 1);
        setImages([coverImage, ...newImages]);
    };


    // Reset form
    const resetForm = () => {
        setCategory("Home");
        setTitle("");
        setRate("");
        setDiscount("");
        setImages([]);
        setCity("");
        setAddress("");
        setLatitude("");
        setLongitude("");
        setDescription("");
        setGuests(1);
        setBedrooms(1);
        setBeds(1);
        setBathrooms(1);
        setAmenities([]);
        setDuration("");
        setGroupSize(1);
        setWhatsIncluded("");
        setMeetingPoint("");
        setRequirements("");
        setServiceType("");
        setServiceDuration("");
        setServiceIncludes("");
        setServiceRequirements("");
        setError("");
        setSuccess("");
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
                title, // Title is now required for all categories
                rate: parseFloat(rate) || 0,
                discount: discount ? parseFloat(discount) : 0, // Discount percentage (0-100)
                images,
                location: {
                    city,
                    address,
                    latitude: parseFloat(latitude) || 0,
                    longitude: parseFloat(longitude) || 0
                },
                description,
                availability: {}
            };

            // Category-specific fields
            if (category === "Home") {
                listingData.basics = {
                    guests,
                    bedrooms,
                    beds,
                    bathrooms
                };
                listingData.amenities = amenities;
            } else if (category === "Experience") {
                listingData.duration = parseFloat(duration) || 0;
                listingData.groupSize = groupSize;
                listingData.whatsIncluded = whatsIncluded;
                listingData.meetingPoint = meetingPoint;
                listingData.requirements = requirements;
            } else if (category === "Service") {
                listingData.serviceType = serviceType;
                listingData.serviceDuration = serviceDuration;
                listingData.serviceIncludes = serviceIncludes;
                listingData.serviceRequirements = serviceRequirements;
            }

            if (editingListing) {
                // Update existing listing
                await updateListing(editingListing.id, { ...listingData, isDraft: true });
                setSuccess("Listing updated as draft successfully!");
            } else {
                // Create new listing
                await saveListing(user.uid, listingData, true);
                setSuccess("Listing saved as draft successfully!");
            }
            
            setTimeout(() => {
                resetForm();
                onSuccess && onSuccess();
                onClose();
            }, 1500);
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
        
        // Category-specific validation
        if (category === "Experience") {
            if (!duration || parseFloat(duration) <= 0) {
                setError("Duration is required and must be greater than 0");
                setLoading(false);
                return;
            }
            if (groupSize < 1) {
                setError("Group size must be at least 1");
                setLoading(false);
                return;
            }
        } else if (category === "Service") {
            if (!serviceType.trim()) {
                setError("Service type is required");
                setLoading(false);
                return;
            }
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
        if (!images || images.length !== 5) {
            setError("Exactly 5 images are required to publish a listing");
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
                title, // Title is now required for all categories
                rate: parseFloat(rate) || 0,
                discount: discount ? parseFloat(discount) : 0, // Discount percentage (0-100)
                images,
                location: {
                    city,
                    address,
                    latitude: parseFloat(latitude) || 0,
                    longitude: parseFloat(longitude) || 0
                },
                description,
                availability: {}
            };

            // Category-specific fields
            if (category === "Home") {
                listingData.basics = {
                    guests,
                    bedrooms,
                    beds,
                    bathrooms
                };
                listingData.amenities = amenities;
            } else if (category === "Experience") {
                listingData.duration = parseFloat(duration) || 0;
                listingData.groupSize = groupSize;
                listingData.whatsIncluded = whatsIncluded;
                listingData.meetingPoint = meetingPoint;
                listingData.requirements = requirements;
            } else if (category === "Service") {
                listingData.serviceType = serviceType;
                listingData.serviceDuration = serviceDuration;
                listingData.serviceIncludes = serviceIncludes;
                listingData.serviceRequirements = serviceRequirements;
            }

            if (editingListing) {
                // Update existing listing
                await updateListing(editingListing.id, { ...listingData, isDraft: false });
                setSuccess("Listing updated successfully!");
            } else {
                // Create new listing
                await saveListing(user.uid, listingData, false);
                setSuccess("Listing published successfully!");
            }
            
            setTimeout(() => {
                resetForm();
                onSuccess && onSuccess();
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Error publishing listing:", error);
            setError(error.message || "Failed to publish listing");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{ zIndex: 50 }}>
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] border border-gray-200 relative flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ zIndex: 51 }}
            >
                {/* Modal Header - Fixed, not scrollable */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {editingListing ? "Edit Listing" : "Add New Listing"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Modal Content - Scrollable area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                    {/* Alerts as Popups - Auto-dismiss after 2 seconds */}
                    <AlertPopup
                        type={error ? "error" : "success"}
                        title={error ? "Error Message" : "Success Message"}
                        message={error || success}
                        isOpen={!!(error || success)}
                        dismissible={false}
                    />

                    <form onSubmit={handlePublish} className="space-y-6">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <div className="flex gap-4">
                                {["Home", "Experience", "Service"].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`px-4 py-2 rounded-lg border-2 transition ${
                                            category === cat
                                                ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                                                : "border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Images Section */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {category === "Home" ? "Add some photos of your house" : category === "Experience" ? "Add some photos of your experience" : "Add some photos of your service"}
                            </h3>
                            <p className="text-gray-600 mb-2">Add photos to showcase your listing. <span className="font-semibold text-red-600">Exactly 5 images are required</span> to publish a listing.</p>
                            <p className="text-sm text-blue-600 mb-6 font-medium">
                                {images.length > 0 
                                    ? `${images.length}/5 images added. ${images.length < 5 ? `You need to add ${5 - images.length} more image(s) to publish.` : 'All 5 images added. Ready to publish!'} Images are automatically compressed to reduce size.`
                                    : 'You need to add 5 images. You can select up to 5 images at once from your device. Images will be automatically compressed to 600x600px at 50% quality.'}
                            </p>
                            
                            {/* Upload Area */}
                            {images.length === 0 ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                                        isDragging 
                                            ? "border-blue-600 bg-blue-50" 
                                            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <FaCamera className="text-6xl text-gray-400" />
                                        <div>
                                            <button
                                                type="button"
                                                className="px-6 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition font-medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                Add photos
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Select up to 5 images at once</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Cover Photo */}
                                    {images.length > 0 && (
                                        <div>
                                            <div className="relative group">
                                                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                                                    Cover Photo
                                                </div>
                                                <img
                                                    src={images[0]}
                                                    alt="Cover"
                                                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(0)}
                                                    className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition opacity-0 group-hover:opacity-100"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Grid */}
                                    {images.length > 1 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-3">Drag to reorder</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {images.slice(1).map((image, index) => (
                                                    <div key={index + 1} className="relative group">
                                                        <img
                                                            src={image}
                                                            alt={`Photo ${index + 2}`}
                                                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index + 1)}
                                                            className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black/90 transition opacity-0 group-hover:opacity-100"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCoverPhoto(index + 1)}
                                                            className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-black/90 transition opacity-0 group-hover:opacity-100"
                                                        >
                                                            Set as cover
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Add More Button */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                            isDragging 
                                                ? "border-blue-600 bg-blue-50" 
                                                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <FaImages className="text-3xl text-gray-400" />
                                            <p className="text-gray-700 font-medium">Drag and drop</p>
                                            <p className="text-sm text-gray-500">or browse for photos</p>
                                            <button
                                                type="button"
                                                className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                Browse
                                            </button>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileInputChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Title - Required for all categories */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                placeholder={
                                    category === "Home" ? "e.g., Cozy Cabin Retreat" :
                                    category === "Experience" ? "e.g., Sunset Photography Tour" :
                                    "e.g., Professional Cleaning Service"
                                }
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
                                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                placeholder="e.g., 150"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        {/* Discount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount (%)
                            </label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                placeholder="e.g., 10"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                            <p className="text-xs text-gray-500 mt-1">Optional: Enter discount percentage (0-100)</p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location * (Search or click on map)
                            </label>
                            <LocationMap
                                latitude={latitude}
                                longitude={longitude}
                                city={city}
                                address={address}
                                onLocationChange={(location) => {
                                    setLatitude(location.latitude.toString());
                                    setLongitude(location.longitude.toString());
                                    if (location.city) setCity(location.city);
                                    if (location.address) setAddress(location.address);
                                }}
                            />
                        </div>

                        {/* Location Details */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Location Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            placeholder="e.g., Manila"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            placeholder="e.g., 123 Main Street"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="text-sm font-semibold text-blue-700 mb-3">Coordinates (Auto-filled)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-blue-600 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            type="number"
                                            value={latitude}
                                            readOnly
                                            className="w-full px-4 py-2 bg-white border border-blue-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 cursor-not-allowed"
                                            placeholder="Auto-filled from map"
                                            step="any"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-blue-600 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            type="number"
                                            value={longitude}
                                            readOnly
                                            className="w-full px-4 py-2 bg-white border border-blue-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 cursor-not-allowed"
                                            placeholder="Auto-filled from map"
                                            step="any"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                    These coordinates are automatically updated when you select a location on the map.
                                </p>
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
                                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                rows="4"
                                placeholder={
                                    category === "Home" ? "Describe your place..." :
                                    category === "Experience" ? "Describe your experience..." :
                                    "Describe your service..."
                                }
                                required
                            />
                        </div>

                        {/* Experience-specific fields */}
                        {category === "Experience" && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FaClock className="text-blue-600" />
                                        Experience Details
                                    </h3>
                                    
                                    {/* Duration */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duration (hours) *
                                        </label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            placeholder="e.g., 3"
                                            min="0.5"
                                            step="0.5"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">How long does the experience last?</p>
                                    </div>

                                    {/* Group Size */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FaUsers className="text-blue-600" />
                                            Maximum Group Size *
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                                                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition"
                                            >
                                                <span className="text-gray-600">−</span>
                                            </button>
                                            <span className="text-lg font-medium text-gray-900 w-12 text-center">{groupSize}</span>
                                            <button
                                                type="button"
                                                onClick={() => setGroupSize(groupSize + 1)}
                                                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition"
                                            >
                                                <span className="text-gray-600">+</span>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Maximum number of participants</p>
                                    </div>

                                    {/* What's Included */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FaCheckCircle className="text-green-600" />
                                            What's Included
                                        </label>
                                        <textarea
                                            value={whatsIncluded}
                                            onChange={(e) => setWhatsIncluded(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            rows="3"
                                            placeholder="e.g., Professional guide, Equipment, Snacks, Transportation"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">List what guests will receive or experience</p>
                                    </div>

                                    {/* Meeting Point */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-red-600" />
                                            Meeting Point
                                        </label>
                                        <input
                                            type="text"
                                            value={meetingPoint}
                                            onChange={(e) => setMeetingPoint(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            placeholder="e.g., Main entrance of the park, Hotel lobby"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Where should guests meet you?</p>
                                    </div>

                                    {/* Requirements */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FaExclamationTriangle className="text-yellow-600" />
                                            Requirements
                                        </label>
                                        <textarea
                                            value={requirements}
                                            onChange={(e) => setRequirements(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            rows="3"
                                            placeholder="e.g., Comfortable walking shoes, Age 18+, Physical fitness required"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Any special requirements or restrictions?</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Service-specific fields */}
                        {category === "Service" && (
                            <div className="space-y-6">
                                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FaCheckCircle className="text-purple-600" />
                                        Service Details
                                    </h3>
                                    
                                    {/* Service Type */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Type *
                                        </label>
                                        <input
                                            type="text"
                                            value={serviceType}
                                            onChange={(e) => setServiceType(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            placeholder="e.g., Cleaning, Photography, Catering, Tutoring"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">What type of service are you offering?</p>
                                    </div>

                                    {/* Service Duration */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FaClock className="text-purple-600" />
                                            Service Duration
                                        </label>
                                        <input
                                            type="text"
                                            value={serviceDuration}
                                            onChange={(e) => setServiceDuration(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            placeholder="e.g., 2 hours, Full day, Per session"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">How long does the service take?</p>
                                    </div>

                                    {/* What's Included */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FaCheckCircle className="text-green-600" />
                                            What's Included
                                        </label>
                                        <textarea
                                            value={serviceIncludes}
                                            onChange={(e) => setServiceIncludes(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            rows="3"
                                            placeholder="e.g., All cleaning supplies, Professional equipment, Insurance coverage"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">What does your service include?</p>
                                    </div>

                                    {/* Requirements */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FaExclamationTriangle className="text-yellow-600" />
                                            Requirements
                                        </label>
                                        <textarea
                                            value={serviceRequirements}
                                            onChange={(e) => setServiceRequirements(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                            rows="3"
                                            placeholder="e.g., Access to workspace, Advance booking required, Specific materials needed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Any requirements from the client?</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Basics - Only for Home category */}
                        {category === "Home" && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Share some basics about your place</h3>
                                <p className="text-sm text-gray-600 mb-4">You'll add more details later, like bed types.</p>
                                
                                <div className="space-y-4">
                                    {/* Guests */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div>
                                            <label className="text-base font-medium text-gray-900">Guests</label>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setGuests(Math.max(1, guests - 1))}
                                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-gray-600">−</span>
                                            </button>
                                            <span className="text-lg font-medium text-gray-900 w-8 text-center">{guests}</span>
                                            <button
                                                type="button"
                                                onClick={() => setGuests(guests + 1)}
                                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition"
                                            >
                                                <span className="text-gray-600">+</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bedrooms */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div>
                                            <label className="text-base font-medium text-gray-900">Bedrooms</label>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-gray-600">−</span>
                                            </button>
                                            <span className="text-lg font-medium text-gray-900 w-8 text-center">{bedrooms}</span>
                                            <button
                                                type="button"
                                                onClick={() => setBedrooms(bedrooms + 1)}
                                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition"
                                            >
                                                <span className="text-gray-600">+</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Beds */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div>
                                            <label className="text-base font-medium text-gray-900">Beds</label>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setBeds(Math.max(1, beds - 1))}
                                                disabled={beds <= 1}
                                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-gray-600">−</span>
                                            </button>
                                            <span className="text-lg font-medium text-gray-900 w-8 text-center">{beds}</span>
                                            <button
                                                type="button"
                                                onClick={() => setBeds(beds + 1)}
                                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition"
                                            >
                                                <span className="text-gray-600">+</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bathrooms */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div>
                                            <label className="text-base font-medium text-gray-900">Bathrooms</label>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-gray-600">−</span>
                                            </button>
                                            <span className="text-lg font-medium text-gray-900 w-8 text-center">{bathrooms}</span>
                                            <button
                                                type="button"
                                                onClick={() => setBathrooms(bathrooms + 1)}
                                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition"
                                            >
                                                <span className="text-gray-600">+</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Amenities - Only for Home category */}
                        {category === "Home" && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">What about these guest favorites?</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {basicAmenities.map((amenity) => {
                                        const Icon = amenity.icon;
                                        const isSelected = amenities.includes(amenity.id);
                                        return (
                                            <button
                                                key={amenity.id}
                                                type="button"
                                                onClick={() => toggleAmenity(amenity.id)}
                                                className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                                                    isSelected
                                                        ? "border-blue-600 bg-blue-50"
                                                        : "border-gray-300 bg-white hover:border-gray-400"
                                                }`}
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <Icon className={`text-2xl ${isSelected ? "text-blue-600" : "text-gray-700"}`} />
                                                    <span className={`text-sm text-center ${isSelected ? "text-blue-700 font-medium" : "text-gray-700"}`}>
                                                        {amenity.label}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                            >
                                <FaSave />
                                Save as Draft
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (!editingListing && (!images || images.length !== 5))}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                                title={!editingListing && (!images || images.length !== 5) ? "5 images are required to publish" : ""}
                            >
                                {loading ? (editingListing ? "Updating..." : "Publishing...") : (editingListing ? "Update Listing" : "Publish Listing")}
                            </button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddListingModal;

                            >
                                <FaSave />
                                Save as Draft
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (!editingListing && (!images || images.length !== 5))}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                                title={!editingListing && (!images || images.length !== 5) ? "5 images are required to publish" : ""}
                            >
                                {loading ? (editingListing ? "Updating..." : "Publishing...") : (editingListing ? "Update Listing" : "Publish Listing")}
                            </button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddListingModal;


