import React, { useState, useCallback, useRef } from "react";
import { FaImage, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";

const Home = ({ onListingClick = null }) => {
    // Debug: Log if onListingClick is provided
    console.log("Home component - onListingClick provided:", !!onListingClick, typeof onListingClick, onListingClick);
    
    // State to track favorites
    const [favorites, setFavorites] = useState(new Set());

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

    const homes = [
        { id: 1, title: "Room in São Paulo", price: 2181, rating: 4.99, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+São+Paulo" },
        { id: 2, title: "Room in Paris", price: 5899.5, rating: 4.93, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+Paris" },
        { id: 3, title: "Room in Paris", price: 5226.5, rating: 4.94, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+Paris+2" },
        { id: 4, title: "Room in Paris", price: 4751.5, rating: 4.92, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+Paris+3" },
        { id: 5, title: "Apartment in Paris", price: 7007, rating: 5.0, nights: 2, image: "https://via.placeholder.com/400x300?text=Apartment+Paris" },
        { id: 6, title: "Room in Asnières-sur-Seine", price: 3643, rating: 4.92, nights: 2, image: "https://via.placeholder.com/400x300?text=Room+Asnières" },
    ];

    // Airbnb-style listing card component
    const ListingCard = ({ listing, itemId, isFavorited, onToggleFavorite, onListingClick }) => {
        console.log("ListingCard rendered - onListingClick:", !!onListingClick, typeof onListingClick, "listing:", listing.title);
        
        const totalPrice = Math.round(listing.price * listing.nights);
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
                <div className="relative rounded-xl overflow-hidden mb-3 aspect-square">
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
        <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Suggestions & Recommendations</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {homes.map((home, index) => {
                    const itemId = `home-${home.id}`;
                    return (
                        <ListingCard
                            key={home.id}
                            listing={home}
                            itemId={itemId}
                            isFavorited={favorites.has(itemId)}
                            onToggleFavorite={toggleFavorite}
                            onListingClick={onListingClick || (() => console.warn("onListingClick not provided to ListingCard"))}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Home;
