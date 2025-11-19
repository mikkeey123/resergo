import React, { useState, useEffect, useRef } from "react";
import { FaCopy, FaCheck, FaTicketAlt } from "react-icons/fa";
import { auth, getAllAvailableCoupons } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copiedCode, setCopiedCode] = useState(null);
    const copyInputRef = useRef(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchCoupons();
            } else {
                setUserId(null);
                setCoupons([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        setError("");
        try {
            const availableCoupons = await getAllAvailableCoupons();
            setCoupons(availableCoupons);
        } catch (err) {
            console.error("Error fetching coupons:", err);
            setError("Failed to load coupons. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = (code) => {
        if (copyInputRef.current) {
            copyInputRef.current.value = code;
            copyInputRef.current.select();
            copyInputRef.current.setSelectionRange(0, 99999); // For mobile devices

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(code);
                    setCopiedCode(code);
                    setTimeout(() => setCopiedCode(null), 2000);
                } else {
                    document.execCommand('copy');
                    setCopiedCode(code);
                    setTimeout(() => setCopiedCode(null), 2000);
                }
            } catch (err) {
                console.error("Failed to copy:", err);
                alert("Failed to copy coupon code. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen py-8 px-4 sm:px-8 md:px-12 lg:px-16">
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-600">Loading coupons...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white min-h-screen py-8 px-4 sm:px-8 md:px-12 lg:px-16">
                <div className="text-center py-12 text-red-600">
                    <p>{error}</p>
                    <button
                        onClick={fetchCoupons}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white py-8 px-4 sm:px-8 md:px-12 lg:px-16 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Available Coupons</h1>
                    <p className="text-gray-600 mt-1">Claim exciting discounts from our hosts!</p>
                </div>

                {coupons.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 text-center py-12">
                        <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-2">No coupons available right now.</p>
                        <p className="text-gray-500">Check back later for new discounts!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.map((coupon) => (
                            <div key={coupon.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900">{coupon.code}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        coupon.isActive && (!coupon.expiresAt || coupon.expiresAt.toDate() > new Date())
                                            ? "bg-green-100 text-green-700 border border-green-300"
                                            : "bg-red-100 text-red-700 border border-red-300"
                                    }`}>
                                        {coupon.isActive && (!coupon.expiresAt || coupon.expiresAt.toDate() > new Date()) ? "Active" : "Expired/Inactive"}
                                    </span>
                                </div>
                                <p className="text-gray-700 mb-3 flex-1">{coupon.description}</p>
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <span>
                                        Discount: {coupon.discountType === "percentage" 
                                            ? `${coupon.discountValue}% OFF` 
                                            : `₱${coupon.discountValue.toLocaleString()} OFF`}
                                    </span>
                                    {coupon.expiresAt && (
                                        <span>Expires: {coupon.expiresAt.toDate().toLocaleDateString()}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleCopyCode(coupon.code)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    {copiedCode === coupon.code ? <FaCheck /> : <FaCopy />}
                                    <span>{copiedCode === coupon.code ? "Copied!" : "Copy Code"}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Hidden input for copying code using React DOM */}
            <input
                ref={copyInputRef}
                type="text"
                readOnly
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: '-9999px',
                    opacity: 0,
                    pointerEvents: 'none'
                }}
                aria-hidden="true"
                tabIndex={-1}
            />
        </div>
    );
};

export default Coupons;
