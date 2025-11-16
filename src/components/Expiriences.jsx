import React, { useState, useCallback, useRef, useEffect } from "react";
import { FaImage, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { getPublishedListings, auth, getFavorites, addFavorite, removeFavorite } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";

const Expiriences = ({ onListingClick }) => {
    // State to track favorites
    const [favorites, setFavorites] = useState(new Set());
    const [experiences, setExperiences] = useState([]);
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

    // Fetch published Experience listings
    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                setLoading(true);
                const publishedListings = await getPublishedListings("Experience");
                
                // Transform Firestore listings to component format
                const transformedExperiences = publishedListings.map(listing => {
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
                    
                    return {
                        id: listing.id,
                        title: listing.title || "Untitled Experience",
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
                        category: listing.category || "Experience",
                        // Include full listing data for detail view
                        fullListing: listing
                    };
                });
                
                setExperiences(transformedExperiences);
            } catch (error) {
                console.error("Error fetching experiences:", error);
                setExperiences([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchExperiences();
    }, []);

    const staticExperiences = [
        { 
            id: 1, 
            title: "Wine Tasting Tour", 
            price: 3500, 
            rating: 4.88, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Wine+Tasting",
            location: "Manila, Philippines",
            description: "Experience premium wine tasting with expert sommeliers",
            currency: "₱",
            reviewsCount: 127,
            photos: [
                "https://via.placeholder.com/800x600?text=Wine+Tasting+1",
                "https://via.placeholder.com/400x300?text=Wine+Tasting+2",
                "https://via.placeholder.com/400x300?text=Wine+Tasting+3"
            ]
        },
        { 
            id: 2, 
            title: "Cooking Class Experience", 
            price: 4200, 
            rating: 4.92, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Cooking+Class",
            location: "Makati, Philippines",
            description: "Learn to cook authentic Filipino dishes from master chefs",
            currency: "₱",
            reviewsCount: 203,
            photos: [
                "https://via.placeholder.com/800x600?text=Cooking+Class+1",
                "https://via.placeholder.com/400x300?text=Cooking+Class+2",
                "https://via.placeholder.com/400x300?text=Cooking+Class+3"
            ]
        },
        { 
            id: 3, 
            title: "Photography Walk", 
            price: 2800, 
            rating: 4.85, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Photography",
            location: "Baguio, Philippines",
            description: "Capture stunning landscapes with professional photography guidance",
            currency: "₱",
            reviewsCount: 89,
            photos: [
                "https://via.placeholder.com/800x600?text=Photography+1",
                "https://via.placeholder.com/400x300?text=Photography+2",
                "https://via.placeholder.com/400x300?text=Photography+3"
            ]
        },
        { 
            id: 4, 
            title: "Yoga Retreat Session", 
            price: 3200, 
            rating: 4.90, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Yoga+Retreat",
            location: "Tagaytay, Philippines",
            description: "Relax and rejuvenate with guided yoga sessions in a serene setting",
            currency: "₱",
            reviewsCount: 156,
            photos: [
                "https://via.placeholder.com/800x600?text=Yoga+Retreat+1",
                "https://via.placeholder.com/400x300?text=Yoga+Retreat+2",
                "https://via.placeholder.com/400x300?text=Yoga+Retreat+3"
            ]
        },
        { 
            id: 5, 
            title: "Art Workshop", 
            price: 3800, 
            rating: 4.87, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Art+Workshop",
            location: "Quezon City, Philippines",
            description: "Express your creativity in hands-on art workshops",
            currency: "₱",
            reviewsCount: 94,
            photos: [
                "https://via.placeholder.com/800x600?text=Art+Workshop+1",
                "https://via.placeholder.com/400x300?text=Art+Workshop+2",
                "https://via.placeholder.com/400x300?text=Art+Workshop+3"
            ]
        },
        { 
            id: 6, 
            title: "Music Production Studio", 
            price: 4500, 
            rating: 4.93, 
            nights: 1, 
            image: "https://via.placeholder.com/400x300?text=Music+Studio",
            location: "Pasig, Philippines",
            description: "Record and produce music in a professional studio environment",
            currency: "₱",
            reviewsCount: 178,
            photos: [
                "https://via.placeholder.com/800x600?text=Music+Studio+1",
                "https://via.placeholder.com/400x300?text=Music+Studio+2",
                "https://via.placeholder.com/400x300?text=Music+Studio+3"
            ]
        },
    ];

    // Airbnb-style listing card component
    const ListingCard = ({ listing, itemId, isFavorited, onToggleFavorite, onListingClick }) => {
        const heartButtonRef = useRef(null);
        
        const handleCardClick = useCallback((e) => {
            console.log("Experience card clicked:", listing.title, e.target);
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
                console.warn("onListingClick is not defined in Expiriences!");
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
                    <p className="text-gray-600">Loading experiences...</p>
                </div>
            ) : experiences.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">No experiences available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                    {experiences.map((experience) => {
                        const itemId = `experience-${experience.id}`;
                        return (
                            <ListingCard
                                key={experience.id}
                                listing={experience}
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

export default Expiriences;

