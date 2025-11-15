import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { FaWallet, FaPaypal, FaArrowUp, FaArrowDown, FaHistory, FaTimes, FaCheckCircle } from "react-icons/fa";
import { auth, getWalletBalance, topUpWallet, withdrawFromWallet, getTransactionHistory } from "../../Config";
import { onAuthStateChanged } from "firebase/auth";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { PAYPAL_CONFIG, paypalSdkOptions, isPayPalConfigured } from "../config/paypal";

// Withdraw Modal Component - Fully isolated to prevent re-renders
const WithdrawModal = React.memo(({ 
    showWithdrawModal, 
    balance, 
    processing, 
    onClose, 
    onSubmit 
}) => {
    const emailInputRef = useRef(null);
    const amountInputRef = useRef(null);

    // Reset inputs when modal opens/closes
    useEffect(() => {
        if (showWithdrawModal) {
            // Clear inputs when modal opens
            if (emailInputRef.current) emailInputRef.current.value = "";
            if (amountInputRef.current) amountInputRef.current.value = "";
        }
    }, [showWithdrawModal]);

    // Handle form submission - read values from refs
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        const amount = amountInputRef.current?.value || "";
        const email = emailInputRef.current?.value || "";
        onSubmit({ amount, email });
    }, [onSubmit]);

    if (!showWithdrawModal) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => !processing && onClose()}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaPaypal className="text-blue-600 text-xl" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Withdraw to PayPal</h2>
                    </div>
                    <button
                        onClick={() => !processing && onClose()}
                        className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                        disabled={processing}
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (₱)
                        </label>
                        <input
                            ref={amountInputRef}
                            type="number"
                            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
                            placeholder="Enter amount"
                            min="1"
                            step="0.01"
                            max={balance}
                            required
                            disabled={processing}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Available: ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            PayPal Email Address *
                        </label>
                        <input
                            ref={emailInputRef}
                            type="email"
                            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
                            placeholder="your.email@example.com"
                            required
                            disabled={processing}
                            autoComplete="email"
                        />
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Withdrawal requests require admin approval. Your money will remain in your wallet until the request is approved. You will be notified once it's processed.
                        </p>
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
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
                            {processing ? "Processing..." : "Submit Withdrawal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if essential props change
    return (
        prevProps.showWithdrawModal === nextProps.showWithdrawModal &&
        prevProps.balance === nextProps.balance &&
        prevProps.processing === nextProps.processing &&
        prevProps.onClose === nextProps.onClose &&
        prevProps.onSubmit === nextProps.onSubmit
    );
});

// PayPal Button Wrapper Component - Memoized to prevent re-renders on input changes
const PayPalButtonWrapper = React.memo(({ amount, onSuccess, onError, onCancel, disabled }) => {
    const [{ isPending }] = usePayPalScriptReducer();

    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: amount.toFixed(2),
                    currency_code: "PHP"
                },
                description: `E-Wallet Top Up - ₱${amount.toFixed(2)}`
            }]
        });
    };

    const onApprove = async (data, actions) => {
        try {
            const order = await actions.order.capture();
            
            // Verify payment was successful
            if (order.status === "COMPLETED") {
                const transactionId = order.id;
                const payerEmail = order.payer?.email_address || "N/A";
                
                // Call success callback with order details
                onSuccess({
                    orderId: transactionId,
                    payerEmail: payerEmail,
                    amount: parseFloat(order.purchase_units[0].amount.value),
                    status: order.status
                });
            } else {
                onError(new Error(`Payment status: ${order.status}`));
            }
        } catch (error) {
            console.error("PayPal approval error:", error);
            onError(error);
        }
    };

    const onErrorHandler = (err) => {
        console.error("PayPal error:", err);
        onError(err);
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading PayPal...</span>
            </div>
        );
    }

    return (
        <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onErrorHandler}
            onCancel={onCancel}
            disabled={disabled}
            style={{
                layout: "vertical",
                color: "blue",
                shape: "rect",
                label: "paypal"
            }}
        />
    );
}, (prevProps, nextProps) => {
    // Only re-render if amount actually changes significantly (to avoid re-renders on every keystroke)
    // This prevents the input from losing focus
    return prevProps.amount === nextProps.amount && 
           prevProps.disabled === nextProps.disabled;
});

