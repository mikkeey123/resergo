import React from "react";
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from "react-icons/fa";

/**
 * Alert Popup Component - Centered overlay alert matching the design reference
 * 
 * @param {string} type - "info" | "success" | "warning" | "error"
 * @param {string} title - Alert title (optional, defaults based on type)
 * @param {string} message - Alert message/description
 * @param {boolean} showIcon - Whether to show icon (default: true)
 * @param {boolean} dismissible - Whether alert can be dismissed (default: false)
 * @param {function} onDismiss - Callback when alert is dismissed
 * @param {boolean} isOpen - Whether the popup is visible
 */
const AlertPopup = ({ 
    type = "info", 
    title = null, 
    message, 
    showIcon = true, 
    dismissible = false,
    onDismiss,
    isOpen = true
}) => {
    if (!isOpen || !message) return null;

    // Default titles based on type
    const defaultTitles = {
        info: "Info Message",
        success: "Success Message",
        warning: "Warning Message",
        error: "Error Message"
    };

    const displayTitle = title || defaultTitles[type];

    // Color schemes based on type
    const colorSchemes = {
        info: {
            bg: "bg-blue-50",
            border: "border-blue-300",
            text: "text-blue-800",
            icon: "text-blue-600"
        },
        success: {
            bg: "bg-green-50",
            border: "border-green-300",
            text: "text-green-800",
            icon: "text-green-600"
        },
        warning: {
            bg: "bg-yellow-50",
            border: "border-yellow-300",
            text: "text-yellow-800",
            icon: "text-yellow-600"
        },
        error: {
            bg: "bg-red-50",
            border: "border-red-300",
            text: "text-red-800",
            icon: "text-red-600"
        }
    };

    const colors = colorSchemes[type] || colorSchemes.info;

    // Icons based on type
    const icons = {
        info: <FaInfoCircle className="text-xl" />,
        success: <FaCheckCircle className="text-xl" />,
        warning: <FaExclamationTriangle className="text-xl" />,
        error: <FaTimesCircle className="text-xl" />
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 max-w-md w-full mx-4 shadow-xl pointer-events-auto animate-fade-in`}>
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    {showIcon && (
                        <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
                            {icons[type]}
                        </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className={`${colors.text} font-bold text-base mb-1`}>
                            {displayTitle}
                        </h3>
                        <p className={`${colors.text} text-sm`}>
                            {message}
                        </p>
                    </div>

                    {/* Dismiss Button */}
                    {dismissible && onDismiss && (
                        <button
                            onClick={onDismiss}
                            className={`${colors.text} hover:opacity-70 transition-opacity flex-shrink-0 ml-2`}
                            aria-label="Dismiss"
                        >
                            <FaTimes className="text-sm" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertPopup;

