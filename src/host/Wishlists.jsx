import React, { useState, useEffect, useRef } from 'react';
import { FaGift, FaUser, FaHome, FaCalendarAlt } from 'react-icons/fa';
import { auth, getHostWishlists, getUserData } from '../../Config';
import { onAuthStateChanged } from 'firebase/auth';

const Wishlists = ({ refreshKey }) => {
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hostId, setHostId] = useState(null);
    const prevRefreshKeyRef = useRef(refreshKey);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setHostId(user.uid);
            } else {
                setHostId(null);
                setWishlists([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchWishlists = async () => {
        if (!hostId) return;

        setLoading(true);
        setError('');
        try {
            const hostWishlists = await getHostWishlists(hostId);
            setWishlists(hostWishlists);
        } catch (err) {
            console.error('Error fetching host wishlists:', err);
            setError('Failed to load wishlists. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hostId) {
            fetchWishlists();
        }
    }, [hostId]);

    // Refresh when refreshKey changes
    useEffect(() => {
        if (refreshKey && refreshKey !== prevRefreshKeyRef.current && hostId) {
            prevRefreshKeyRef.current = refreshKey;
            fetchWishlists();
        }
    }, [refreshKey, hostId]);

    if (loading) {
        return (
            <div className="bg-white min-h-screen py-8 px-4 sm:px-8 md:px-12 lg:px-16">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 ml-3">Loading wishlists...</p>
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
                        onClick={fetchWishlists}
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
                    <h1 className="text-3xl font-bold text-gray-900">Guest Wishlists</h1>
                    <p className="text-gray-600 mt-1">View what guests are wishing for in your listings.</p>
                </div>

                {wishlists.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 text-center py-12">
                        <FaGift className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-2">No wishlists for your listings yet.</p>
                        <p className="text-gray-500">Guests can add wishlists after booking your listings.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlists.map((wishlist) => (
                            <div key={wishlist.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col hover:shadow-lg transition">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10">
                                            {wishlist.guestAvatar && wishlist.guestAvatar.trim() !== "" ? (
                                                <img 
                                                    src={wishlist.guestAvatar} 
                                                    alt={wishlist.guestName} 
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : null}
                                            <div 
                                                className={`absolute inset-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center ${wishlist.guestAvatar && wishlist.guestAvatar.trim() !== "" ? 'hidden' : ''}`}
                                            >
                                                <FaUser className="text-gray-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{wishlist.guestName}</h3>
                                            <p className="text-sm text-gray-600">wishes for:</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <FaCalendarAlt className="text-xs" />
                                        {wishlist.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                                    </span>
                                </div>
                                <div className="mb-4 flex-1">
                                    <p className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                                        <FaHome className="text-blue-600" />
                                        {wishlist.listingTitle}
                                    </p>
                                    <p className="text-gray-700 text-sm">{wishlist.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlists;