const EWallet = ({ userId = null }) => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawEmail, setWithdrawEmail] = useState("");
    const [processing, setProcessing] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [paypalError, setPaypalError] = useState("");
    const [debouncedAmount, setDebouncedAmount] = useState("");

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

    // Load wallet balance and transaction history
    useEffect(() => {
        const loadData = async () => {
            if (!currentUserId && !userId) return;
            
            setLoading(true);
            setLoadingTransactions(true);
            try {
                const targetUserId = userId || currentUserId;
                const [walletBalance, history] = await Promise.all([
                    getWalletBalance(targetUserId),
                    getTransactionHistory(targetUserId)
                ]);
                setBalance(walletBalance);
                setTransactions(history);
            } catch (error) {
                console.error("Error loading wallet data:", error);
            } finally {
                setLoading(false);
                setLoadingTransactions(false);
            }
        };

        loadData();
    }, [currentUserId, userId]);

    // Debounce topUpAmount to prevent PayPal button from re-rendering on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            if (topUpAmount && parseFloat(topUpAmount) > 0) {
                setDebouncedAmount(topUpAmount);
            } else {
                setDebouncedAmount("");
            }
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer);
    }, [topUpAmount]);

    // Handle PayPal payment success - memoized to prevent re-renders
    const handlePayPalSuccess = useCallback(async (paymentDetails) => {
        setProcessing(true);
        setPaypalError("");
        
        try {
            const targetUserId = userId || currentUserId;
            const amount = paymentDetails.amount;
            const transactionId = paymentDetails.orderId;
            
            // Update wallet balance
            const result = await topUpWallet(targetUserId, amount, "paypal", transactionId);
            setBalance(result.newBalance);
            setTopUpAmount("");
            setShowTopUpModal(false);
            
            // Reload transaction history
            const history = await getTransactionHistory(targetUserId);
            setTransactions(history);
            
            alert(`Successfully topped up ₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}!`);
        } catch (error) {
            console.error("Error processing top-up:", error);
            setPaypalError(error.message || "Failed to process top-up. Please contact support.");
        } finally {
            setProcessing(false);
        }
    }, [userId, currentUserId]);

    // Handle PayPal payment error - memoized
    const handlePayPalError = useCallback((error) => {
        console.error("PayPal payment error:", error);
        setPaypalError(error.message || "Payment failed. Please try again.");
        setProcessing(false);
    }, []);

    // Handle PayPal payment cancellation - memoized
    const handlePayPalCancel = useCallback(() => {
        console.log("PayPal payment cancelled by user");
        setPaypalError("");
        setProcessing(false);
    }, []);

    // Handle top-up form submission
    const handleTopUpSubmit = (e) => {
        e.preventDefault();
        if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
            setPaypalError("Please enter a valid amount");
            return;
        }
        
        const amount = parseFloat(topUpAmount);
        if (amount < 1) {
            setPaypalError("Minimum top-up amount is ₱1.00");
            return;
        }
        
        setPaypalError("");
        // PayPal button will handle the rest
    };

    const handleWithdrawClose = useCallback(() => {
        setShowWithdrawModal(false);
        // Reset form state when closing
        setWithdrawAmount("");
        setWithdrawEmail("");
    }, []);

    // Handle withdrawal - receive values from modal refs
    const handleWithdraw = useCallback(async ({ amount, email }) => {
        if (!amount || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        if (!email || !email.includes("@")) {
            alert("Please enter a valid PayPal email address");
            return;
        }

        setProcessing(true);
        try {
            const targetUserId = userId || currentUserId;
            const amountValue = parseFloat(amount);
            
            const result = await withdrawFromWallet(
                targetUserId,
                amountValue,
                "paypal",
                { email }
            );
            
            setBalance(result.newBalance);
            setWithdrawAmount("");
            setWithdrawEmail("");
            setShowWithdrawModal(false);
            // Reload transaction history
            const history = await getTransactionHistory(targetUserId);
            setTransactions(history);
            alert(`Withdrawal request of ₱${amountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} submitted successfully! Your request is pending admin approval. The money will remain in your wallet until approved.`);
        } catch (error) {
            console.error("Error withdrawing from wallet:", error);
            alert(`Error: ${error.message || "Failed to withdraw from wallet"}`);
        } finally {
            setProcessing(false);
        }
    }, [userId, currentUserId]);

    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <p className="text-gray-600">Loading wallet...</p>
            </div>
        );
    }

    // Only wrap with PayPalScriptProvider if PayPal is configured
    const WalletContent = () => (
        <div className="space-y-6">
                {/* Wallet Balance Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 border border-blue-800">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FaWallet className="text-white text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-white text-lg font-medium">E-Wallet Balance</h3>
                                <p className="text-blue-100 text-sm">Available funds</p>
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <p className="text-blue-100 text-sm mb-2">Current Balance</p>
                        <p className="text-white text-4xl font-bold">
                            ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setShowTopUpModal(true);
                                setPaypalError("");
                                setTopUpAmount("");
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold shadow-md hover:shadow-lg"
                        >
                            <FaArrowUp />
                            <span>Top Up</span>
                        </button>
                        <button
                            onClick={() => setShowWithdrawModal(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition font-semibold shadow-md hover:shadow-lg"
                        >
                            <FaArrowDown />
                            <span>Withdraw</span>
                        </button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaHistory className="text-blue-600 text-xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                    </div>
                    {loadingTransactions ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <FaHistory className="text-4xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No transactions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {transaction.type === "topup" ? (
                                                <FaArrowUp className="text-green-600 text-lg" />
                                            ) : (
                                                <FaArrowDown className="text-red-600 text-lg" />
                                            )}
                                            <span className="font-semibold text-gray-900 capitalize">
                                                {transaction.type}
                                            </span>
                                            {transaction.status === "completed" && (
                                                <FaCheckCircle className="text-green-600 text-sm" />
                                            )}
                                        </div>
                                        <span className={`font-bold text-lg ${
                                            transaction.type === "topup" ? "text-green-600" : "text-red-600"
                                        }`}>
                                            {transaction.type === "topup" ? "+" : "-"}₱{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>Via {transaction.paymentMethod?.toUpperCase() || "N/A"}</span>
                                        <span>{formatDate(transaction.createdAt)}</span>
                                    </div>
                                    {transaction.status && (
                                        <div className="mt-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                transaction.status === "completed" 
                                                    ? "bg-green-100 text-green-700"
                                                    : transaction.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top-Up Modal with PayPal */}
                {showTopUpModal && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => !processing && setShowTopUpModal(false)}
                    >
                        <div 
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FaPaypal className="text-blue-600 text-xl" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Top Up via PayPal</h2>
                                </div>
                                <button
                                    onClick={() => !processing && setShowTopUpModal(false)}
                                    className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                                    disabled={processing}
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                            <form onSubmit={handleTopUpSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (₱)
                                    </label>
                                    <input
                                        key="topup-amount-input"
                                        type="number"
                                        value={topUpAmount}
                                        onChange={(e) => {
                                            setTopUpAmount(e.target.value);
                                            setPaypalError("");
                                        }}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
                                        placeholder="Enter amount"
                                        min="1"
                                        step="0.01"
                                        required
                                        disabled={processing}
                                        autoFocus={showTopUpModal}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Minimum: ₱1.00</p>
                                </div>
                                
                                {paypalError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                                        {paypalError}
                                    </div>
                                )}
                                
                                <div className="pt-4 border-t border-gray-200 min-h-[200px]">
                                    {topUpAmount && parseFloat(topUpAmount) > 0 ? (
                                        <>
                                            <p className="text-sm text-gray-700 mb-3 font-medium">
                                                Pay ₱{parseFloat(topUpAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                            {debouncedAmount && PAYPAL_CONFIG.clientId && PAYPAL_CONFIG.clientId !== "YOUR_SANDBOX_CLIENT_ID" ? (
                                                <div id="paypal-button-container">
                                                    <PayPalButtonWrapper
                                                        amount={parseFloat(debouncedAmount)}
                                                        onSuccess={handlePayPalSuccess}
                                                        onError={handlePayPalError}
                                                        onCancel={handlePayPalCancel}
                                                        disabled={processing || !topUpAmount || parseFloat(topUpAmount) <= 0}
                                                    />
                                                </div>
                                            ) : debouncedAmount ? (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                    <p className="text-sm text-yellow-800">
                                                        <strong>PayPal not configured:</strong> Please set your <code className="bg-yellow-100 px-1 rounded">VITE_PAYPAL_CLIENT_ID</code> in your <code className="bg-yellow-100 px-1 rounded">.env</code> file. See <code className="bg-yellow-100 px-1 rounded">PAYPAL_SANDBOX_SETUP.md</code> for instructions.
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center">
                                                    Waiting for amount...
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center">
                                            Enter an amount above to see PayPal payment options
                                        </p>
                                    )}
                                </div>
                                
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> You'll complete the payment securely through PayPal. This is a sandbox environment for testing.
                                    </p>
                                </div>
                                
                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTopUpModal(false);
                                            setPaypalError("");
                                            setTopUpAmount("");
                                        }}
                                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                        disabled={processing}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Withdraw Modal */}
                <WithdrawModal
                    showWithdrawModal={showWithdrawModal}
                    balance={balance}
                    processing={processing}
                    onClose={handleWithdrawClose}
                    onSubmit={handleWithdraw}
                />
            </div>
    );

    // If PayPal is not configured, show warning but still render wallet
    if (!isPayPalConfigured() || !paypalSdkOptions) {
        return (
            <div className="space-y-6">
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ PayPal Not Configured</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                        To enable PayPal payments, you need to set up your PayPal Sandbox Client ID.
                    </p>
                    <div className="bg-yellow-100 rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium text-yellow-900 mb-2">Quick Setup:</p>
                        <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                            <li>Go to <a href="https://developer.paypal.com/dashboard/applications/sandbox" target="_blank" rel="noopener noreferrer" className="underline font-semibold">PayPal Developer Dashboard</a></li>
                            <li>Create a Sandbox App and copy your <strong>Client ID</strong></li>
                            <li>Open your <code className="bg-yellow-200 px-1 rounded">.env</code> file</li>
                            <li>Replace <code className="bg-yellow-200 px-1 rounded">YOUR_SANDBOX_CLIENT_ID_HERE</code> with your actual Client ID</li>
                            <li>Restart your development server</li>
                        </ol>
                    </div>
                    <p className="text-xs text-yellow-600">
                        See <code className="bg-yellow-200 px-1 rounded">PAYPAL_SANDBOX_SETUP.md</code> for detailed instructions.
                    </p>
                </div>
                <WalletContent />
            </div>
        );
    }

    return (
        <PayPalScriptProvider options={paypalSdkOptions}>
            <WalletContent />
        </PayPalScriptProvider>
    );
};

export default EWallet;
