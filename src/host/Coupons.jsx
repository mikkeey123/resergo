import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheckCircle, FaTimesCircle, FaCopy, FaPaperPlane, FaCheck } from "react-icons/fa";
import { auth, getHostCoupons, createCoupon, updateCoupon, deleteCoupon, getConversations, sendMessage, getUserData } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    
    // Form state
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState("percentage");
    const [discountValue, setDiscountValue] = useState("");
    const [description, setDescription] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedGuestId, setSelectedGuestId] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    // Get current user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUserId(user.uid);
            } else {
                setCurrentUserId(null);
            }
        });
        return () => unsubscribe();
    }, []);

    // Load coupons
    useEffect(() => {
        if (currentUserId) {
            loadCoupons();
            loadConversations();
        }
    }, [currentUserId]);

    // Load conversations for sending coupons
    const loadConversations = async () => {
        if (!currentUserId) return;
        
        try {
            const convos = await getConversations(currentUserId);
            const enrichedConversations = await Promise.all(
                convos.map(async (convo) => {
                    const otherUserId =
                        convo.participant1Id === currentUserId
                            ? convo.participant2Id
                            : convo.participant1Id;
                    
                    try {
                        const userData = await getUserData(otherUserId);
                        return {
                            ...convo,
                            otherUserId,
                            otherUserName: userData?.Username || userData?.displayName || "User",
                            otherUserAvatar: userData?.ProfilePicture || userData?.photoURL || null
                        };
                    } catch (error) {
                        return {
                            ...convo,
                            otherUserId,
                            otherUserName: "User",
                            otherUserAvatar: null
                        };
                    }
                })
            );
            setConversations(enrichedConversations);
        } catch (error) {
            console.error("Error loading conversations:", error);
        }
    };

    const loadCoupons = async () => {
        if (!currentUserId) return;
        
        setLoading(true);
        try {
            const hostCoupons = await getHostCoupons(currentUserId);
            setCoupons(hostCoupons);
        } catch (error) {
            console.error("Error loading coupons:", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCode("");
        setDiscountType("percentage");
        setDiscountValue("");
        setDescription("");
        setExpiresAt("");
        setIsActive(true);
        setError("");
        setEditingCoupon(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleOpenEdit = (coupon) => {
        setCode(coupon.code);
        setDiscountType(coupon.discountType || "percentage");
        setDiscountValue(coupon.discountValue?.toString() || "");
        setDescription(coupon.description || "");
        if (coupon.expiresAt) {
            const expiresDate = coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt);
            setExpiresAt(expiresDate.toISOString().split('T')[0]);
        } else {
            setExpiresAt("");
        }
        setIsActive(coupon.isActive !== undefined ? coupon.isActive : true);
        setEditingCoupon(coupon);
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        if (!processing) {
            setShowCreateModal(false);
            resetForm();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!code.trim()) {
            setError("Coupon code is required");
            return;
        }
        
        if (!discountValue || parseFloat(discountValue) <= 0) {
            setError("Discount value must be greater than 0");
            return;
        }
        
        if (discountType === "percentage" && parseFloat(discountValue) > 100) {
            setError("Percentage discount cannot exceed 100%");
            return;
        }
        
        if (expiresAt && new Date(expiresAt) < new Date()) {
            setError("Expiration date cannot be in the past");
            return;
        }

        setProcessing(true);
        try {
            const couponData = {
                code: code.trim().toUpperCase(),
                discountType,
                discountValue: parseFloat(discountValue),
                description: description.trim(),
                expiresAt: expiresAt ? Timestamp.fromDate(new Date(expiresAt)) : null,
                isActive
            };

            if (editingCoupon) {
                await updateCoupon(editingCoupon.id, currentUserId, couponData);
            } else {
                await createCoupon(currentUserId, couponData);
            }
            
            await loadCoupons();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving coupon:", error);
            setError(error.message || "Failed to save coupon");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (couponId) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) {
            return;
        }

        try {
            await deleteCoupon(couponId, currentUserId);
            await loadCoupons();
        } catch (error) {
            console.error("Error deleting coupon:", error);
            alert("Failed to delete coupon");
        }
    };

    const handleCopyCode = (couponCode) => {
        // Use React DOM to copy code
        const copyToClipboard = (text) => {
            // Create a temporary input element using React DOM
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'fixed';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            
            const tempInput = document.createElement('input');
            tempInput.value = text;
            tempInput.readOnly = true;
            tempDiv.appendChild(tempInput);
            document.body.appendChild(tempDiv);
            
            // Select and copy
            tempInput.select();
            tempInput.setSelectionRange(0, 99999); // For mobile devices
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    setCopiedCode(couponCode);
                    setTimeout(() => setCopiedCode(null), 2000);
                } else {
                    // Fallback to clipboard API
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).then(() => {
                            setCopiedCode(couponCode);
                            setTimeout(() => setCopiedCode(null), 2000);
                        }).catch((error) => {
                            console.error("Failed to copy:", error);
                            alert("Failed to copy coupon code");
                        });
                    } else {
                        alert("Failed to copy coupon code");
                    }
                }
            } catch (err) {
                console.error("Failed to copy:", err);
                // Fallback to clipboard API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(() => {
                        setCopiedCode(couponCode);
                        setTimeout(() => setCopiedCode(null), 2000);
                    }).catch((error) => {
                        console.error("Failed to copy:", error);
                        alert("Failed to copy coupon code");
                    });
                } else {
                    alert("Failed to copy coupon code");
                }
            } finally {
                // Clean up
                document.body.removeChild(tempDiv);
            }
        };
        
        copyToClipboard(couponCode);
    };

    const handleOpenSendModal = (coupon) => {
        setSelectedCoupon(coupon);
        setSelectedGuestId("");
        setShowSendModal(true);
    };

    const handleCloseSendModal = () => {
        if (!sendingMessage) {
            setShowSendModal(false);
            setSelectedCoupon(null);
            setSelectedGuestId("");
        }
    };

    const handleSendCoupon = async () => {
        if (!selectedCoupon || !selectedGuestId) {
            alert("Please select a guest to send the coupon to");
            return;
        }

        setSendingMessage(true);
        try {
            const discountText = selectedCoupon.discountType === "percentage"
                ? `${selectedCoupon.discountValue}% off`
                : `₱${selectedCoupon.discountValue.toLocaleString()} off`;
            
            const message = `🎟️ Special Offer!\n\nUse coupon code: ${selectedCoupon.code}\n\n${discountText}${selectedCoupon.description ? ` - ${selectedCoupon.description}` : ''}\n\nValid until: ${formatDate(selectedCoupon.expiresAt)}\n\nEnter this code when booking to get your discount!`;
            
            await sendMessage(currentUserId, selectedGuestId, null, message);
            alert("Coupon sent successfully!");
            handleCloseSendModal();
        } catch (error) {
            console.error("Error sending coupon:", error);
            alert("Failed to send coupon. Please try again.");
        } finally {
            setSendingMessage(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "No expiration";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const isExpired = (coupon) => {
        if (!coupon.expiresAt) return false;
        const expiresAt = coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt);
        return expiresAt < new Date();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <p className="text-gray-600">Loading coupons...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Coupons</h3>
                    <p className="text-sm text-gray-600 mt-1">Create and manage discount coupons for your listings</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium"
                >
                    <FaPlus />
                    <span>Create Coupon</span>
                </button>
            </div>

            {/* Coupons List */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                {coupons.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">No coupons created yet</p>
                        <button
                            onClick={handleOpenCreate}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Create Your First Coupon
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {coupons.map((coupon) => {
                            const expired = isExpired(coupon);
                            const isActive = coupon.isActive && !expired;
                            const usedBy = coupon.usedBy || [];
                            const uniqueUsersCount = usedBy.length;
                            
                            return (
                                <div
                                    key={coupon.id}
                                    className={`border rounded-lg p-4 ${
                                        isActive
                                            ? "bg-gray-50 border-gray-300"
                                            : "bg-gray-100 border-gray-200 opacity-75"
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold text-gray-900 text-lg">{coupon.code}</h4>
                                                {isActive ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-300">
                                                        <FaCheckCircle className="inline mr-1" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-300">
                                                        <FaTimesCircle className="inline mr-1" />
                                                        {expired ? "Expired" : "Inactive"}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">
                                                {coupon.discountType === "percentage"
                                                    ? `${coupon.discountValue}% off`
                                                    : `₱${coupon.discountValue.toLocaleString()} off`}
                                                {coupon.description && ` - ${coupon.description}`}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                                                <span>Valid until: {formatDate(coupon.expiresAt)}</span>
                                                <span>Used by {uniqueUsersCount} {uniqueUsersCount === 1 ? 'guest' : 'guests'}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleCopyCode(coupon.code)}
                                                    className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition flex items-center gap-2"
                                                    title="Copy coupon code"
                                                >
                                                    {copiedCode === coupon.code ? (
                                                        <>
                                                            <FaCheck /> Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCopy /> Copy Code
                                                        </>
                                                    )}
                                                </button>
                                                {conversations.length > 0 && (
                                                    <button
                                                        onClick={() => handleOpenSendModal(coupon)}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition flex items-center gap-2"
                                                        title="Send coupon via message"
                                                    >
                                                        <FaPaperPlane /> Send to Guest
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleOpenEdit(coupon)}
                                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                                                title="Edit coupon"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                                                title="Delete coupon"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                                disabled={processing}
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                                    {error}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Coupon Code *
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
                                    placeholder="e.g., SUMMER20"
                                    required
                                    disabled={processing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount Type *
                                </label>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    required
                                    disabled={processing}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₱)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount Value *
                                </label>
                                <input
                                    type="number"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
                                    placeholder={discountType === "percentage" ? "e.g., 20" : "e.g., 100"}
                                    min="0"
                                    step={discountType === "percentage" ? "1" : "0.01"}
                                    max={discountType === "percentage" ? "100" : undefined}
                                    required
                                    disabled={processing}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {discountType === "percentage" ? "Enter percentage (0-100)" : "Enter amount in ₱"}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
                                    placeholder="e.g., Summer special discount"
                                    disabled={processing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiration Date
                                </label>
                                <input
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    min={new Date().toISOString().split('T')[0]}
                                    disabled={processing}
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Each coupon can only be used once per guest. Guests cannot use the same coupon code multiple times.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    disabled={processing}
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    Active
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={processing}
                                >
                                    {processing ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Send Coupon Modal */}
            {showSendModal && selectedCoupon && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={handleCloseSendModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Send Coupon to Guest</h2>
                            <button
                                onClick={handleCloseSendModal}
                                className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                                disabled={sendingMessage}
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Coupon Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Coupon: {selectedCoupon.code}</p>
                                <p className="text-sm text-blue-700">
                                    {selectedCoupon.discountType === "percentage"
                                        ? `${selectedCoupon.discountValue}% off`
                                        : `₱${selectedCoupon.discountValue.toLocaleString()} off`}
                                    {selectedCoupon.description && ` - ${selectedCoupon.description}`}
                                </p>
                            </div>

                            {/* Select Guest */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Guest *
                                </label>
                                {conversations.length === 0 ? (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600">No conversations yet</p>
                                        <p className="text-xs text-gray-500 mt-1">Start a conversation with a guest first</p>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedGuestId}
                                        onChange={(e) => setSelectedGuestId(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        required
                                        disabled={sendingMessage}
                                    >
                                        <option value="">Select a guest...</option>
                                        {conversations.map((convo) => (
                                            <option key={convo.otherUserId} value={convo.otherUserId}>
                                                {convo.otherUserName}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseSendModal}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                    disabled={sendingMessage}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendCoupon}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={sendingMessage || !selectedGuestId || conversations.length === 0}
                                >
                                    {sendingMessage ? (
                                        "Sending..."
                                    ) : (
                                        <>
                                            <FaPaperPlane /> Send Coupon
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
