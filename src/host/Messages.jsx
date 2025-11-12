import React, { useState } from "react";
import { FaSearch, FaPaperPlane, FaCircle } from "react-icons/fa";

const Messages = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageInput, setMessageInput] = useState("");

    // Sample conversations
    const conversations = [
        { 
            id: 1, 
            guest: "John Doe", 
            listing: "Cozy Mountain Cabin", 
            lastMessage: "Hi, I'm interested in your listing", 
            timestamp: "2 hours ago",
            unread: true,
            avatar: "https://via.placeholder.com/48"
        },
        { 
            id: 2, 
            guest: "Jane Smith", 
            listing: "Beachfront Villa", 
            lastMessage: "Thanks for the quick response!", 
            timestamp: "1 day ago",
            unread: false,
            avatar: "https://via.placeholder.com/48"
        },
        { 
            id: 3, 
            guest: "Mike Johnson", 
            listing: "Urban Loft", 
            lastMessage: "Can I check in early?", 
            timestamp: "3 days ago",
            unread: true,
            avatar: "https://via.placeholder.com/48"
        },
    ];

    // Sample messages
    const messages = [
        { id: 1, sender: "guest", message: "Hi, I'm interested in your listing", timestamp: "2 hours ago" },
        { id: 2, sender: "host", message: "Hello! I'd be happy to help. What would you like to know?", timestamp: "2 hours ago" },
        { id: 3, sender: "guest", message: "Is the cabin pet-friendly?", timestamp: "1 hour ago" },
        { id: 4, sender: "host", message: "Yes, we allow pets with an additional fee.", timestamp: "1 hour ago" },
    ];

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim()) {
            // Handle send message logic here
            console.log("Sending message:", messageInput);
            setMessageInput("");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex h-[600px]">
                {/* Conversations List */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => setSelectedConversation(conversation)}
                                className={`p-4 border-b border-gray-200 cursor-pointer transition ${
                                    selectedConversation?.id === conversation.id 
                                        ? "bg-blue-50 border-l-4 border-l-blue-600" 
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative">
                                        <img
                                            src={conversation.avatar}
                                            alt={conversation.guest}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                                        />
                                        {conversation.unread && (
                                            <FaCircle className="absolute -top-1 -right-1 text-blue-600 text-xs fill-blue-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {conversation.guest}
                                            </h3>
                                            <span className="text-xs text-gray-500">
                                                {conversation.timestamp}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 truncate">
                                            {conversation.listing}
                                        </p>
                                        <p className="text-sm text-gray-600 truncate mt-1">
                                            {conversation.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedConversation.avatar}
                                        alt={selectedConversation.guest}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {selectedConversation.guest}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {selectedConversation.listing}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${
                                            msg.sender === "host" ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                msg.sender === "host"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white text-gray-900 border border-gray-200"
                                            }`}
                                        >
                                            <p>{msg.message}</p>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    msg.sender === "host"
                                                        ? "text-blue-100"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {msg.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
