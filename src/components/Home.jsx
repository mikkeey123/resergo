import React, { useState, useCallback, useRef, useEffect } from "react";
import { FaImage, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { getPublishedListings, auth, getFavorites, addFavorite, removeFavorite } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";

const Home = ({ onListingClick = null }) => {
    // Debug: Log if onListingClick is provided
    console.log("Home component - onListingClick provided:", !!onListingClick, typeof onListingClick, onListingClick);
    
    // State to track favorites
    const [favorites, setFavorites] = useState(new Set());
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // Load user favorites from Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                try {
                    const favoriteIds = await getFavorites(user.uid);
                    setFavorites(new Set(favoriteIds));
                } catch (error) {
                    console.error("Error loading favorites:", error);
                }
            } else {
                setUserId(null);
                setFavorites(new Set());
            }
        });
        return () => unsubscribe();
    }, []);

    // Toggle favorite status
    const toggleFavorite = async (listingId) => {
        if (!userId) {
            console.warn("User must be logged in to favorite listings");
            return;
        }

        try {
            const isCurrentlyFavorite = favorites.has(listingId);
            
            if (isCurrentlyFavorite) {
                // Remove from favorites
                await removeFavorite(userId, listingId);
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    newFavorites.delete(listingId);
                    return newFavorites;
                });
            } else {
                // Add to favorites
                await addFavorite(userId, listingId);
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    newFavorites.add(listingId);
                    return newFavorites;
                });
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    // Fetch published Home listings
    useEffect(() => {
        const fetchHomes = async () => {
            try {
                setLoading(true);
                const publishedListings = await getPublishedListings("Home");
                
                // Transform Firestore listings to component format
                const transformedHomes = publishedListings.map(listing => {
                    // Get first image, ensure it's a valid Base64 data URL
                    let imageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                    
                    if (listing.images && listing.images.length > 0) {
                        const firstImage = listing.images[0];
                        // Ensure it's a valid data URL (starts with data:)
                        if (typeof firstImage === 'string' && firstImage.trim().length > 0) {
                            if (firstImage.startsWith('data:')) {
                                imageUrl = firstImage;
                            } else {
                                console.warn('Listing image is not a valid data URL:', listing.id, firstImage.substring(0, 50));
                                imageUrl = firstImage; // Try anyway
                            }
                        }
                    }
                    
                    return {
                        id: listing.id,
                        title: listing.title || "Untitled Listing",
                        price: listing.rate || 0,
                        rating: listing.rating || null, // Use actual rating from Firestore
                        image: imageUrl,
                        photos: listing.images || [],
                        location: listing.location?.city || listing.location?.address || "Location not specified",
                        description: listing.description || "",
                        currency: "₱",
                        reviewsCount: listing.reviewsCount || 0, // Use actual reviews count from Firestore
                        basics: listing.basics || { guests: 1, bedrooms: 1, beds: 1, bathrooms: 1 },
                        amenities: listing.amenities || [],
                        category: listing.category || "Home",
                        // Include full listing data for detail view
                        fullListing: listing
                    };
                });
                
                setHomes(transformedHomes);
            } catch (error) {
                console.error("Error fetching homes:", error);
                setHomes([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchHomes();
    }, []);

    // Airbnb-style listing card component
    const ListingCard = ({ listing, itemId, isFavorited, onToggleFavorite, onListingClick }) => {
        console.log("ListingCard rendered - onListingClick:", !!onListingClick, typeof onListingClick, "listing:", listing.title);
        
        const heartButtonRef = useRef(null);
        
        // Use the onListingClick from props directly in the handler instead of capturing it in useCallback
        const handleCardClick = (e) => {
            console.log("Card clicked:", listing.title, e.target, "onListingClick:", onListingClick);
            // Check if the click target is the button or inside the button
            if (heartButtonRef.current && heartButtonRef.current.contains(e.target)) {
                console.log("Click was on heart button, ignoring");
                return;
            }
            
            // Double check with closest
            if (e.target.closest('button[data-heart-button]')) {
                console.log("Click was on heart button (closest), ignoring");
                return;
            }
            
            console.log("Calling onListingClick with listing:", listing);
            if (onListingClick && typeof onListingClick === 'function') {
                onListingClick(listing);
            } else {
                console.warn("onListingClick is not defined or not a function!", onListingClick);
            }
        };

        const handleHeartClick = useCallback((e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.nativeEvent) {
                e.nativeEvent.stopImmediatePropagation();
            }
            onToggleFavorite(itemId);
        }, [itemId, onToggleFavorite]);

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
                <div className="relative rounded-xl overflow-hidden mb-2 sm:mb-3 aspect-square bg-gray-200">
                    <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            console.error('Image failed to load:', listing.id, listing.title, listing.image?.substring(0, 50));
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                            }
                        }}
                        onLoad={() => {
                            console.log('Image loaded successfully:', listing.id, listing.title);
                        }}
                    />
                    {/* Fallback if image fails */}
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center hidden">
                        <FaImage className="text-4xl text-gray-400" />
                    </div>
                    
                    {/* Heart Icon - Favorite */}
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
                            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                        >
                            {isFavorited ? (
                                <FaHeart className="text-sm text-red-500 pointer-events-none" />
                            ) : (
                                <FaRegHeart className="text-sm text-gray-700 pointer-events-none" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Card Content - Format: Title on first line, Price • Rating on second line */}
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
        <div className="mb-16">
            {/* Suggestions & Recommendations - Hidden for now, will be implemented with algorithm-based recommendations */}
            {/* <h2 className="text-3xl font-bold text-gray-900 mb-8">Suggestions & Recommendations</h2>
            
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Loading homes...</p>
                </div>
            ) : homes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">No homes available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                    {homes.map((home) => {
                        return (
                            <ListingCard
                                key={home.id}
                                listing={home}
                                itemId={home.id}
                                isFavorited={favorites.has(home.id)}
                                onToggleFavorite={toggleFavorite}
                                onListingClick={onListingClick || (() => console.warn("onListingClick not provided to ListingCard"))}
                            />
                        );
                    })}
                </div>
            )} */}
        </div>
    );
};

export default Home;
