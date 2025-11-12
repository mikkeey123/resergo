import React from "react";

const Coupons = () => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Coupons</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Create Coupon
                </button>
            </div>
            <div className="space-y-4">
                {/* Sample Coupons */}
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-gray-900">SUMMER20</h4>
                            <p className="text-sm text-gray-700">20% off for summer bookings</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Valid until: December 31, 2024
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                Edit
                            </button>
                            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-gray-900">WELCOME10</h4>
                            <p className="text-sm text-gray-700">10% off for new guests</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Valid until: December 31, 2024
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                Edit
                            </button>
                            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Coupons;

