import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Selection from "../components/Selection";
import Body from "../components/Body";
import ListingDetail from "./ListingDetail";
import Favorites from "./Favorites";
import MessagesPage from "./MessagesPage";
import Payments from "./Payments";
import Bookings from "./Bookings";
import Coupons from "./Coupons";
import { getListing } from "../../Config";

const Guestpage = ({ currentView = "listings", onBackToListings, onNavigateToMessages, searchFilters = {}, onSearchFilters }) => {
    const { id } = useParams(); // Get listing ID from route
    const navigate = useNavigate();
    const location = useLocation();
    const [activeSelection, setActiveSelection] = useState("Home");
    const [selectedListing, setSelectedListing] = useState(null);
    const [showMessagesModal, setShowMessagesModal] = useState(false);

    // Listen for open messages modal event from floating button
    useEffect(() => {
        const handleOpenModal = () => {
            setShowMessagesModal(true);
        };
        window.addEventListener('openMessagesModal', handleOpenModal);
        return () => window.removeEventListener('openMessagesModal', handleOpenModal);
    }, []);

    // Check for listingId in route parameters or query parameters (for backward compatibility)
    useEffect(() => {
        const listingId = id || new URLSearchParams(window.location.search).get('listingId');
        
        if (listingId) {
            // Always reload listing when ID changes (for navigation between different listings)
            const loadListingFromId = async () => {
                try {
                    const listingData = await getListing(listingId);
                    if (listingData) {
                        setSelectedListing({
                            id: listingId,
                            fullListing: listingData
                        });
                        // Update URL to use route if it was from query parameter
                        if (!id && listingId) {
                            navigate(`/listing/${listingId}`, { replace: true });
                        }
                    }
                } catch (error) {
                    console.error("Error loading listing from URL:", error);
                }
            };
            loadListingFromId();
        } else {
            // Clear selected listing if no ID in URL
            setSelectedListing(null);
        }
    }, [id, navigate]);

    // Handler for when a listing is clicked - use useCallback to stabilize reference
    const handleListingClick = useCallback((listing) => {
        console.log("Listing clicked in Guestpage:", listing);
        const listingId = listing?.id || listing?.fullListing?.id;
        if (listingId) {
            navigate(`/listing/${listingId}`);
        } else {
            setSelectedListing(listing);
        }
    }, [navigate]);

    // Handler for when back is clicked
    const handleBack = useCallback(() => {
        console.log("Back button clicked");
        setSelectedListing(null);
        navigate('/guest');
    }, [navigate]);

    // Handler for navigating to messages - opens modal
    const handleNavigateToMessages = useCallback(() => {
        console.log("handleNavigateToMessages called in Guestpage");
        // Just open the modal - don't clear selected listing or navigate
        setShowMessagesModal(true);
    }, []);

    // Handler for closing messages modal - just closes, no navigation
    const handleCloseMessagesModal = useCallback((e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log("Closing messages modal - no navigation");
        setShowMessagesModal(false);
        // Explicitly do NOT call onBackToListings or any navigation
        // Just close the modal, stay on current page
    }, []);

    // Show messages modal if modal is open (don't use currentView anymore)
    if (showMessagesModal) {
        return (
            <>
                {/* Show listings in background when modal is open */}
                <div>
                    <Selection activeLink={activeSelection} setActiveLink={setActiveSelection} />
                    <Body 
                        activeSelection={activeSelection} 
                        showSuggestions={true} 
                        customTitle="Suggestions & Recommendations"
                        onListingClick={handleListingClick}
                        searchFilters={searchFilters}
                    />
                </div>
                <MessagesPage onClose={handleCloseMessagesModal} />
            </>
        );
    }

    // Show favorites page if currentView is "favorites" or route is /guest/favorites
    if (currentView === "favorites" || location.pathname === '/guest/favorites') {
        return <Favorites onBack={onBackToListings} key={location.pathname} />;
    }

    // Show payments page if currentView is "payments" or route is /guest/payments
    if (currentView === "payments" || location.pathname === '/guest/payments') {
        return <Payments onBack={onBackToListings} key={location.pathname} />;
    }

    // Show bookings page if currentView is "bookings" or route is /guest/bookings
    if (currentView === "bookings" || location.pathname === '/guest/bookings') {
        return <Bookings onBack={onBackToListings} key={location.pathname} />;
    }

    // Show coupons page if currentView is "coupons" or route is /guest/coupons
    if (currentView === "coupons" || location.pathname === '/guest/coupons') {
        return <Coupons key={location.pathname} />;
    }

    // If a listing is selected, show the detail view
    if (selectedListing) {
        console.log("Rendering ListingDetail with listing:", selectedListing);
        return (
            <ListingDetail 
                key={selectedListing.id || id || 'listing-detail'}
                listing={selectedListing} 
                onBack={handleBack}
                onNavigateToMessages={handleNavigateToMessages}
            />
        );
    }

    return (
        <div>
            <Selection activeLink={activeSelection} setActiveLink={setActiveSelection} />
            <Body 
                activeSelection={activeSelection} 
                showSuggestions={true} 
                customTitle="Suggestions & Recommendations"
                onListingClick={handleListingClick}
                searchFilters={searchFilters}
            />
        </div>
    );
};

export default Guestpage;


