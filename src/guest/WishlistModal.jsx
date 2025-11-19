import React, { useState, useEffect } from 'react';
import { FaTimes, FaHeart } from 'react-icons/fa';
import { auth, createWishlist } from '../../Config';
import { onAuthStateChanged } from 'firebase/auth';

const WishlistModal = ({ isOpen, onClose, listingId, listingTitle, hostId }) => {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setDescription('');
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!userId) {
            setError('You must be logged in to create a wishlist.');
            return;
        }
        if (!description.trim()) {
            setError('Please describe your wishlist.');
            return;
        }

        setLoading(true);
        try {
            await createWishlist(userId, listingId, hostId, listingTitle, description);
            setSuccess('Your wishlist has been added!');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Error creating wishlist:', err);
            setError(err.message || 'Failed to add wishlist. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
                    aria-label="Close wishlist modal"
                >
                    <FaTimes className="text-xl" />
                </button>
                <div className="text-center mb-6">
                    <FaHeart className="text-red-500 text-4xl mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">What's on your Wishlist?</h2>
                    <p className="text-gray-600">Tell the host what you're looking for in this listing.</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="wishlistDescription" className="block text-sm font-medium text-gray-700 mb-2">
                            Describe your ideal experience or specific needs for "{listingTitle}"
                        </label>
                        <textarea
                            id="wishlistDescription"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., I'm looking for a quiet place to work, or I need specific accessibility features."
                            required
                            disabled={loading}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <FaHeart />
                        )}
                        <span>{loading ? 'Adding to Wishlist...' : 'Add to Wishlist'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WishlistModal;
