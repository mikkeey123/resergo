import React, { useState, useCallback, useEffect } from "react";
import Selection from "../components/Selection";
import Body from "../components/Body";
import ListingDetail from "./ListingDetail";
import Favorites from "./Favorites";
import MessagesPage from "./MessagesPage";
import Payments from "./Payments";
import Bookings from "./Bookings";

const Guestpage = ({ currentView = "listings", onBackToListings, onNavigateToMessages, searchFilters = {}, onSearchFilters }) => {
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

    // Handler for when a listing is clicked - use useCallback to stabilize reference
    const handleListingClick = useCallback((listing) => {
        console.log("Listing clicked in Guestpage:", listing);
        setSelectedListing(listing);
    }, []);

    // Handler for when back is clicked
    const handleBack = useCallback(() => {
        console.log("Back button clicked");
        setSelectedListing(null);
    }, []);

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

    // Show favorites page if currentView is "favorites"
    if (currentView === "favorites") {
        return <Favorites onBack={onBackToListings} />;
    }

    // Show payments page if currentView is "payments"
    if (currentView === "payments") {
        return <Payments onBack={onBackToListings} />;
    }

    // Show bookings page if currentView is "bookings"
    if (currentView === "bookings") {
        return <Bookings onBack={onBackToListings} />;
    }

    // If a listing is selected, show the detail view
    if (selectedListing) {
        console.log("Rendering ListingDetail with listing:", selectedListing);
        return (
            <ListingDetail 
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

