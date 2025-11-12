import React, { useState, useCallback } from "react";
import Selection from "../components/Selection";
import Body from "../components/Body";
import ListingDetail from "./ListingDetail";

const Guestpage = () => {
    const [activeSelection, setActiveSelection] = useState("Home");
    const [selectedListing, setSelectedListing] = useState(null);

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

    // If a listing is selected, show the detail view
    if (selectedListing) {
        console.log("Rendering ListingDetail with listing:", selectedListing);
        return (
            <ListingDetail 
                listing={selectedListing} 
                onBack={handleBack} 
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
            />
        </div>
    );
};

export default Guestpage;

