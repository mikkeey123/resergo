import React, { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaUpload, FaCheckCircle, FaTimesCircle, FaPlus, FaFileAlt } from "react-icons/fa";
import { auth, getHostListings, deleteListing, updateListing } from "../../Config";
import AddListingModal from "./AddListingModal";

const Listings = ({ refreshKey }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all"); // all, published, drafts
    const [modalOpen, setModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState(null);
    const prevRefreshKeyRef = useRef(refreshKey);

    const loadListings = async () => {
        try {
            setLoading(true);
            if (auth.currentUser) {
                const hostListings = await getHostListings(auth.currentUser.uid);
                setListings(hostListings);
            }
        } catch (error) {
            console.error("Error loading listings:", error);
            // Fallback to sample data if API fails
            setListings([
                {
                    id: "1",
                    title: "Cozy Mountain Cabin",
                    category: "Home",
                    rate: 150,
                    isDraft: false,
                    images: ["https://via.placeholder.com/400x300"],
                    createdAt: new Date().toISOString()
                },
                {
                    id: "2",
                    title: "Beachfront Villa",
                    category: "Home",
                    rate: 250,
                    isDraft: true,
                    images: ["https://via.placeholder.com/400x300"],
                    createdAt: new Date().toISOString()
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadListings();
    }, []);

    // Refresh when refreshKey changes
    useEffect(() => {
        if (refreshKey && refreshKey !== prevRefreshKeyRef.current) {
            prevRefreshKeyRef.current = refreshKey;
            loadListings();
        }
    }, [refreshKey]);

    const handleDelete = async (listingId) => {
        if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
            try {
                await deleteListing(listingId);
                // Remove from local state
                setListings(listings.filter(l => l.id !== listingId));
                alert("Listing deleted successfully!");
            } catch (error) {
                console.error("Error deleting listing:", error);
                alert("Failed to delete listing: " + (error.message || "Unknown error"));
            }
        }
    };

    const handleEdit = (listing) => {
        setEditingListing(listing);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingListing(null);
    };

    const handlePublish = async (listingId) => {
        try {
            await updateListing(listingId, { isDraft: false });
            // Update local state
            setListings(listings.map(l => 
                l.id === listingId ? { ...l, isDraft: false } : l
            ));
            alert("Listing published successfully!");
        } catch (error) {
            console.error("Error publishing listing:", error);
            alert("Failed to publish listing: " + (error.message || "Unknown error"));
        }
    };

    const handleModalSuccess = () => {
        loadListings(); // Reload listings after successful creation/update
        setEditingListing(null); // Clear editing state
    };

    const filteredListings = activeTab === "all" 
        ? listings 
        : activeTab === "published"
        ? listings.filter(l => l.isDraft === false)
        : listings.filter(l => l.isDraft === true);

    const tabs = [
        { id: "all", label: "All", icon: <FaFileAlt /> },
        { id: "published", label: "Published", icon: <FaCheckCircle /> },
        { id: "drafts", label: "Drafts", icon: <FaFileAlt /> },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading listings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Listing Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
                    <p className="text-gray-600 text-sm mt-1">Manage your property listings</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                >
                    <FaPlus />
                    <span>Add Listing</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition ${
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-600 font-semibold"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.id !== "all" && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {tab.id === "published" 
                                    ? listings.filter(l => l.isDraft === false).length
                                    : listings.filter(l => l.isDraft === true).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">
                        {activeTab === "drafts" 
                            ? "No drafts found" 
                            : activeTab === "published"
                            ? "No published listings"
                            : "No listings found"}
                    </p>
                    <p className="text-gray-500 text-sm">
                        {activeTab === "drafts" || activeTab === "all"
                            ? "Click 'Add Listing' to create your first listing"
                            : "Publish your drafts to see them here"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                        <div
                            key={listing.id}
                            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:border-gray-300"
                        >
                            <div className="relative">
                                <img
                                    src={listing.images?.[0] || "https://via.placeholder.com/400x300"}
                                    alt={listing.title}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                                    }}
                                />
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        listing.isDraft
                                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                            : "bg-green-100 text-green-700 border border-green-300"
                                    }`}>
                                        {listing.isDraft ? (
                                            <>
                                                <FaFileAlt className="inline mr-1" />
                                                Draft
                                            </>
                                        ) : (
                                            <>
                                                <FaCheckCircle className="inline mr-1" />
                                                Published
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="mb-3">
                                    <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                                        {listing.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 capitalize">
                                        {listing.category || "Home"}
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-gray-900 mb-4">
                                    ₱{listing.rate || 0}/night
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(listing)}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                    >
                                        <FaEdit className="inline mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(listing.id)}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                    {listing.isDraft && (
                                        <button
                                            onClick={() => handlePublish(listing.id)}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                                            title="Publish"
                                        >
                                            <FaUpload />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Listing Modal */}
            <AddListingModal 
                isOpen={modalOpen} 
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                editingListing={editingListing}
            />
        </div>
    );
};

export default Listings;
