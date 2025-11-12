import React, { useState, useCallback, useRef, useEffect } from "react";
import { FaImage, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import Home from "./Home";
import Expiriences from "./Expiriences";
import Services from "./Services";

const Body = ({ activeSelection, showDynamicSection = true, onListingClick }) => {
    // Debug: Log if onListingClick is provided
    console.log("Body component rendered - onListingClick provided:", !!onListingClick, typeof onListingClick, "activeSelection:", activeSelection);
    
    // State to track favorites
    const [favorites, setFavorites] = useState(new Set());
    
    // Use useEffect to log when onListingClick changes
    useEffect(() => {
        console.log("Body useEffect - onListingClick changed:", !!onListingClick, typeof onListingClick);
    }, [onListingClick]);

    // Toggle favorite status
    const toggleFavorite = (itemId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(itemId)) {
                newFavorites.delete(itemId);
            } else {
                newFavorites.add(itemId);
            }
            return newFavorites;
        });
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

    // Sample listing data - replace with actual data from your backend
    const sampleListings = [
        { id: 1, title: "Room in Paris", price: 5899.5, rating: 4.93, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+1" },
        { id: 2, title: "Room in Paris", price: 5226.5, rating: 4.94, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+2" },
        { id: 3, title: "Room in Paris", price: 4751.5, rating: 4.92, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+3" },
        { id: 4, title: "Apartment in Paris", price: 7007, rating: 5.0, nights: 2, image: "https://via.placeholder.com/400x300?text=Apartment+1" },
        { id: 5, title: "Room in Asnières-sur-Seine", price: 3643, rating: 4.92, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+4" },
        { id: 6, title: "Room in Paris", price: 5543, rating: 5.0, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+5" },
        { id: 7, title: "Room in Paris", price: 7760.5, rating: 4.97, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+6" },
    ];

    // Reusable listing card component (Airbnb style)
    const ListingCard = ({ listing, itemId, isFavorited, onToggleFavorite, onListingClick }) => {
        const totalPrice = Math.round(listing.price * listing.nights);
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
                <div className="relative rounded-xl overflow-hidden mb-3 aspect-square">
                    <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
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
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-base">
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-900 flex-wrap">
                        <span>₱{totalPrice.toLocaleString()} for {listing.nights} {listing.nights === 1 ? 'night' : 'nights'}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <FaStar className="text-xs text-black" />
                            <span>{listing.rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white py-8 px-4 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-7xl mx-auto">

                {/* Dynamic Section based on Selection - Only show if showDynamicSection is true */}
                {showDynamicSection && suggestionsrecommendationsComponent()}

                {/* Listings Section - Airbnb Style */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        {activeSelection === "Home" ? "Homes" : getSelectionTitle()}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
                        {sampleListings.map((listing, index) => {
                            const itemId = `listing-${listing.id}`;
                            return (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    itemId={itemId}
                                    isFavorited={favorites.has(itemId)}
                                    onToggleFavorite={toggleFavorite}
                                    onListingClick={onListingClick}
                                />
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Body;
