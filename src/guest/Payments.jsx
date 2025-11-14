import React from "react";
import EWallet from "../components/EWallet";

const Payments = ({ onBack }) => {
    return (
        <div className="bg-white py-8 px-4 sm:px-8 md:px-12 lg:px-16 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-lg mb-6"
                        >
                            Back
                        </button>
                    )}
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">E-Wallet</h2>
                    <p className="text-gray-600">Manage your wallet balance, top up, and withdraw funds</p>
                </div>
                <EWallet />
            </div>
        </div>
    );
};

export default Payments;

