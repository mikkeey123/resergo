import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaUser, FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { auth, getUserData, updatePasswordInFirestore, verifyPassword, updateProfilePicture, updateUserProfile } from "../../Config";
import { onAuthStateChanged, updateProfile } from "firebase/auth";

const UserDetails = ({ onBack, hideBackButton = false, isHostPage = false }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [hasPassword, setHasPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        username: "",
        phoneNumber: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profilePicture: ""
    });

    // Fetch user data from Firebase Auth and Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                
                // Fetch user data from Firestore
                try {
                    const firestoreData = await getUserData(user.uid);
                    if (firestoreData) {
                        setUserData({
                            username: firestoreData.Username || "",
                            phoneNumber: firestoreData.Number ? `+${firestoreData.Number}` : "",
                            password: firestoreData.Password || "",
                            profilePicture: firestoreData.ProfilePicture || ""
                        });
                        
                        // Check if user has a password set (not "String" which is the default)
                        setHasPassword(firestoreData.Password && firestoreData.Password !== "String");
                        
                        // Update form data with profile picture from Firestore
                        if (firestoreData.ProfilePicture) {
                            setFormData(prev => ({
                                ...prev,
                                profilePicture: firestoreData.ProfilePicture
                            }));
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    // Initialize form data when component mounts or user data changes
    useEffect(() => {
        if (currentUser || userData) {
            setFormData(prev => ({
                username: userData?.username || currentUser?.displayName || "",
                phoneNumber: userData?.phoneNumber || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
                profilePicture: userData?.profilePicture || currentUser?.photoURL || prev.profilePicture || ""
            }));
        }
    }, [currentUser, userData]);

    // Auto-hide alerts after 2.5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError("");
                setSuccess("");
            }, 2500); // 2.5 seconds

            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError("");
        setSuccess("");
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file type - reject GIF files
            const fileType = file.type.toLowerCase();
            if (fileType === 'image/gif') {
                setError("GIF files are not supported. Please use JPG or PNG images.");
                return;
            }
            
            // Check if file is an image
            if (!fileType.startsWith('image/')) {
                setError("Please select an image file (JPG or PNG)");
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size should be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    profilePicture: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (!currentUser) {
                throw new Error("No user logged in");
            }

            const updates = {};

            // Update username/displayName in Firebase Auth
            if (formData.username && formData.username !== currentUser.displayName) {
                await updateProfile(currentUser, {
                    displayName: formData.username
                });
            }

            // Update profile picture
            if (formData.profilePicture) {
                // If it's a data URL (base64), we'll save it directly to Firestore
                // In production, you might want to upload to Firebase Storage first
                if (formData.profilePicture.startsWith('data:')) {
                    // Save base64 image to Firestore
                    await updateProfilePicture(currentUser.uid, formData.profilePicture);
                    
                    // Also update Firebase Auth photoURL if it's a URL
                    // For base64, we'll just keep it in Firestore
                } else if (formData.profilePicture.startsWith('http')) {
                    // Update Firebase Auth photoURL
                    await updateProfile(currentUser, {
                        photoURL: formData.profilePicture
                    });
                    // Also save to Firestore
                    await updateProfilePicture(currentUser.uid, formData.profilePicture);
                } else {
                    // Save to Firestore anyway
                    await updateProfilePicture(currentUser.uid, formData.profilePicture);
                }
            }

            // Update username and phone number in Firestore
            if (formData.username !== userData?.username || formData.phoneNumber !== userData?.phoneNumber) {
                await updateUserProfile(currentUser.uid, formData.username, formData.phoneNumber);
            }

            // Update local state
            setCurrentUser({
                ...currentUser,
                displayName: formData.username,
                photoURL: formData.profilePicture.startsWith('http') ? formData.profilePicture : (currentUser.photoURL || formData.profilePicture)
            });
            setUserData({
                ...userData,
                username: formData.username,
                phoneNumber: formData.phoneNumber,
                profilePicture: formData.profilePicture
            });

            // Trigger a custom event to notify Navbar to refresh profile picture and username
            window.dispatchEvent(new CustomEvent('profileUpdated', { 
                detail: { 
                    profilePicture: formData.profilePicture,
                    username: formData.username
                } 
            }));

            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.newPassword) {
            setError("Please enter a new password");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        // If user has a password, verify current password
        if (hasPassword) {
            if (!formData.currentPassword) {
                setError("Please enter your current password");
                return;
            }

            // Verify current password
            const isValid = await verifyPassword(currentUser.uid, formData.currentPassword);
            if (!isValid) {
                setError("Current password is incorrect");
                return;
            }
        }

        setLoading(true);

        try {
            if (!currentUser) {
                throw new Error("No user logged in");
            }

            // Update password in Firestore
            await updatePasswordInFirestore(currentUser.uid, formData.newPassword);
            
            // Update local state
            setHasPassword(true);
            setUserData({
                ...userData,
                password: formData.newPassword
            });

            // Clear password fields
            setFormData({
                ...formData,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            setSuccess("Password updated successfully!");
        } catch (err) {
            // Customize error message to avoid showing Firebase's password length requirement
            if (err.code === 'auth/weak-password') {
                setError("Password is too weak. Please choose a stronger password.");
            } else {
                setError(err.message || "Failed to update password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log("Back button clicked, onBack:", onBack);
        if (onBack && typeof onBack === 'function') {
            try {
                onBack();
            } catch (error) {
                console.error("Error calling onBack:", error);
            }
        } else {
            console.error("onBack is not a function or is undefined");
        }
    };

    return (
        <div className={isHostPage ? "space-y-6" : "bg-white min-h-screen py-8 px-4 sm:px-8 md:px-12 lg:px-16"}>
            <div className={isHostPage ? "" : "max-w-4xl mx-auto"}>
                {/* Back Button */}
                {!hideBackButton && (
                    <button
                        type="button"
                        onClick={handleBackClick}
                        className="mb-6 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                    >
                        Back
                    </button>
                )}

                {/* Header */}
                {!isHostPage && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
                        <p className="text-gray-600">Manage your account information and settings</p>
                    </div>
                )}

                {/* Error/Success Messages - Centered Pop-up */}
                {(error || success) && (
                    <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className={`px-6 py-4 rounded-lg shadow-2xl animate-fade-in pointer-events-auto ${
                            error 
                                ? "bg-red-100 border-2 border-red-400 text-red-700" 
                                : "bg-green-100 border-2 border-green-400 text-green-700"
                        }`}>
                            <p className="font-semibold text-center">
                                {error || success}
                            </p>
                        </div>
                    </div>
                )}

                {/* Profile Picture Section */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaCamera className="text-blue-600" />
                        Profile Picture
                    </h2>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {formData.profilePicture ? (
                                <img
                                    src={formData.profilePicture}
                                    alt="Profile"
                                    className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow-md"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-blue-50 border-4 border-gray-100 flex items-center justify-center shadow-md">
                                    <FaUser className="text-5xl text-blue-400" />
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2.5 hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                            >
                                <FaCamera className="text-sm" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleProfilePictureChange}
                                className="hidden"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-700 font-medium mb-1">
                                Update your profile picture
                            </p>
                            <p className="text-xs text-gray-500">
                                Click the camera icon to upload. JPG or PNG. Max size 5MB
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Information Form */}
                <form onSubmit={handleUpdateProfile} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <FaUser className="text-blue-600" />
                        Profile Information
                    </h2>

                    <div className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaUser className="text-gray-500" />
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition"
                                placeholder="Enter your username"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaPhone className="text-gray-500" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition"
                                placeholder="+1234567890"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {loading ? "Updating..." : "Update Profile"}
                    </button>
                </form>

                {/* Change Password Form */}
                <form onSubmit={handleChangePassword} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <FaLock className="text-blue-600" />
                        {hasPassword ? "Change Password" : "Set Password"}
                    </h2>

                    {!hasPassword && (
                        <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-700 flex items-center gap-2">
                                <FaLock className="text-yellow-600" />
                                You don't have a password set yet. Set one below to enable email/password login.
                            </p>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Current Password - Only show if user has a password */}
                        {hasPassword && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 pr-10 transition"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                                    >
                                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {hasPassword ? "New Password" : "Password"}
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 pr-10 transition"
                                    placeholder={hasPassword ? "Enter new password" : "Enter password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                                >
                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {hasPassword ? "Confirm New Password" : "Confirm Password"}
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 pr-10 transition"
                                    placeholder="Confirm password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {loading ? (hasPassword ? "Updating Password..." : "Setting Password...") : (hasPassword ? "Update Password" : "Set Password")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserDetails;

