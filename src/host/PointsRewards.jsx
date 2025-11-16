import React, { useState, useEffect } from "react";
import { FaStar, FaGift, FaTrophy, FaCoins } from "react-icons/fa";
import { auth, getHostPoints, getNextLevelPoints, getPointsTransactions, redeemReward } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";

const PointsRewards = () => {
    const [currentPoints, setCurrentPoints] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);
    const [level, setLevel] = useState("Bronze");
    const [nextLevelPoints, setNextLevelPoints] = useState(1000);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hostId, setHostId] = useState(null);
    const [redeeming, setRedeeming] = useState(null);
    
    const progress = (currentPoints / nextLevelPoints) * 100;

    const rewards = [
        {
            id: "featured_listing",
            title: "Featured Listing",
            description: "Get your listing featured for 7 days",
            points: 500,
            icon: <FaStar className="text-2xl text-yellow-500" />,
        },
        {
            id: "premium_badge",
            title: "Premium Badge",
            description: "Show a premium badge on your profile",
            points: 1000,
            icon: <FaTrophy className="text-2xl text-blue-600" />,
        },
        {
            id: "marketing_boost",
            title: "Marketing Boost",
            description: "Get 2x visibility for 30 days",
            points: 2000,
            icon: <FaGift className="text-2xl text-green-600" />,
        },
    ];

    // Fetch points data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setHostId(user.uid);
                try {
                    setLoading(true);
                    const [pointsData, transactionsData] = await Promise.all([
                        getHostPoints(user.uid),
                        getPointsTransactions(user.uid)
                    ]);
                    
                    setCurrentPoints(pointsData.currentPoints);
                    setTotalEarned(pointsData.totalEarned);
                    setLevel(pointsData.level);
                    setNextLevelPoints(getNextLevelPoints(pointsData.currentPoints));
                    setTransactions(transactionsData);
                } catch (error) {
                    console.error("Error fetching points data:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setHostId(null);
                setLoading(false);
            }
        });
        
        return () => unsubscribe();
    }, []);

    // Handle reward redemption
    const handleRedeem = async (reward) => {
        if (!hostId) return;
        
        if (currentPoints < reward.points) {
            alert("Insufficient points!");
            return;
        }
        
        if (!window.confirm(`Are you sure you want to redeem "${reward.title}" for ${reward.points} points?`)) {
            return;
        }
        
        setRedeeming(reward.id);
        try {
            await redeemReward(hostId, reward.id, reward.points, reward.title);
            
            // Refresh points data
            const [pointsData, transactionsData] = await Promise.all([
                getHostPoints(hostId),
                getPointsTransactions(hostId)
            ]);
            
            setCurrentPoints(pointsData.currentPoints);
            setTotalEarned(pointsData.totalEarned);
            setLevel(pointsData.level);
            setNextLevelPoints(getNextLevelPoints(pointsData.currentPoints));
            setTransactions(transactionsData);
            
            alert(`Successfully redeemed "${reward.title}"!`);
        } catch (error) {
            console.error("Error redeeming reward:", error);
            alert(`Error: ${error.message || "Failed to redeem reward"}`);
        } finally {
            setRedeeming(null);
        }
    };

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
                                    onClick={() => handleRedeem(reward)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        currentPoints >= reward.points && !redeeming
                                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                    disabled={currentPoints < reward.points || redeeming === reward.id}
                                >
                                    {redeeming === reward.id ? "Processing..." : "Redeem"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No transactions yet</div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {transaction.description}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {transaction.date.toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </p>
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
                )}
            </div>
        </div>
    );
};

export default PointsRewards;
