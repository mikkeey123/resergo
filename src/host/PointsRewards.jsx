import React from "react";
import { FaStar, FaGift, FaTrophy, FaCoins } from "react-icons/fa";

const PointsRewards = () => {
    // Sample data
    const currentPoints = 1250;
    const totalEarned = 5000;
    const level = "Gold";
    const nextLevelPoints = 2000;
    const progress = (currentPoints / nextLevelPoints) * 100;

    const rewards = [
        {
            id: 1,
            title: "Featured Listing",
            description: "Get your listing featured for 7 days",
            points: 500,
            icon: <FaStar className="text-2xl text-yellow-500" />,
        },
        {
            id: 2,
            title: "Premium Badge",
            description: "Show a premium badge on your profile",
            points: 1000,
            icon: <FaTrophy className="text-2xl text-blue-600" />,
        },
        {
            id: 3,
            title: "Marketing Boost",
            description: "Get 2x visibility for 30 days",
            points: 2000,
            icon: <FaGift className="text-2xl text-green-600" />,
        },
    ];

    const recentTransactions = [
        { id: 1, description: "Booking completed", points: +50, date: "2024-01-10" },
        { id: 2, description: "Review received", points: +25, date: "2024-01-08" },
        { id: 3, description: "Featured listing", points: -500, date: "2024-01-05" },
        { id: 4, description: "Booking completed", points: +50, date: "2024-01-03" },
    ];

    return (
        <div className="space-y-6">
            {/* Points Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <FaCoins className="text-3xl" />
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                            {level}
                        </span>
                    </div>
                    <p className="text-blue-100 text-sm mb-1">Current Points</p>
                    <p className="text-3xl font-bold">{currentPoints.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <FaTrophy className="text-3xl text-yellow-500 mb-4" />
                    <p className="text-gray-600 text-sm mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {totalEarned.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <FaStar className="text-3xl text-blue-600 mb-4" />
                    <p className="text-gray-600 text-sm mb-1">Next Level</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {nextLevelPoints.toLocaleString()} pts
                    </p>
                </div>
            </div>

            {/* Progress to Next Level */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Progress to Next Level
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current: {currentPoints} pts</span>
                        <span className="text-gray-600">Next: {nextLevelPoints} pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-600">
                        {nextLevelPoints - currentPoints} points needed to reach next level
                    </p>
                </div>
            </div>

            {/* Available Rewards */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rewards</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rewards.map((reward) => (
                        <div
                            key={reward.id}
                            className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition hover:shadow-md"
                        >
                            <div className="mb-3">{reward.icon}</div>
                            <h4 className="font-semibold text-gray-900 mb-1">{reward.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    {reward.points} pts
                                </span>
                                <button
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        currentPoints >= reward.points
                                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                    disabled={currentPoints < reward.points}
                                >
                                    Redeem
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition"
                        >
                            <div>
                                <p className="font-medium text-gray-900">
                                    {transaction.description}
                                </p>
                                <p className="text-sm text-gray-600">{transaction.date}</p>
                            </div>
                            <span
                                className={`font-semibold ${
                                    transaction.points > 0 ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {transaction.points > 0 ? "+" : ""}
                                {transaction.points} pts
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PointsRewards;
