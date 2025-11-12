import React, { useState } from "react";
import { FaPlus, FaCreditCard, FaUniversity, FaPaypal, FaTrash, FaCheckCircle, FaTimes } from "react-icons/fa";

const PaymentMethods = () => {
    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: 1,
            type: "bank",
            name: "BDO Savings Account",
            accountNumber: "****1234",
            isDefault: true,
        },
        {
            id: 2,
            type: "bank",
            name: "BPI Current Account",
            accountNumber: "****5678",
            isDefault: false,
        },
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        type: "bank",
        name: "",
        accountNumber: "",
        bankName: "",
        accountHolderName: "",
    });

    const resetForm = () => {
        setFormData({
            type: "bank",
            name: "",
            accountNumber: "",
            bankName: "",
            accountHolderName: "",
        });
    };

    const handleCloseModal = () => {
        setShowAddForm(false);
        resetForm();
    };

    const handleAddMethod = (e) => {
        e.preventDefault();
        const newMethod = {
            id: paymentMethods.length + 1,
            type: formData.type,
            name: formData.type === "bank" 
                ? `${formData.bankName} Account` 
                : formData.name || formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
            accountNumber: formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : "****0000",
            bankName: formData.bankName || "",
            accountHolderName: formData.accountHolderName || "",
            isDefault: paymentMethods.length === 0,
        };
        setPaymentMethods([...paymentMethods, newMethod]);
        resetForm();
        setShowAddForm(false);
    };

    const handleSetDefault = (id) => {
        setPaymentMethods(
            paymentMethods.map((method) => ({
                ...method,
                isDefault: method.id === id,
            }))
        );
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this payment method?")) {
            setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-600">Manage your payment accounts and view earnings</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium"
                >
                    <FaPlus />
                    <span>Add Payment Method</span>
                </button>
            </div>

            {/* Add Payment Method Modal */}
            {showAddForm && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={handleCloseModal}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaCreditCard className="text-blue-600 text-xl" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Add Payment Method</h2>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <form onSubmit={handleAddMethod} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    >
                                        <option value="bank">Bank Account</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="gcash">GCash</option>
                                        <option value="paymaya">PayMaya</option>
                                    </select>
                                </div>

                                {formData.type === "bank" ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bank Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.bankName}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, bankName: e.target.value })
                                                }
                                                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
                                                placeholder="e.g., BDO, BPI, Metrobank"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Account Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.accountNumber}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        accountNumber: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
                                                placeholder="Enter account number"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Account Holder Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.accountHolderName}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        accountHolderName: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
                                                placeholder="Enter account holder name"
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Email/Number *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.accountNumber}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    accountNumber: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 transition"
                                            placeholder={`Enter ${formData.type} account email or number`}
                                            required
                                        />
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium"
                                    >
                                        Add Method
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Methods List */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FaCreditCard className="text-blue-600 text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                    {paymentMethods.length > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {paymentMethods.length}
                        </span>
                    )}
                </div>

                {paymentMethods.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <FaCreditCard className="text-4xl text-gray-300" />
                        </div>
                        <p className="text-gray-600 text-lg mb-2">No payment methods added</p>
                        <p className="text-gray-500 text-sm mb-4">Add a payment method to receive payouts</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
                        >
                            Add Payment Method
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className={`p-5 rounded-xl border-2 transition-all ${
                                    method.isDefault
                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                        : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md"
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-lg ${
                                            method.isDefault
                                                ? "bg-blue-100 border border-blue-300"
                                                : "bg-white border border-gray-200"
                                        }`}>
                                            {method.type === "bank" ? (
                                                <FaUniversity className="text-2xl text-blue-600" />
                                            ) : method.type === "paypal" ? (
                                                <FaPaypal className="text-2xl text-blue-600" />
                                            ) : (
                                                <FaCreditCard className="text-2xl text-blue-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    {method.name || `${method.bankName} Account`}
                                                </h3>
                                                {method.isDefault && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-300">
                                                        <FaCheckCircle className="text-xs" />
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 font-mono">
                                                {method.accountNumber}
                                            </p>
                                            {method.type === "bank" && method.bankName && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {method.bankName}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        {!method.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(method.id)}
                                                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-300 transition text-sm font-medium shadow-sm hover:shadow"
                                                title="Set as default"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(method.id)}
                                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm shadow-sm hover:shadow"
                                            title="Delete payment method"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <FaCreditCard className="text-white text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Summary</h3>
                </div>
                <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Total Earnings</span>
                            <span className="font-bold text-gray-900 text-lg">₱0.00</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Pending Payouts</span>
                            <span className="font-bold text-yellow-600 text-lg">₱0.00</span>
                        </div>
                    </div>
                    <div className="bg-blue-600 rounded-lg p-4 border-2 border-blue-700 shadow-md">
                        <div className="flex justify-between items-center">
                            <span className="text-blue-100 font-medium text-sm">Available Balance</span>
                            <span className="font-bold text-white text-xl">₱0.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethods;
