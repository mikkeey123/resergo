import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaImage, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { auth, getFavoriteListings, removeFavorite } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";
import ListingDetail from "./ListingDetail";

const Favorites = ({ onBack }) => {
    const [favoriteListings, setFavoriteListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [selectedListing, setSelectedListing] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Load user favorites
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                try {
                    setLoading(true);
                    const favorites = await getFavoriteListings(user.uid);
                    setFavoriteListings(favorites);
                } catch (error) {
                    console.error("Error loading favorites:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setUserId(null);
                setFavoriteListings([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Handler for when a listing is clicked
    const handleListingClick = useCallback((listing) => {
        setSelectedListing(listing);
    }, []);

    // Handler for when back is clicked
    const handleBack = useCallback(() => {
        setSelectedListing(null);
        // Reload favorites when returning from detail view
        if (userId) {
            getFavoriteListings(userId).then(favorites => {
                setFavoriteListings(favorites);
            });
        }
    }, [userId]);

    // Toggle favorite status (remove from favorites)
    const handleRemoveFavorite = async (listingId, e) => {
        e.stopPropagation();
        if (!userId) return;

        try {
            await removeFavorite(userId, listingId);
            // Remove from local state
            setFavoriteListings(prev => prev.filter(listing => listing.id !== listingId));
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    // If a listing is selected, show the detail view
    if (selectedListing) {
        return (
            <ListingDetail 
                listing={selectedListing} 
                onBack={handleBack} 
            />
        );
    }

    // Transform listings to component format
    const transformedListings = favoriteListings.map(listing => ({
        id: listing.id,
        title: listing.title || "Untitled Listing",
        price: listing.rate || 0,
        rating: listing.rating || null,
        image: listing.images && listing.images.length > 0 ? listing.images[0] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E",
        photos: listing.images || [],
        location: listing.location?.city || listing.location?.address || "Location not specified",
        description: listing.description || "",
        currency: "₱",
        reviewsCount: listing.reviewsCount || 0,
        category: listing.category || "Home", // Include category
        fullListing: listing
    }));

    // Filter listings by category
    const filteredListings = selectedCategory === "All" 
        ? transformedListings 
        : transformedListings.filter(listing => listing.category === selectedCategory);

    // Reusable listing card component
    const ListingCard = ({ listing, onListingClick, onRemoveFavorite }) => {
        const heartButtonRef = useRef(null);
        
        const handleCardClick = useCallback((e) => {
            if (heartButtonRef.current && heartButtonRef.current.contains(e.target)) {
                return;
            }
            if (e.target.closest('button[data-heart-button]')) {
                return;
            }
            if (onListingClick) {
                onListingClick(listing);
            }
        }, [listing, onListingClick]);

        const handleHeartClick = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.nativeEvent) {
                e.nativeEvent.stopImmediatePropagation();
            }
            onRemoveFavorite(listing.id, e);
        }, [listing.id, onRemoveFavorite]);

        const handleHeartMouseDown = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
        }, []);
        
        return (
            <div
                className="cursor-pointer group"
                onClick={handleCardClick}
            >
                {/* Image */}
                <div className="relative rounded-xl overflow-hidden mb-2 sm:mb-3 aspect-square">
                    <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                            }
                        }}
                    />
                    {/* Fallback if image fails */}
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center hidden">
                        <FaImage className="text-4xl text-gray-400" />
                    </div>
                    
                    {/* Heart Icon - Favorite (always filled since it's in favorites) */}
                    <div 
                        ref={heartButtonRef}
                        className="absolute top-3 right-3 z-20"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    >
                        <button
                            type="button"
                            data-heart-button="true"
                            onClick={handleHeartClick}
                            onMouseDown={handleHeartMouseDown}
                            onTouchStart={handleHeartMouseDown}
                            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition duration-200"
                            aria-label="Remove from favorites"
                        >
                            <FaHeart className="text-sm text-red-500 pointer-events-none" />
                        </button>
                    </div>
                </div>

                {/* Card Content */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-900 flex-wrap">
                        <span>₱{listing.price.toLocaleString()}</span>
                        {listing.rating !== null && listing.rating > 0 && (
                            <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-xs text-black" />
                                    <span>{listing.rating.toFixed(1)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white py-4 sm:py-8 px-3 sm:px-8 md:px-12 lg:px-16 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-lg mb-6"
                        >
                            Back
                        </button>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Your Favorites
                        </h2>
                        {/* Category Filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-700">Filter by:</span>
                            <div className="flex gap-2">
                                {["All", "Home", "Experience", "Service"].map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedCategory === category
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Loading favorites...</p>
                    </div>
                ) : !userId ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Please log in to view your favorites.</p>
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-12">
                        <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-2">
                            {selectedCategory === "All" 
                                ? "No favorites yet" 
                                : `No ${selectedCategory} favorites yet`}
                        </p>
                        <p className="text-gray-500">
                            {selectedCategory === "All"
                                ? "Start exploring and add listings to your favorites!"
                                : `Try selecting a different category or add some ${selectedCategory} listings to your favorites!`}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-gray-600">
                            Showing {filteredListings.length} {filteredListings.length === 1 ? 'favorite' : 'favorites'}
                            {selectedCategory !== "All" && ` in ${selectedCategory}`}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6">
                            {filteredListings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    onListingClick={handleListingClick}
                                    onRemoveFavorite={handleRemoveFavorite}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Favorites;

