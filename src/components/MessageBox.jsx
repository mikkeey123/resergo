import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaUser } from "react-icons/fa";
import { auth, sendMessage, getMessages, markMessagesAsRead, getUserData } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";

const MessageBox = ({ otherUserId, listingId = null, otherUserName = null, otherUserAvatar = null, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [otherUser, setOtherUser] = useState({ name: otherUserName, avatar: otherUserAvatar });
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

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

    // Load other user data
    useEffect(() => {
        if (otherUserId && !otherUserName) {
            getUserData(otherUserId).then((userData) => {
                if (userData) {
                    setOtherUser({
                        name: userData.Username || userData.displayName || "User",
                        avatar: userData.ProfilePicture || userData.photoURL || null
                    });
                }
            }).catch((error) => {
                console.error("Error loading other user data:", error);
            });
        }
    }, [otherUserId, otherUserName]);

    // Load messages
    useEffect(() => {
        if (currentUserId && otherUserId) {
            setLoading(true);
            getMessages(currentUserId, otherUserId)
                .then((msgs) => {
                    setMessages(msgs);
                    setLoading(false);
                    // Mark messages as read
                    markMessagesAsRead(currentUserId, otherUserId);
                })
                .catch((error) => {
                    console.error("Error loading messages:", error);
                    setLoading(false);
                });
        }
    }, [currentUserId, otherUserId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Set up real-time listener for new messages
    useEffect(() => {
        if (!currentUserId || !otherUserId) return;

        // Poll for new messages every 2 seconds
        const interval = setInterval(() => {
            getMessages(currentUserId, otherUserId)
                .then((msgs) => {
                    setMessages(msgs);
                    markMessagesAsRead(currentUserId, otherUserId);
                })
                .catch((error) => {
                    console.error("Error polling messages:", error);
                });
        }, 2000);

        return () => clearInterval(interval);
    }, [currentUserId, otherUserId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !currentUserId || !otherUserId || sending) return;

        setSending(true);
        try {
            await sendMessage(currentUserId, otherUserId, listingId, messageText.trim());
            setMessageText("");
            
            // Refresh messages
            const updatedMessages = await getMessages(currentUserId, otherUserId);
            setMessages(updatedMessages);
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    // Check if this is in split view (no onBack means split view)
    const isSplitView = !onBack;

    return (
        <div className={`${isSplitView ? 'h-full' : 'min-h-screen'} bg-white flex flex-col`}>
            <div className={`${isSplitView ? 'h-full w-full' : 'max-w-4xl mx-auto w-full'} flex flex-col ${isSplitView ? '' : 'h-screen'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
                            >
                                Back
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            {otherUser.avatar ? (
                                <img
                                    src={otherUser.avatar}
                                    alt={otherUser.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center ${otherUser.avatar ? 'hidden' : ''}`}>
                                <FaUser className="text-gray-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{otherUser.name || "User"}</h3>
                                <p className="text-sm text-gray-500">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    style={{ minHeight: 0 }}
                >
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isSender = message.senderId === currentUserId;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                            isSender
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-900 border border-gray-200"
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {message.message}
                                        </p>
                                        <p
                                            className={`text-xs mt-1 ${
                                                isSender ? "text-blue-100" : "text-gray-500"
                                            }`}
                                        >
                                            {formatTime(message.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!messageText.trim() || sending}
                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaPaperPlane className="text-sm" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MessageBox;

