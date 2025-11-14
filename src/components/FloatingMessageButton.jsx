import React, { useState, useEffect } from "react";
import { FaComments } from "react-icons/fa";
import { auth, getConversations, getUnreadMessageCount } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";

const FloatingMessageButton = ({ onNavigateToMessages }) => {
    const [conversations, setConversations] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load current user
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

    // Load conversations count and unread messages
    useEffect(() => {
        if (currentUserId) {
            Promise.all([
                getConversations(currentUserId),
                getUnreadMessageCount(currentUserId)
            ]).then(([convos, count]) => {
                setConversations(convos);
                setUnreadCount(count);
            }).catch((error) => {
                console.error("Error loading conversations:", error);
            });
        }
    }, [currentUserId]);

    // Poll for new conversations and unread count
    useEffect(() => {
        if (!currentUserId) return;

        const interval = setInterval(() => {
            Promise.all([
                getConversations(currentUserId),
                getUnreadMessageCount(currentUserId)
            ]).then(([convos, count]) => {
                setConversations(convos);
                setUnreadCount(count);
            }).catch((error) => {
                console.error("Error polling conversations:", error);
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [currentUserId]);

    if (!currentUserId) return null;

    return (
        <button
            onClick={() => {
                // Trigger a custom event that Guestpage can listen to
                // This will open the modal without navigation
                window.dispatchEvent(new CustomEvent('openMessagesModal'));
            }}
            className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center z-40"
            aria-label="Messages"
        >
            <FaComments className="text-xl" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
};

export default FloatingMessageButton;

