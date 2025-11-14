import React, { useState, useEffect } from "react";
import { FaSearch, FaUser, FaTimes, FaTrash } from "react-icons/fa";
import { auth, getConversations, getUserData, getUnreadCountsByConversation, markMessagesAsRead, deleteConversation } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";
import MessageBox from "../components/MessageBox";

const MessagesPage = ({ onClose }) => {
    // Handle close - prevent any navigation
    const handleClose = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (onClose) {
            onClose();
        }
    };
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openConversationData, setOpenConversationData] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

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

    // Check for conversation to open from sessionStorage (when clicking "Chat with host")
    useEffect(() => {
        if (currentUserId) {
            const stored = sessionStorage.getItem('openConversation');
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    // Find or create conversation from stored data
                    const foundConvo = conversations.find(c => c.otherUserId === data.otherUserId);
                    if (foundConvo) {
                        setSelectedConversation(foundConvo);
                    } else {
                        // Create a temporary conversation object
                        setOpenConversationData(data);
                    }
                    sessionStorage.removeItem('openConversation');
                } catch (error) {
                    console.error("Error parsing stored conversation data:", error);
                }
            }
        }
    }, [currentUserId, conversations]);

    // Load conversations and unread counts
    useEffect(() => {
        if (currentUserId) {
            setLoading(true);
            Promise.all([
                getConversations(currentUserId),
                getUnreadCountsByConversation(currentUserId)
            ]).then(async ([convos, counts]) => {
                // Enrich conversations with user data
                const enrichedConversations = await Promise.all(
                    convos.map(async (convo) => {
                        const otherUserId =
                            convo.participant1Id === currentUserId
                                ? convo.participant2Id
                                : convo.participant1Id;
                        
                        const conversationId = [currentUserId, otherUserId].sort().join('_');
                        const unreadCount = counts[conversationId] || 0;
                        
                        try {
                            const userData = await getUserData(otherUserId);
                            return {
                                ...convo,
                                otherUserId,
                                otherUserName: userData?.Username || userData?.displayName || "User",
                                otherUserAvatar: userData?.ProfilePicture || userData?.photoURL || null,
                                unreadCount
                            };
                        } catch (error) {
                            console.error("Error loading user data:", error);
                            return {
                                ...convo,
                                otherUserId,
                                otherUserName: "User",
                                otherUserAvatar: null,
                                unreadCount
                            };
                        }
                    })
                );
                setConversations(enrichedConversations);
                
                // Store unread counts by conversation ID
                const countsMap = {};
                enrichedConversations.forEach(convo => {
                    const conversationId = [currentUserId, convo.otherUserId].sort().join('_');
                    countsMap[conversationId] = convo.unreadCount;
                });
                setUnreadCounts(countsMap);
                setLoading(false);
            }).catch((error) => {
                console.error("Error loading conversations:", error);
                setLoading(false);
            });
        }
    }, [currentUserId]);

    // Poll for new conversations and unread counts
    useEffect(() => {
        if (!currentUserId) return;

        const interval = setInterval(() => {
            Promise.all([
                getConversations(currentUserId),
                getUnreadCountsByConversation(currentUserId)
            ]).then(async ([convos, counts]) => {
                const enrichedConversations = await Promise.all(
                    convos.map(async (convo) => {
                        const otherUserId =
                            convo.participant1Id === currentUserId
                                ? convo.participant2Id
                                : convo.participant1Id;
                        
                        const conversationId = [currentUserId, otherUserId].sort().join('_');
                        const unreadCount = counts[conversationId] || 0;
                        
                        try {
                            const userData = await getUserData(otherUserId);
                            return {
                                ...convo,
                                otherUserId,
                                otherUserName: userData?.Username || userData?.displayName || "User",
                                otherUserAvatar: userData?.ProfilePicture || userData?.photoURL || null,
                                unreadCount
                            };
                        } catch (error) {
                            return {
                                ...convo,
                                otherUserId,
                                otherUserName: "User",
                                otherUserAvatar: null,
                                unreadCount
                            };
                        }
                    })
                );
                setConversations(enrichedConversations);
                
                const countsMap = {};
                enrichedConversations.forEach(convo => {
                    const conversationId = [currentUserId, convo.otherUserId].sort().join('_');
                    countsMap[conversationId] = convo.unreadCount;
                });
                setUnreadCounts(countsMap);
            }).catch((error) => {
                console.error("Error polling conversations:", error);
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [currentUserId]);

    // Handle conversation selection
    const handleSelectConversation = (convo) => {
        setSelectedConversation(convo);
        setOpenConversationData(null);
        // Mark messages as read when opening conversation
        if (currentUserId && convo.otherUserId) {
            markMessagesAsRead(currentUserId, convo.otherUserId);
            // Update unread count
            const conversationId = [currentUserId, convo.otherUserId].sort().join('_');
            setUnreadCounts(prev => ({
                ...prev,
                [conversationId]: 0
            }));
        }
    };

    // Handle delete conversation
    const handleDeleteConversation = async (e, conversation) => {
        e.stopPropagation(); // Prevent conversation selection
        
        if (!currentUserId || !conversation.otherUserId) return;
        
        const confirmDelete = window.confirm(
            `Are you sure you want to delete the conversation with ${conversation.otherUserName || 'this user'}? This action cannot be undone.`
        );
        
        if (!confirmDelete) return;
        
        try {
            await deleteConversation(currentUserId, conversation.otherUserId);
            
            // Remove conversation from local state
            setConversations(prev => prev.filter(conv => conv.id !== conversation.id));
            
            // Clear selected conversation if it was deleted
            if (selectedConversation?.id === conversation.id) {
                setSelectedConversation(null);
            }
            
            // Clear open conversation data if it was deleted
            if (openConversationData && openConversationData.otherUserId === conversation.otherUserId) {
                setOpenConversationData(null);
            }
            
            // Remove from unread counts
            const conversationId = [currentUserId, conversation.otherUserId].sort().join('_');
            setUnreadCounts(prev => {
                const newCounts = { ...prev };
                delete newCounts[conversationId];
                return newCounts;
            });
            
            console.log("✅ Conversation deleted successfully");
        } catch (error) {
            console.error("Error deleting conversation:", error);
            alert("Failed to delete conversation. Please try again.");
        }
    };

    // Handle opening conversation from stored data
    useEffect(() => {
        if (openConversationData && conversations.length > 0) {
            const foundConvo = conversations.find(c => c.otherUserId === openConversationData.otherUserId);
            if (foundConvo) {
                setSelectedConversation(foundConvo);
                setOpenConversationData(null);
            }
        }
    }, [openConversationData, conversations]);

    // Format time
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

    // Filter conversations based on search
    const filteredConversations = conversations.filter(convo => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            convo.otherUserName.toLowerCase().includes(query) ||
            (convo.lastMessage && convo.lastMessage.toLowerCase().includes(query))
        );
    });

    // Determine which conversation to show
    const conversationToShow = selectedConversation || openConversationData;

    return (
        <>
            {/* Modal Overlay */}
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 backdrop-blur-sm p-4"
                onClick={handleClose}
            >
                {/* Modal Content */}
                <div 
                    className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                            aria-label="Close"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    {/* Main content area */}
                    <div className="flex flex-1 bg-gray-50 overflow-hidden" style={{ minHeight: 0 }}>
                        {/* Conversations List Sidebar */}
                        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
                            <div className="p-4 border-b border-gray-200">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search conversations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="p-4 text-center text-gray-500">Loading...</div>
                                ) : filteredConversations.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        {searchQuery ? "No conversations match your search" : "No conversations yet"}
                                    </div>
                                ) : (
                                    filteredConversations.map((conversation) => {
                                        const conversationId = [currentUserId, conversation.otherUserId].sort().join('_');
                                        const unreadCount = unreadCounts[conversationId] || conversation.unreadCount || 0;
                                        
                                        return (
                                            <div
                                                key={conversation.id}
                                                onClick={() => handleSelectConversation(conversation)}
                                                className={`p-4 border-b border-gray-200 cursor-pointer transition group ${
                                                    selectedConversation?.id === conversation.id 
                                                        ? "bg-blue-50 border-l-4 border-l-blue-600" 
                                                        : "hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="relative flex-shrink-0">
                                                        {conversation.otherUserAvatar ? (
                                                            <img
                                                                src={conversation.otherUserAvatar}
                                                                alt={conversation.otherUserName}
                                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 ${conversation.otherUserAvatar ? 'hidden' : ''}`}>
                                                            <FaUser className="text-gray-500" />
                                                        </div>
                                                        {unreadCount > 0 && (
                                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                                                {unreadCount > 9 ? '9+' : unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3 className="font-semibold text-gray-900 truncate">
                                                                {conversation.otherUserName}
                                                            </h3>
                                                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                                <span className="text-xs text-gray-500">
                                                                    {formatTime(conversation.lastMessageTime)}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => handleDeleteConversation(e, conversation)}
                                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
                                                                    title="Delete conversation"
                                                                    aria-label="Delete conversation"
                                                                >
                                                                    <FaTrash className="text-sm" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {conversation.lastMessage}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 flex flex-col bg-gray-50" style={{ minHeight: 0 }}>
                            {conversationToShow ? (
                                <MessageBox
                                    otherUserId={conversationToShow.otherUserId}
                                    listingId={conversationToShow.listingId}
                                    otherUserName={conversationToShow.otherUserName}
                                    otherUserAvatar={conversationToShow.otherUserAvatar}
                                    onBack={null} // No back button in split view
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <p>Select a conversation to start messaging</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MessagesPage;
