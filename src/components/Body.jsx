import React, { useState, useCallback, useRef, useEffect } from "react";
import { FaImage, FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import Home from "./Home";
import Expiriences from "./Expiriences";
import Services from "./Services";
import { getPublishedListings, auth, getFavorites, addFavorite, removeFavorite } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";

const Body = ({ activeSelection, showDynamicSection = true, onListingClick, searchFilters = {} }) => {
    // Debug: Log if onListingClick is provided
    console.log("Body component rendered - onListingClick provided:", !!onListingClick, typeof onListingClick, "activeSelection:", activeSelection);
    
    // State to track favorites
    const [favorites, setFavorites] = useState(new Set());
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    
    // Use useEffect to log when onListingClick changes
    useEffect(() => {
        console.log("Body useEffect - onListingClick changed:", !!onListingClick, typeof onListingClick);
    }, [onListingClick]);

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
    
    // Fetch published listings based on active selection
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                let category = null;
                
                // Map activeSelection to category
                if (activeSelection === "Home") {
                    category = "Home";
                } else if (activeSelection === "Experiences") {
                    category = "Experience";
                } else if (activeSelection === "Selection") {
                    category = "Service";
                }
                
                const publishedListings = await getPublishedListings(category, searchFilters);
                
                // Transform Firestore listings to component format
                const transformedListings = publishedListings.map(listing => {
                    // Get first image, ensure it's a valid Base64 data URL
                    let imageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                    
                    if (listing.images && listing.images.length > 0) {
                        const firstImage = listing.images[0];
                        // Ensure it's a valid data URL (starts with data:)
                        if (typeof firstImage === 'string' && firstImage.trim().length > 0) {
                            if (firstImage.startsWith('data:')) {
                                imageUrl = firstImage;
                            } else {
                                // If it doesn't start with data:, it might be a URL or invalid format
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
                        location: listing.location?.city 
                            ? `${listing.location.city}${listing.location.address ? `, ${listing.location.address}` : ''}`
                            : listing.location?.address || "Location not specified",
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
                
                setListings(transformedListings);
            } catch (error) {
                console.error("Error fetching listings:", error);
                setListings([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchListings();
    }, [activeSelection, searchFilters]);

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

    // selection data
    const selection = [
        "Playdate at Polly Pocket's Compact",
        "Sleepover at Polly Pocket's Compact",
        "Go VIP with Kevin Hart",
        "Train at the X-Mansion",
        "Live like Bollywood star Janhvi Kapo...",
        "Open the Olympic Games at Musée...",
        "Wake up in the Musée d'Orsay",
        "Make core memories with Inside Ou...",
        "Design your Incredibles Supersuit",
        "Go on tour with Feid",
        "Game with Khaby Lame",
        "Crash at the X-Mansion",
        "Spend the night in the Ferrari Museu...",
        "Drift off in the Up house",
        "Shrek's Swamp",
        "Barbie's Malibu DreamHouse, Ken's ...",
        "Ted Lasso's Favorite Pub",
        "Houseplant Retreat",
    ];

    const getSelectionTitle = () => {
        switch (activeSelection) {
            case "Home":
                return "Homes";
            case "Experiences":
                return "Experiences";
            case "Selection":
                return "Services";
            default:
                return "Items";
        }
    };

    const suggestionsrecommendationsComponent = () => {
        console.log("suggestionsrecommendationsComponent called - activeSelection:", activeSelection, "onListingClick:", !!onListingClick, typeof onListingClick);
        switch (activeSelection) {
            case "Home":
                console.log("Returning Home component with onListingClick:", !!onListingClick);
                return <Home onListingClick={onListingClick} />;
            case "Experiences":
                console.log("Returning Expiriences component with onListingClick:", !!onListingClick);
                return <Expiriences onListingClick={onListingClick} />;
            case "Selection":
                console.log("Returning Services component with onListingClick:", !!onListingClick);
                return <Services onListingClick={onListingClick} />;
            default:
                return null;
        }
    };

    // Use fetched listings instead of sample data

    // Reusable listing card component (Airbnb style)
    const ListingCard = ({ listing, itemId, isFavorited, onToggleFavorite, onListingClick }) => {
        const heartButtonRef = useRef(null);
        
        const handleCardClick = useCallback((e) => {
            console.log("Body card clicked:", listing.title, e.target);
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
                console.warn("onListingClick is not defined in Body!");
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

                {/* Card Content - Format: Title on first line, Location on second line, Price • Rating • Guests on third line */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">
                        {listing.title}
                    </h3>
                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-1">
                        <FaMapMarkerAlt className="text-xs" />
                        <span className="line-clamp-1">{listing.location}</span>
                    </div>
                    {/* Price, Rating, and Max Guests */}
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
                        {listing.basics?.guests && (
                            <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <FaUsers className="text-xs text-gray-600" />
                                    <span>{listing.basics.guests} guest{listing.basics.guests > 1 ? 's' : ''}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white py-4 sm:py-8 px-3 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-7xl mx-auto">

                {/* Dynamic Section based on Selection - Hidden for now, will be implemented with algorithm-based recommendations */}
                {/* {showDynamicSection && suggestionsrecommendationsComponent()} */}

                {/* Listings Section - Airbnb Style */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        {activeSelection === "Home" ? "Homes" : getSelectionTitle()}
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">Loading listings...</p>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No listings available in this category yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6">
                            {listings.map((listing) => {
                                return (
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        itemId={listing.id}
                                        isFavorited={favorites.has(listing.id)}
                                        onToggleFavorite={toggleFavorite}
                                        onListingClick={onListingClick}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Body;
