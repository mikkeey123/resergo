import React, { useState, useCallback, useRef } from "react";
import { FaImage, FaHeart, FaRegHeart, FaStar } from "react-icons/fa";

const Services = ({ onListingClick }) => {
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

    const services = [
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
        const totalPrice = Math.round(listing.price * listing.nights);
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
                {services.map((service, index) => {
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
        </div>
    );
};

export default Services;
