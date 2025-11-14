import React, { useState, useEffect } from "react";
import { FaTimes, FaShieldAlt, FaUserShield, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { getRulesAndRegulations } from "../../Config";

const RulesModal = ({ isOpen, onClose }) => {
  const [regulations, setRegulations] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchRegulations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchRegulations = async () => {
    try {
      setLoading(true);
      const data = await getRulesAndRegulations();
      setRegulations(data);
    } catch (error) {
      console.error("Error fetching rules & regulations:", error);
      setRegulations("");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-2xl" />
            <h2 className="text-2xl font-bold">Rules & Regulations</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
            aria-label="Close"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : regulations ? (
            <div className="space-y-6">
              {/* Introduction */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-700">
                  By using ReserGo, you agree to comply with the following rules and regulations. Please read them carefully before proceeding.
                </p>
              </div>

              {/* Rules & Regulations Content */}
              <div className="prose max-w-none">
                <div 
                  className="text-gray-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: regulations.replace(/\n/g, '<br />') }}
                />
              </div>

              {/* Footer Note */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> These rules and regulations may be updated from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaShieldAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No Rules & Regulations Available</p>
              <p className="text-gray-400 text-sm">
                The administrator has not set up the rules and regulations yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;

