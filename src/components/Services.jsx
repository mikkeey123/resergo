import React, { useState, useCallback, useRef, useEffect } from "react";
import { FaImage, FaHeart, FaRegHeart, FaStar, FaUser } from "react-icons/fa";
import { getPublishedListings, auth, getFavorites, addFavorite, removeFavorite, getUserData } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";

const Services = ({ onListingClick }) => {
    // State to track favorites
    const [favorites, setFavorites] = useState(new Set());
    const [services, setServices] = useState([]);
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

    // Fetch published Service listings
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const publishedListings = await getPublishedListings("Service");
                
                // Transform Firestore listings to component format with host data
                const transformedServices = await Promise.all(
                    publishedListings.map(async (listing) => {
                    // Get first image, ensure it's a valid Base64 data URL
                    let imageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                    
                    if (listing.images && listing.images.length > 0) {
                        const firstImage = listing.images[0];
                        if (typeof firstImage === 'string' && firstImage.trim().length > 0) {
                            if (firstImage.startsWith('data:')) {
                                imageUrl = firstImage;
                            } else {
                                console.warn('Listing image is not a valid data URL:', listing.id, firstImage.substring(0, 50));
                                imageUrl = firstImage; // Try anyway
                            }
                        }
                    }
                    
                        // Calculate discount and discounted price
                        const originalPrice = listing.rate || 0;
                        const discountPercent = listing.discount || 0;
                        const discountedPrice = discountPercent > 0 ? originalPrice * (1 - discountPercent / 100) : originalPrice;
                        
                        // Fetch host data
                        let hostName = "Unknown Host";
                        let hostAvatar = null;
                        if (listing.hostId) {
                            try {
                                const hostData = await getUserData(listing.hostId);
                                hostName = hostData?.Username || hostData?.displayName || "Unknown Host";
                                hostAvatar = hostData?.ProfilePicture || hostData?.photoURL || null;
                            } catch (err) {
                                console.error(`Error fetching host data for listing ${listing.id}:`, err);
                            }
                        }
                        
                        return {
                            id: listing.id,
                            title: listing.title || "Untitled Service",
                            price: originalPrice,
                            discountedPrice: discountedPrice,
                            discount: discountPercent,
                            rating: listing.rating || null, // Use actual rating from Firestore
                            image: imageUrl,
                            photos: listing.images || [],
                            location: listing.location?.city || listing.location?.address || "Location not specified",
                            description: listing.description || "",
                            currency: "₱",
                            reviewsCount: listing.reviewsCount || 0, // Use actual reviews count from Firestore
                            basics: listing.basics || { guests: 1, bedrooms: 1, beds: 1, bathrooms: 1 },
                            amenities: listing.amenities || [],
                            category: listing.category || "Service",
                            hostName: hostName,
                            hostAvatar: hostAvatar,
                            // Include full listing data for detail view
                            fullListing: listing
                        };
                    })
                );
                
                setServices(transformedServices);
            } catch (error) {
                console.error("Error fetching services:", error);
                setServices([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchServices();
    }, []);

    const staticServices = [
        { 
            id: 1, 
            title: "Premium Cleaning Service", 
            price: 2500, 
            rating: 4.89, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Cleaning+Service",
            location: "Metro Manila, Philippines",
            description: "Professional cleaning service for your accommodation",
            currency: "₱",
            reviewsCount: 312,
            photos: [
                "https://via.placeholder.com/800x600?text=Cleaning+Service+1",
                "https://via.placeholder.com/400x300?text=Cleaning+Service+2",
                "https://via.placeholder.com/400x300?text=Cleaning+Service+3"
            ]
        },
        { 
            id: 2, 
            title: "Concierge Assistance", 
            price: 3200, 
            rating: 4.91, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Concierge",
            location: "Makati, Philippines",
            description: "24/7 concierge services for all your needs",
            currency: "₱",
            reviewsCount: 245,
            photos: [
                "https://via.placeholder.com/800x600?text=Concierge+1",
                "https://via.placeholder.com/400x300?text=Concierge+2",
                "https://via.placeholder.com/400x300?text=Concierge+3"
            ]
        },
        { 
            id: 3, 
            title: "24/7 Support Package", 
            price: 2800, 
            rating: 4.87, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Support",
            location: "Nationwide, Philippines",
            description: "Round-the-clock customer support and assistance",
            currency: "₱",
            reviewsCount: 189,
            photos: [
                "https://via.placeholder.com/800x600?text=Support+1",
                "https://via.placeholder.com/400x300?text=Support+2",
                "https://via.placeholder.com/400x300?text=Support+3"
            ]
        },
        { 
            id: 4, 
            title: "Travel Planning Service", 
            price: 3500, 
            rating: 4.93, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Travel+Planning",
            location: "Manila, Philippines",
            description: "Custom travel itineraries and planning assistance",
            currency: "₱",
            reviewsCount: 267,
            photos: [
                "https://via.placeholder.com/800x600?text=Travel+Planning+1",
                "https://via.placeholder.com/400x300?text=Travel+Planning+2",
                "https://via.placeholder.com/400x300?text=Travel+Planning+3"
            ]
        },
        { 
            id: 5, 
            title: "Event Management", 
            price: 5000, 
            rating: 4.88, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Event+Management",
            location: "Metro Manila, Philippines",
            description: "Complete event planning and management services",
            currency: "₱",
            reviewsCount: 134,
            photos: [
                "https://via.placeholder.com/800x600?text=Event+Management+1",
                "https://via.placeholder.com/400x300?text=Event+Management+2",
                "https://via.placeholder.com/400x300?text=Event+Management+3"
            ]
        },
        { 
            id: 6, 
            title: "Personal Chef Service", 
            price: 4200, 
            rating: 4.92, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Chef+Service",
            location: "Makati, Philippines",
            description: "Private chef services for personalized dining experiences",
            currency: "₱",
            reviewsCount: 201,
            photos: [
                "https://via.placeholder.com/800x600?text=Chef+Service+1",
                "https://via.placeholder.com/400x300?text=Chef+Service+2",
                "https://via.placeholder.com/400x300?text=Chef+Service+3"
            ]
        },
    ];

    // Airbnb-style listing card component
    const ListingCard = ({ listing, itemId, isFavorited, onToggleFavorite, onListingClick }) => {
        const heartButtonRef = useRef(null);
        
        const handleCardClick = useCallback((e) => {
            console.log("Service card clicked:", listing.title, e.target);
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
            if (onListingClick) {
                onListingClick(listing);
            } else {
                console.warn("onListingClick is not defined in Services!");
            }
        }, [listing, onListingClick]);

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
                <div className="relative rounded-xl overflow-hidden mb-2 sm:mb-3 aspect-[4/3] sm:aspect-square bg-gray-200">
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
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20"
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
                            className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:shadow-lg transition duration-200"
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
                    {/* Host Information */}
                    {listing.hostName && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                            <FaUser className="text-xs" />
                            <div className="flex items-center gap-1.5">
                                {listing.hostAvatar ? (
                                    <img 
                                        src={listing.hostAvatar} 
                                        alt={listing.hostName}
                                        className="w-4 h-4 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                                        <FaUser className="text-gray-500 text-xs" />
                                    </div>
                                )}
                                <span className="line-clamp-1">{listing.hostName}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-900 flex-wrap">
                        {listing.discount > 0 && listing.discountedPrice ? (
                            <>
                                <span className="line-through text-gray-400">₱{listing.price.toLocaleString()}</span>
                                <span className="text-red-600 font-semibold">₱{listing.discountedPrice.toLocaleString()}</span>
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">
                                    -{listing.discount}%
                                </span>
                            </>
                        ) : (
                            <span>₱{listing.price.toLocaleString()}</span>
                        )}
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
                    <p className="text-gray-600">Loading services...</p>
                </div>
            ) : services.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">No services available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                    {services.map((service) => {
                        const itemId = `service-${service.id}`;
                        return (
                            <ListingCard
                                key={service.id}
                                listing={service}
                                itemId={itemId}
                                isFavorited={favorites.has(itemId)}
                                onToggleFavorite={toggleFavorite}
                                onListingClick={onListingClick}
                            />
                        );
                    })}
                </div>
            )} */}
        </div>
    );
};

export default Services;
