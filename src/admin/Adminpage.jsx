import React, { useState, useEffect, useMemo } from "react";
import { 
    FaStar, 
    FaThumbsDown, 
    FaCalendarAlt, 
    FaUsers, 
    FaChartLine, 
    FaDollarSign, 
    FaHome,
    FaBars,
    FaTimes,
    FaPowerOff,
    FaUser,
    FaFileAlt,
    FaShieldAlt,
    FaDownload,
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaEdit,
    FaCog,
    FaFilter,
    FaSave,
    FaFileContract,
    FaLock,
    FaPrint,
    FaSearch,
    FaFilePdf,
    FaFileExcel,
    FaCreditCard
} from "react-icons/fa";
import { auth, getUserData, getUserType, getAllBookings, getAllReviews, getAllListings, getAllUsers, getAllTransactions, getListing, getWalletBalance, saveRulesAndRegulations, getRulesAndRegulations, saveCancellationRules, getCancellationRules, approveWithdrawal, rejectWithdrawal, savePlatformFeePercentage, getPlatformFeePercentage, getFeeTransactions, getFeeStatistics, saveTermsAndConditions, getTermsAndConditions, savePrivacyPolicy, getPrivacyPolicy } from "../../Config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import UserDetails from "../components/UserDetails";
import EWallet from "../components/EWallet";
import logo from "../assets/logo.png";

const Adminpage = () => {
    const [activeTab, setActiveTab] = useState("analytics");
    const [reviewsSubTab, setReviewsSubTab] = useState("best");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [userType, setUserType] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [profilePicError, setProfilePicError] = useState(false);
    
    // Data states
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyticsStats, setAnalyticsStats] = useState([]);
    
    // Policy states
    const [cancellationRules, setCancellationRules] = useState({
        freeCancellation: true,
        freeCancellationDays: 7,
        partialRefundDays: 3,
        noRefundDays: 1
    });
    const [regulations, setRegulations] = useState("");
    const [termsAndConditions, setTermsAndConditions] = useState("");
    const [privacyPolicy, setPrivacyPolicy] = useState("");
    const [policySubTab, setPolicySubTab] = useState("terms");
    
    // Platform Fee states
    const [platformFeePercentage, setPlatformFeePercentage] = useState(7.5);
    const [hostSharePercentage, setHostSharePercentage] = useState(92.5);
    const [editingFee, setEditingFee] = useState(false);
    const [feeTransactions, setFeeTransactions] = useState([]);
    const [feeStatistics, setFeeStatistics] = useState({
        totalFees: 0,
        thisMonthFees: 0,
        lastMonthFees: 0,
        pendingTransfers: 0
    });
    const [loadingFees, setLoadingFees] = useState(false);
    const [processingTransactionId, setProcessingTransactionId] = useState(null);
    const [transactionMessage, setTransactionMessage] = useState({ type: '', text: '' });
    
    // Report Generation states
    const [selectedReportType, setSelectedReportType] = useState("financial");
    const [reportStartDate, setReportStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [reportEndDate, setReportEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);
    const [reportData, setReportData] = useState([]);
    const [reportSummary, setReportSummary] = useState({
        totalRevenue: 0,
        platformFees: 0,
        totalPayouts: 0,
        netRevenue: 0
    });
    const [reportFilters, setReportFilters] = useState({
        search: "",
        status: "All",
        minAmount: "",
        maxAmount: ""
    });
    const [generatingReport, setGeneratingReport] = useState(false);

    // Function to fetch and update user data
    const fetchUserData = async (user) => {
        if (user) {
            try {
                const userData = await getUserData(user.uid);
                if (userData) {
                    const profilePicture = userData.ProfilePicture || user.photoURL || "";
                    setUsername(userData.Username || user.displayName || "");
                    setProfilePic(profilePicture);
                    setProfilePicError(false);
                    const type = await getUserType(user.uid);
                    setUserType(type || "admin");
                } else {
                    setUsername(user.displayName || "");
                    setProfilePic(user.photoURL || "");
                    setUserType("admin");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUsername(user.displayName || "");
                setProfilePic(user.photoURL || "");
                setUserType("admin");
            }
        }
    };

    // Fetch all admin data
    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [bookingsData, reviewsData, listingsData, usersData, transactionsData] = await Promise.all([
                getAllBookings(),
                getAllReviews(),
                getAllListings(),
                getAllUsers(),
                getAllTransactions()
            ]);

            setBookings(bookingsData);
            setReviews(reviewsData);
            setListings(listingsData);
            setUsers(usersData);
            setTransactions(transactionsData);

            // Calculate analytics stats
            const totalRevenue = bookingsData
                .filter(b => b.status === "active" && b.totalAmount)
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            
            // Calculate this month's revenue
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const thisMonthRevenue = bookingsData
                .filter(b => {
                    if (!b.checkIn || b.status !== "active" || !b.totalAmount) return false;
                    const checkInDate = b.checkIn.toDate ? b.checkIn.toDate() : new Date(b.checkIn);
                    return checkInDate >= firstDayOfMonth;
                })
                .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            
            const activeListings = listingsData.filter(l => !l.isDraft).length;
            const totalListings = listingsData.length;
            const activeUsers = usersData.filter(u => u.UserType === "guest" || u.UserType === "host").length;
            const totalUsers = usersData.length;
            const avgRating = reviewsData.length > 0
                ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length
                : 0;
            
            // Calculate booking status counts
            const activeBookings = bookingsData.filter(b => b.status === "active").length;
            const pendingBookings = bookingsData.filter(b => b.status === "pending").length;
            const canceledBookings = bookingsData.filter(b => b.status === "canceled" || b.status === "cancel_requested").length;
            const totalBookings = bookingsData.length;

            setAnalyticsStats([
                { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FaDollarSign, color: "bg-green-500", change: `₱${thisMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month` },
                { label: "Total Bookings", value: totalBookings.toString(), icon: FaCalendarAlt, color: "bg-blue-500", change: `${activeBookings} active, ${pendingBookings} pending` },
                { label: "Active Users", value: activeUsers.toString(), icon: FaUsers, color: "bg-purple-500", change: `${totalUsers} total users` },
                { label: "Active Listings", value: activeListings.toString(), icon: FaHome, color: "bg-orange-500", change: `${totalListings} total listings` },
                { label: "Average Rating", value: avgRating > 0 ? avgRating.toFixed(1) : "N/A", icon: FaStar, color: "bg-yellow-500", change: `${reviewsData.length} total reviews` },
                { label: "Total Reviews", value: reviewsData.length.toString(), icon: FaChartLine, color: "bg-indigo-500", change: `${canceledBookings} canceled bookings` },
            ]);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            await fetchUserData(user);
        });

        const handleProfileUpdate = async (event) => {
            const user = auth.currentUser;
            if (user) {
                setTimeout(async () => {
                    await fetchUserData(user);
                }, 500);
            }
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => {
            unsubscribe();
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    // Fetch admin data when tab changes
    useEffect(() => {
        if (activeTab === "analytics" || activeTab === "reviews" || activeTab === "bookings" || activeTab === "payments") {
            fetchAdminData();
        }
        if (activeTab === "policies") {
            fetchPolicyData();
        }
        if (activeTab === "serviceFees") {
            fetchServiceFeesData();
        }
    }, [activeTab]);
    
    // Fetch service fees data
    const fetchServiceFeesData = async () => {
        try {
            setLoadingFees(true);
            const [feeConfig, transactions, statistics] = await Promise.all([
                getPlatformFeePercentage(),
                getFeeTransactions(),
                getFeeStatistics()
            ]);
            
            setPlatformFeePercentage(feeConfig.percentage);
            setHostSharePercentage(feeConfig.hostShare);
            setFeeTransactions(transactions);
            setFeeStatistics(statistics);
        } catch (error) {
            console.error("Error fetching service fees data:", error);
        } finally {
            setLoadingFees(false);
        }
    };

    // Fetch policy data (rules & regulations, cancellation rules, terms & conditions, privacy policy)
    const fetchPolicyData = async () => {
        try {
            const [regulationsData, cancellationRulesData, termsData, privacyData] = await Promise.all([
                getRulesAndRegulations(),
                getCancellationRules(),
                getTermsAndConditions(),
                getPrivacyPolicy()
            ]);
            setRegulations(regulationsData);
            setCancellationRules(cancellationRulesData);
            setTermsAndConditions(termsData);
            setPrivacyPolicy(privacyData);
        } catch (error) {
            console.error("Error fetching policy data:", error);
        }
    };
    
    // Print all policies
    const handlePrintAllPolicies = () => {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>ReserGo - All Policies</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
                    h2 { color: #1e40af; margin-top: 30px; }
                    .section { margin-bottom: 40px; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>ReserGo - All Policies</h1>
                <p><strong>Printed on:</strong> ${new Date().toLocaleString()}</p>
                
                <div class="section">
                    <h2>Terms & Conditions</h2>
                    <div>${termsAndConditions || 'No terms & conditions set.'}</div>
                </div>
                
                <div class="section">
                    <h2>Rules & Regulations</h2>
                    <div>${regulations || 'No rules & regulations set.'}</div>
                </div>
                
                <div class="section">
                    <h2>Privacy Policy</h2>
                    <div>${privacyPolicy || 'No privacy policy set.'}</div>
                </div>
                
                <div class="section">
                    <h2>Cancellation Rules</h2>
                    <div>
                        <p><strong>Free Cancellation:</strong> ${cancellationRules.freeCancellation ? 'Enabled' : 'Disabled'}</p>
                        ${cancellationRules.freeCancellation ? `
                            <p><strong>Free Cancellation Days:</strong> ${cancellationRules.freeCancellationDays} days before check-in</p>
                            <p><strong>Partial Refund Days:</strong> ${cancellationRules.partialRefundDays} days before check-in</p>
                            <p><strong>No Refund Days:</strong> ${cancellationRules.noRefundDays} days before check-in</p>
                        ` : ''}
                    </div>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
    
    // Save all policies
    const handleSaveAllPolicies = async () => {
        try {
            const promises = [];
            
            if (policySubTab === "terms") {
                promises.push(saveTermsAndConditions(termsAndConditions));
            } else if (policySubTab === "regulations") {
                promises.push(saveRulesAndRegulations(regulations));
            } else if (policySubTab === "privacy") {
                promises.push(savePrivacyPolicy(privacyPolicy));
            }
            
            await Promise.all(promises);
            alert("Changes saved successfully!");
        } catch (error) {
            console.error("Error saving policies:", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    // State for formatted reviews
    const [formattedBestReviews, setFormattedBestReviews] = useState([]);
    const [formattedLowestReviews, setFormattedLowestReviews] = useState([]);

    // Format reviews with user and listing data
    useEffect(() => {
        const formatReviews = async () => {
            const best = reviews.filter(r => r.rating === 5).slice(0, 20);
            const lowest = reviews.filter(r => r.rating <= 2).slice(0, 20);

            const formattedBest = await Promise.all(best.map(async (review) => {
                try {
                    const [guestData, listingData] = await Promise.all([
                        getUserData(review.guestId).catch(() => null),
                        getListing(review.listingId).catch(() => null)
                    ]);
                    return {
                        ...review,
                        guest: guestData?.Username || "Guest",
                        listing: listingData?.title || "Unknown Listing",
                        date: review.createdAt?.toDate().toLocaleDateString() || "N/A"
                    };
                } catch (error) {
                    return {
                        ...review,
                        guest: "Guest",
                        listing: "Unknown Listing",
                        date: review.createdAt?.toDate().toLocaleDateString() || "N/A"
                    };
                }
            }));

            const formattedLowest = await Promise.all(lowest.map(async (review) => {
                try {
                    const [guestData, listingData] = await Promise.all([
                        getUserData(review.guestId).catch(() => null),
                        getListing(review.listingId).catch(() => null)
                    ]);
                    return {
                        ...review,
                        guest: guestData?.Username || "Guest",
                        listing: listingData?.title || "Unknown Listing",
                        date: review.createdAt?.toDate().toLocaleDateString() || "N/A"
                    };
                } catch (error) {
                    return {
                        ...review,
                        guest: "Guest",
                        listing: "Unknown Listing",
                        date: review.createdAt?.toDate().toLocaleDateString() || "N/A"
                    };
                }
            }));

            setFormattedBestReviews(formattedBest);
            setFormattedLowestReviews(formattedLowest);
        };

        if (reviews.length > 0) {
            formatReviews();
        }
    }, [reviews]);

    // State for formatted bookings
    const [formattedBookings, setFormattedBookings] = useState([]);

    // Format booking data with user names
    useEffect(() => {
        const formatBookings = async () => {
            const formatted = await Promise.all(bookings.map(async (booking) => {
                try {
                    const [guestData, hostData, listingData] = await Promise.all([
                        getUserData(booking.guestId).catch(() => null),
                        getUserData(booking.hostId).catch(() => null),
                        getListing(booking.listingId).catch(() => null)
                    ]);
                    
                    return {
                        ...booking,
                        guestName: guestData?.Username || "Guest",
                        hostName: hostData?.Username || "Host",
                        listingTitle: listingData?.title || "Unknown Listing",
                        checkInDate: booking.checkIn?.toDate().toLocaleDateString() || "N/A",
                        checkOutDate: booking.checkOut?.toDate().toLocaleDateString() || "N/A",
                        amount: `₱${(booking.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    };
                } catch (error) {
                    return {
                        ...booking,
                        guestName: "Guest",
                        hostName: "Host",
                        listingTitle: "Unknown Listing",
                        checkInDate: booking.checkIn?.toDate().toLocaleDateString() || "N/A",
                        checkOutDate: booking.checkOut?.toDate().toLocaleDateString() || "N/A",
                        amount: `₱${(booking.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    };
                }
            }));
            setFormattedBookings(formatted);
        };

        if (bookings.length > 0) {
            formatBookings();
        }
    }, [bookings]);

    // Generate report data based on type and date range
    const generateReportData = async () => {
        try {
            setGeneratingReport(true);
            const startDate = new Date(reportStartDate);
            const endDate = new Date(reportEndDate);
            endDate.setHours(23, 59, 59, 999); // Include full end date
            
            let data = [];
            let summary = {
                totalRevenue: 0,
                platformFees: 0,
                totalPayouts: 0,
                netRevenue: 0
            };
            
            if (selectedReportType === "financial") {
                // Get bookings within date range
                const filteredBookings = bookings.filter(booking => {
                    const bookingDate = booking.createdAt?.toDate() || new Date(0);
                    return bookingDate >= startDate && bookingDate <= endDate;
                });
                
                // Get platform fee percentage
                const feeConfig = await getPlatformFeePercentage();
                const platformFeePercent = feeConfig.percentage;
                
                // Process bookings for financial report
                data = filteredBookings.map(booking => {
                    const bookingDate = booking.createdAt?.toDate() || new Date();
                    const amount = booking.totalAmount || 0;
                    const platformFee = (amount * platformFeePercent) / 100;
                    const hostPayout = amount - platformFee;
                    
                    return {
                        id: booking.id,
                        amount: amount,
                        status: booking.status === "active" ? "confirmed" : booking.status === "cancel_requested" || booking.status === "canceled" ? "cancelled" : booking.status,
                        date: bookingDate
                    };
                });
                
                // Calculate summary
                const confirmedBookings = data.filter(b => b.status === "confirmed");
                summary.totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.amount, 0);
                summary.platformFees = (summary.totalRevenue * platformFeePercent) / 100;
                summary.totalPayouts = confirmedBookings.reduce((sum, b) => {
                    const fee = (b.amount * platformFeePercent) / 100;
                    return sum + (b.amount - fee);
                }, 0);
                summary.netRevenue = summary.platformFees;
                
            } else if (selectedReportType === "booking") {
                const filteredBookings = bookings.filter(booking => {
                    const bookingDate = booking.createdAt?.toDate() || new Date(0);
                    return bookingDate >= startDate && bookingDate <= endDate;
                });
                
                data = filteredBookings.map(booking => ({
                    id: booking.id,
                    guestName: booking.guestName || "Guest",
                    hostName: booking.hostName || "Host",
                    listingTitle: booking.listingTitle || "Unknown",
                    checkIn: booking.checkIn?.toDate() || null,
                    checkOut: booking.checkOut?.toDate() || null,
                    amount: booking.totalAmount || 0,
                    status: booking.status
                }));
                
            } else if (selectedReportType === "user") {
                data = users.map(user => ({
                    id: user.id,
                    username: user.Username || "N/A",
                    email: user.googleAcc || user.Email || "N/A",
                    userType: user.UserType || "N/A",
                    phoneNumber: user.Number || "N/A"
                }));
                
            } else if (selectedReportType === "listing") {
                data = listings.filter(l => !l.isDraft).map(listing => ({
                    id: listing.id,
                    title: listing.title || "Untitled",
                    category: listing.category || "Home",
                    rate: listing.rate || 0,
                    rating: listing.rating || 0,
                    reviewsCount: listing.reviewsCount || 0,
                    hostId: listing.hostId
                }));
                
            } else if (selectedReportType === "review") {
                const filteredReviews = reviews.filter(review => {
                    const reviewDate = review.createdAt?.toDate() || new Date(0);
                    return reviewDate >= startDate && reviewDate <= endDate;
                });
                
                data = filteredReviews.map(review => ({
                    id: review.id,
                    guestName: review.guestName || "Guest",
                    listingTitle: review.listingId, // You might want to fetch the actual listing title
                    rating: review.rating || 0,
                    comment: review.comment || "",
                    date: review.createdAt?.toDate() || new Date()
                }));
                
            } else if (selectedReportType === "transaction") {
                const filteredTransactions = transactions.filter(transaction => {
                    const transactionDate = transaction.createdAt?.toDate() || new Date(0);
                    return transactionDate >= startDate && transactionDate <= endDate;
                });
                
                data = filteredTransactions.map(transaction => ({
                    id: transaction.id,
                    userId: transaction.userId,
                    type: transaction.type,
                    amount: transaction.amount || 0,
                    description: transaction.description || "",
                    status: transaction.status || "completed",
                    date: transaction.createdAt?.toDate() || new Date()
                }));
            }
            
            setReportData(data);
            setReportSummary(summary);
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setGeneratingReport(false);
        }
    };
    
    // Filter report data
    const getFilteredReportData = () => {
        let filtered = [...reportData];
        
        if (selectedReportType === "financial") {
            // Apply filters for financial report
            if (reportFilters.search) {
                const searchLower = reportFilters.search.toLowerCase();
                filtered = filtered.filter(item => 
                    item.id.toLowerCase().includes(searchLower)
                );
            }
            
            if (reportFilters.status !== "All") {
                filtered = filtered.filter(item => item.status === reportFilters.status.toLowerCase());
            }
            
            if (reportFilters.minAmount) {
                const min = parseFloat(reportFilters.minAmount);
                filtered = filtered.filter(item => item.amount >= min);
            }
            
            if (reportFilters.maxAmount) {
                const max = parseFloat(reportFilters.maxAmount);
                filtered = filtered.filter(item => item.amount <= max);
            }
        }
        
        return filtered;
    };
    
    // Export to CSV
    const exportToCSV = () => {
        try {
            const filtered = getFilteredReportData();
            let csvContent = "";
            let filename = "";
            
            if (selectedReportType === "financial") {
                csvContent = "ID,Amount,Status,Date\n";
                filtered.forEach(item => {
                    const date = item.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    csvContent += `${item.id},₱${item.amount.toFixed(2)},${item.status},${date}\n`;
                });
                filename = `financial-report-${reportStartDate}-to-${reportEndDate}.csv`;
            } else if (selectedReportType === "booking") {
                csvContent = "ID,Guest,Host,Listing,Check-in,Check-out,Amount,Status\n";
                filtered.forEach(item => {
                    const checkIn = item.checkIn ? item.checkIn.toLocaleDateString() : "N/A";
                    const checkOut = item.checkOut ? item.checkOut.toLocaleDateString() : "N/A";
                    csvContent += `${item.id},${item.guestName},${item.hostName},${item.listingTitle},${checkIn},${checkOut},₱${item.amount.toFixed(2)},${item.status}\n`;
                });
                filename = `booking-report-${reportStartDate}-to-${reportEndDate}.csv`;
            } else if (selectedReportType === "user") {
                csvContent = "ID,Username,Email,User Type,Phone Number\n";
                filtered.forEach(item => {
                    csvContent += `${item.id},${item.username},${item.email},${item.userType},${item.phoneNumber}\n`;
                });
                filename = `user-report-${new Date().toISOString().split('T')[0]}.csv`;
            } else if (selectedReportType === "listing") {
                csvContent = "ID,Title,Category,Rate,Rating,Reviews Count\n";
                filtered.forEach(item => {
                    csvContent += `${item.id},${item.title},${item.category},₱${item.rate.toFixed(2)},${item.rating.toFixed(1)},${item.reviewsCount}\n`;
                });
                filename = `listing-report-${new Date().toISOString().split('T')[0]}.csv`;
            } else if (selectedReportType === "review") {
                csvContent = "ID,Guest,Listing,Rating,Comment,Date\n";
                filtered.forEach(item => {
                    const date = item.date.toLocaleDateString();
                    csvContent += `${item.id},${item.guestName},${item.listingTitle},${item.rating},${(item.comment || "").replace(/,/g, ";")},${date}\n`;
                });
                filename = `review-report-${reportStartDate}-to-${reportEndDate}.csv`;
            } else if (selectedReportType === "transaction") {
                csvContent = "ID,User ID,Type,Amount,Description,Status,Date\n";
                filtered.forEach(item => {
                    const date = item.date.toLocaleDateString();
                    csvContent += `${item.id},${item.userId},${item.type},₱${item.amount.toFixed(2)},${item.description},${item.status},${date}\n`;
                });
                filename = `transaction-report-${reportStartDate}-to-${reportEndDate}.csv`;
            }
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting CSV:", error);
            alert("Failed to export CSV. Please try again.");
        }
    };
    
    // Export to PDF
    const exportToPDF = () => {
        try {
            const filtered = getFilteredReportData();
            const printWindow = window.open('', '_blank');
            
            let reportTitle = "";
            switch (selectedReportType) {
                case "financial": reportTitle = "Financial Reports"; break;
                case "booking": reportTitle = "Booking Reports"; break;
                case "user": reportTitle = "User Reports"; break;
                case "listing": reportTitle = "Listing Reports"; break;
                case "review": reportTitle = "Review Reports"; break;
                case "transaction": reportTitle = "Transaction Reports"; break;
            }
            
            let tableContent = "";
            if (selectedReportType === "financial") {
                tableContent = `
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">ID</th>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Amount</th>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Status</th>
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(item => {
                                const date = item.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                                return `
                                    <tr>
                                        <td style="padding: 8px; border: 1px solid #ddd;">${item.id.substring(0, 12)}...</td>
                                        <td style="padding: 8px; border: 1px solid #ddd;">₱${item.amount.toFixed(2)}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd;">${item.status}</td>
                                        <td style="padding: 8px; border: 1px solid #ddd;">${date}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${reportTitle} - ReserGo</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #2563eb; margin-bottom: 10px; }
                        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                        .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                        .summary-label { font-size: 12px; color: #666; margin-bottom: 5px; }
                        .summary-value { font-size: 20px; font-weight: bold; color: #333; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${reportTitle}</h1>
                    <p><strong>Date Range:</strong> ${reportStartDate} to ${reportEndDate}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                    
                    ${selectedReportType === "financial" ? `
                        <div class="summary">
                            <div class="summary-card">
                                <div class="summary-label">TOTAL REVENUE</div>
                                <div class="summary-value">₱${reportSummary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">PLATFORM FEES</div>
                                <div class="summary-value">₱${reportSummary.platformFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">TOTAL PAYOUTS</div>
                                <div class="summary-value">₱${reportSummary.totalPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">NET REVENUE</div>
                                <div class="summary-value">₱${reportSummary.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${tableContent}
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                        Total Records: ${filtered.length}
                    </p>
                </body>
                </html>
            `;
            
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("Failed to export PDF. Please try again.");
        }
    };

    // Calculate rating distribution using useMemo
    const ratingDistribution = useMemo(() => {
        return [5, 4, 3, 2, 1].map(rating => {
            const count = reviews.filter(r => r.rating === rating).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return { rating, count, percentage };
        });
    }, [reviews]);

    const navigationItems = [
        { id: "analytics", label: "Analytics", icon: <FaChartLine /> },
        { id: "reviews", label: "Reviews", icon: <FaStar /> },
        { id: "bookings", label: "Bookings", icon: <FaCalendarAlt /> },
        { id: "policies", label: "Policy & Compliance", icon: <FaShieldAlt /> },
        { id: "reports", label: "Reports", icon: <FaFileAlt /> },
        { id: "payments", label: "Payments", icon: <FaDollarSign /> },
        { id: "serviceFees", label: "Service Fees", icon: <FaCog /> },
        { id: "settings", label: "Account", icon: <FaUser /> },
    ];

    // Review Card Component
    const ReviewCard = ({ review, isBest = true }) => (
        <div className={`border rounded-lg p-4 ${isBest ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">{review.guest || "Guest"}</h3>
                    <p className="text-sm text-gray-600">{review.listing || "Unknown Listing"}</p>
                </div>
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <FaStar
                            key={i}
                            className={`text-sm ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">{review.rating || 0}/5</span>
                </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{review.comment || "No comment"}</p>
            <p className="text-xs text-gray-500">{review.date || "N/A"}</p>
        </div>
    );

    // Transaction Table Component
    const TransactionTable = ({ transactions, processingTransactionId, setProcessingTransactionId, setTransactionMessage, approveWithdrawal, rejectWithdrawal, getAllTransactions, setTransactions }) => {
        const [transactionUsers, setTransactionUsers] = useState({});
        const [loadingUsers, setLoadingUsers] = useState(true);

        useEffect(() => {
            const fetchUserData = async () => {
                try {
                    setLoadingUsers(true);
                    const userMap = {};
                    const uniqueUserIds = [...new Set(transactions.map(t => t.userId).filter(Boolean))];
                    
                    await Promise.all(uniqueUserIds.map(async (userId) => {
                        try {
                            const userData = await getUserData(userId);
                            userMap[userId] = {
                                username: userData?.Username || "Unknown User",
                                userType: userData?.UserType || "N/A"
                            };
                        } catch (error) {
                            userMap[userId] = {
                                username: "Unknown User",
                                userType: "N/A"
                            };
                        }
                    }));
                    
                    setTransactionUsers(userMap);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoadingUsers(false);
                }
            };

            if (transactions.length > 0) {
                fetchUserData();
            }
        }, [transactions]);

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Username</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">User Type</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Type</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Amount</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingUsers ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-gray-500">Loading user data...</td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-gray-500">No transactions found.</td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => {
                                const userInfo = transactionUsers[transaction.userId] || { username: "Loading...", userType: "N/A" };
                                return (
                                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-900 font-medium">{userInfo.username}</td>
                                        <td className="py-3 px-4 text-gray-700 capitalize">{userInfo.userType}</td>
                                        <td className="py-3 px-4 text-gray-700 capitalize">{transaction.type || "N/A"}</td>
                                        <td className="py-3 px-4 text-gray-900 font-semibold">
                                            ₱{(transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                transaction.status === "completed"
                                                    ? "bg-green-100 text-green-700 border border-green-300"
                                                    : transaction.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                    : "bg-red-100 text-red-700 border border-red-300"
                                            }`}>
                                                {transaction.status || "N/A"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700">
                                            {transaction.timestamp?.toDate ? transaction.timestamp.toDate().toLocaleDateString() : 
                                             transaction.createdAt?.toDate ? transaction.createdAt.toDate().toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                {transaction.status === "pending" && transaction.type === "withdrawal" && (
                                                    <>
                                                        <button
                                                            onClick={async () => {
                                                                const amount = (transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                                const confirmMessage = `Are you sure you want to approve this withdrawal?\n\nAmount: ₱${amount}\nUsername: ${userInfo.username || 'N/A'}\n\nThis will deduct the amount from the user's wallet.`;
                                                                
                                                                if (window.confirm(confirmMessage)) {
                                                                    setProcessingTransactionId(transaction.id);
                                                                    setTransactionMessage({ type: '', text: '' });
                                                                    
                                                                    try {
                                                                        const result = await approveWithdrawal(transaction.id);
                                                                        setTransactionMessage({ 
                                                                            type: 'success', 
                                                                            text: `Withdrawal approved successfully! New wallet balance: ₱${(result.newBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                                                        });
                                                                        
                                                                        // Reload transactions after a short delay
                                                                        setTimeout(async () => {
                                                                            const transactionsData = await getAllTransactions();
                                                                            setTransactions(transactionsData);
                                                                            setTransactionMessage({ type: '', text: '' });
                                                                        }, 1500);
                                                                    } catch (error) {
                                                                        console.error("Error approving withdrawal:", error);
                                                                        setTransactionMessage({ 
                                                                            type: 'error', 
                                                                            text: error.message || "Failed to approve withdrawal. Please check the console for details." 
                                                                        });
                                                                        setTimeout(() => {
                                                                            setTransactionMessage({ type: '', text: '' });
                                                                        }, 5000);
                                                                    } finally {
                                                                        setProcessingTransactionId(null);
                                                                    }
                                                                }
                                                            }}
                                                            disabled={processingTransactionId === transaction.id}
                                                            className={`p-2 text-green-600 hover:bg-green-50 rounded transition ${
                                                                processingTransactionId === transaction.id ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                            title="Approve Withdrawal"
                                                        >
                                                            {processingTransactionId === transaction.id ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                                            ) : (
                                                                <FaCheckCircle />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const amount = (transaction.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                                                const confirmMessage = `Are you sure you want to reject this withdrawal?\n\nAmount: ₱${amount}\nUsername: ${userInfo.username || 'N/A'}\n\nThe user's wallet balance will remain unchanged.`;
                                                                
                                                                if (window.confirm(confirmMessage)) {
                                                                    const reason = window.prompt("Enter rejection reason (optional):\n\nLeave empty for default reason.");
                                                                    if (reason !== null) { // User didn't cancel
                                                                        setProcessingTransactionId(transaction.id);
                                                                        setTransactionMessage({ type: '', text: '' });
                                                                        
                                                                        try {
                                                                            await rejectWithdrawal(transaction.id, reason || "");
                                                                            setTransactionMessage({ 
                                                                                type: 'success', 
                                                                                text: "Withdrawal rejected successfully!" 
                                                                            });
                                                                            
                                                                            // Reload transactions after a short delay
                                                                            setTimeout(async () => {
                                                                                const transactionsData = await getAllTransactions();
                                                                                setTransactions(transactionsData);
                                                                                setTransactionMessage({ type: '', text: '' });
                                                                            }, 1500);
                                                                        } catch (error) {
                                                                            console.error("Error rejecting withdrawal:", error);
                                                                            setTransactionMessage({ 
                                                                                type: 'error', 
                                                                                text: error.message || "Failed to reject withdrawal. Please check the console for details." 
                                                                            });
                                                                            setTimeout(() => {
                                                                                setTransactionMessage({ type: '', text: '' });
                                                                            }, 5000);
                                                                        } finally {
                                                                            setProcessingTransactionId(null);
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                            disabled={processingTransactionId === transaction.id}
                                                            className={`p-2 text-red-600 hover:bg-red-50 rounded transition ${
                                                                processingTransactionId === transaction.id ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                            title="Reject Withdrawal"
                                                        >
                                                            {processingTransactionId === transaction.id ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                            ) : (
                                                                <FaTimesCircle />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar Navigation */}
            <div className={`${
                sidebarOpen 
                    ? 'fixed md:relative w-64 z-50 md:z-auto' 
                    : 'fixed md:relative -translate-x-full md:translate-x-0 w-20 z-50 md:z-auto'
            } bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col overflow-hidden h-full`}>
                {/* Sidebar Header */}
                <div 
                    className={`border-b border-gray-200 flex items-center h-16 relative transition-all duration-300 ${
                        sidebarOpen ? 'px-4' : 'px-2'
                    }`}
                >
                    <div 
                        className={`flex items-center cursor-pointer transition-all duration-300 ${
                            sidebarOpen ? 'gap-3 flex-1' : 'justify-center w-full'
                        }`}
                        onClick={() => !sidebarOpen && setSidebarOpen(true)}
                    >
                        <img src={logo} alt="ReserGo Logo" className="h-8 w-8 flex-shrink-0" />
                        <h2 className={`text-blue-600 font-bold text-lg transition-all duration-300 ease-in-out whitespace-nowrap ${
                            sidebarOpen 
                                ? 'opacity-100 max-w-[200px]' 
                                : 'opacity-0 max-w-0 overflow-hidden'
                        }`}>
                            ReserGo
                        </h2>
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSidebarOpen(false);
                            }}
                            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
                            aria-label="Close sidebar"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className={`flex-1 space-y-2 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
                    sidebarOpen ? 'px-4 py-4' : 'px-2 py-4'
                }`}>
                    {navigationItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 ease-in-out relative ${
                                    sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'
                                } ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md hover:shadow-xl hover:bg-blue-700 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium active:scale-95"
                                }`}
                            >
                                <span className={`text-xl flex-shrink-0 transition-colors duration-200 ${
                                    isActive ? 'text-white' : 'text-gray-600'
                                }`}>
                                    {item.icon}
                                </span>
                                <span className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
                                    sidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'
                                } ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full shadow-sm"></div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="h-16 border-t border-gray-200 flex items-center overflow-hidden">
                    <div className={`w-full ${sidebarOpen ? 'px-4' : 'px-2'}`}>
                        <button
                            onClick={async () => {
                                try {
                                    await signOut(auth);
                                    window.location.href = "/";
                                } catch (error) {
                                    console.error("Error signing out:", error);
                                }
                            }}
                            className={`w-full flex items-center h-10 rounded-lg transition-all duration-300 ease-in-out text-red-600 hover:bg-red-50 hover:text-red-700 ${
                                sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'
                            }`}
                        >
                            <FaPowerOff className="text-xl flex-shrink-0" />
                            <span className={`font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${
                                sidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'
                            }`}>
                                Log out
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 w-full md:w-auto">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 h-16 px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                            aria-label="Toggle menu"
                        >
                            <FaBars className="text-xl text-gray-700" />
                        </button>
                        <h1 className="text-gray-900 text-lg md:text-2xl font-semibold">
                            {activeTab === "analytics" ? "Analytics" : 
                             activeTab === "reviews" ? "Reviews" :
                             activeTab === "bookings" ? "Bookings" :
                             activeTab === "policies" ? "Policy & Compliance" :
                             activeTab === "reports" ? "Reports" :
                             activeTab === "payments" ? "Payments" :
                             activeTab === "serviceFees" ? "Service Fees" :
                             activeTab === "settings" ? "Account" : "Admin Dashboard"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {username && (
                            <div className="flex items-end gap-3 pr-4">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold text-gray-900">{username}</p>
                                    <p className="text-xs text-gray-600 capitalize">{userType || "admin"}</p>
                                </div>
                                {profilePic && profilePic.trim() !== "" && !profilePicError ? (
                                    <img 
                                        src={profilePic} 
                                        alt="Profile" 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                        onError={() => {
                                            setProfilePicError(true);
                                        }}
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                        <FaUser className="text-white text-sm" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {loading && activeTab !== "settings" && activeTab !== "serviceFees" && activeTab !== "reports" && (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {!loading && activeTab === "analytics" && (
                        <div className="space-y-6">
                            {/* Analytics Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {analyticsStats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={index} className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                                                    <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
                                                </div>
                                                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                                                    <Icon className="text-xl md:text-2xl" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-gray-600 text-sm">{stat.change}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Rating Distribution */}
                                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                                    <div className="space-y-2">
                                        {ratingDistribution.map(({ rating, count, percentage }) => (
                                            <div key={rating} className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600 w-16 text-right">{count} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Booking Status Distribution */}
                                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Booking Status</h3>
                                    <div className="space-y-3">
                                        {["active", "pending", "canceled", "cancel_requested"].map(status => {
                                            const count = bookings.filter(b => b.status === status).length;
                                            const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                                            return (
                                                <div key={status} className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700 capitalize">{status.replace("_", " ")}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${
                                                                    status === "active" ? "bg-green-500" :
                                                                    status === "pending" ? "bg-yellow-500" :
                                                                    "bg-red-500"
                                                                }`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {!loading && activeTab === "reviews" && (
                        <div className="space-y-6">
                            {/* Tab Navigation for Reviews */}
                            <div className="flex gap-4 border-b border-gray-200">
                                <button
                                    onClick={() => setReviewsSubTab("best")}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                                        reviewsSubTab === "best"
                                            ? "border-blue-600 text-blue-600 font-semibold"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <FaStar />
                                    <span>Best Reviews</span>
                                </button>
                                <button
                                    onClick={() => setReviewsSubTab("lowest")}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                                        reviewsSubTab === "lowest"
                                            ? "border-blue-600 text-blue-600 font-semibold"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <FaThumbsDown />
                                    <span>Lowest Reviews</span>
                                </button>
                            </div>

                            {/* Best Reviews */}
                            {reviewsSubTab === "best" && (
                                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Best Reviews (5 Stars)</h2>
                                    {formattedBestReviews.length === 0 ? (
                                        <p className="text-center py-8 text-gray-500">No 5-star reviews yet.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {formattedBestReviews.map((review) => (
                                                <ReviewCard key={review.id} review={review} isBest={true} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Lowest Reviews */}
                            {reviewsSubTab === "lowest" && (
                                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Lowest Reviews (1-2 Stars)</h2>
                                    {formattedLowestReviews.length === 0 ? (
                                        <p className="text-center py-8 text-gray-500">No low-rated reviews.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {formattedLowestReviews.map((review) => (
                                                <ReviewCard key={review.id} review={review} isBest={false} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bookings Tab */}
                    {!loading && activeTab === "bookings" && (
                        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">All Bookings</h2>
                            {bookings.length === 0 ? (
                                <p className="text-center py-8 text-gray-500">No bookings found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Guest</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Listing</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Host</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check-in</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Check-out</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Amount</th>
                                                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formattedBookings.length > 0 ? formattedBookings.map((booking) => (
                                                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-900 font-medium">{booking.guestName || "Guest"}</td>
                                                    <td className="py-3 px-4 text-gray-700">{booking.listingTitle || "Unknown"}</td>
                                                    <td className="py-3 px-4 text-gray-700">{booking.hostName || "Host"}</td>
                                                    <td className="py-3 px-4 text-gray-700">{booking.checkInDate || "N/A"}</td>
                                                    <td className="py-3 px-4 text-gray-700">{booking.checkOutDate || "N/A"}</td>
                                                    <td className="py-3 px-4 text-gray-900 font-semibold">{booking.amount || "₱0.00"}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            booking.status === "active"
                                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                                : booking.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                                : booking.status === "cancel_requested"
                                                                ? "bg-orange-100 text-orange-700 border border-orange-300"
                                                                : "bg-red-100 text-red-700 border border-red-300"
                                                        }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="7" className="py-8 text-center text-gray-500">Loading bookings...</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Policy & Compliance Tab */}
                    {activeTab === "policies" && (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-blue-600 mb-2">Policy & Compliance</h1>
                                    <p className="text-gray-600">Manage terms, regulations, and privacy policy</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handlePrintAllPolicies}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        <FaPrint />
                                        <span>Print All Policies</span>
                                    </button>
                                    <button
                                        onClick={handleSaveAllPolicies}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <FaSave />
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex gap-4 border-b border-gray-200">
                                <button
                                    onClick={() => setPolicySubTab("terms")}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                                        policySubTab === "terms"
                                            ? "border-blue-600 text-blue-600 font-semibold"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <FaFileContract />
                                    <span>Terms & Conditions</span>
                                </button>
                                <button
                                    onClick={() => setPolicySubTab("regulations")}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                                        policySubTab === "regulations"
                                            ? "border-blue-600 text-blue-600 font-semibold"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <FaShieldAlt />
                                    <span>Rules & Regulations</span>
                                </button>
                                <button
                                    onClick={() => setPolicySubTab("privacy")}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                                        policySubTab === "privacy"
                                            ? "border-blue-600 text-blue-600 font-semibold"
                                            : "border-transparent text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <FaLock />
                                    <span>Privacy Policy</span>
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                {policySubTab === "terms" && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
                                        <textarea
                                            value={termsAndConditions}
                                            onChange={(e) => setTermsAndConditions(e.target.value)}
                                            placeholder="Enter terms and conditions..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[500px] resize-y"
                                        />
                                    </div>
                                )}

                                {policySubTab === "regulations" && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Rules & Regulations</h2>
                                        <textarea
                                            value={regulations}
                                            onChange={(e) => setRegulations(e.target.value)}
                                            placeholder="Enter rules and regulations..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[500px] resize-y"
                                        />
                                    </div>
                                )}

                                {policySubTab === "privacy" && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Policy</h2>
                                        <textarea
                                            value={privacyPolicy}
                                            onChange={(e) => setPrivacyPolicy(e.target.value)}
                                            placeholder="Enter privacy policy..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[500px] resize-y"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Cancellation Rules Section */}
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Cancellation Rules</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={cancellationRules.freeCancellation}
                                            onChange={(e) => setCancellationRules({...cancellationRules, freeCancellation: e.target.checked})}
                                            className="w-5 h-5 text-blue-600 rounded"
                                        />
                                        <label className="text-gray-700 font-medium">Enable Free Cancellation</label>
                                    </div>
                                    {cancellationRules.freeCancellation && (
                                        <div className="ml-8 space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Free Cancellation Days (before check-in)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={cancellationRules.freeCancellationDays}
                                                    onChange={(e) => setCancellationRules({...cancellationRules, freeCancellationDays: parseInt(e.target.value) || 0})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Partial Refund Days (before check-in)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={cancellationRules.partialRefundDays}
                                                    onChange={(e) => setCancellationRules({...cancellationRules, partialRefundDays: parseInt(e.target.value) || 0})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    No Refund Days (before check-in)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={cancellationRules.noRefundDays}
                                                    onChange={(e) => setCancellationRules({...cancellationRules, noRefundDays: parseInt(e.target.value) || 0})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={async () => {
                                            try {
                                                await saveCancellationRules(cancellationRules);
                                                alert("Cancellation rules saved successfully!");
                                            } catch (error) {
                                                console.error("Error saving cancellation rules:", error);
                                                alert("Failed to save cancellation rules. Please try again.");
                                            }
                                        }}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Save Rules
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === "reports" && (
                        <div className="space-y-6">
                            {/* Header */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Generation</h1>
                                <p className="text-gray-600">Generate and export comprehensive platform reports</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Report Type Selection */}
                                <div className="lg:col-span-1">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h2>
                                    <div className="space-y-3">
                                        {[
                                            { id: "financial", label: "Financial Reports", icon: <FaDollarSign />, description: "Revenue, fees, payouts" },
                                            { id: "booking", label: "Booking Reports", icon: <FaCalendarAlt />, description: "Booking statistics and trends" },
                                            { id: "user", label: "User Reports", icon: <FaUsers />, description: "User growth and activity" },
                                            { id: "listing", label: "Listing Reports", icon: <FaHome />, description: "Listing performance metrics" },
                                            { id: "review", label: "Review Reports", icon: <FaStar />, description: "Review analytics and ratings" },
                                            { id: "transaction", label: "Transaction Reports", icon: <FaCreditCard />, description: "All transaction records" }
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => {
                                                    setSelectedReportType(type.id);
                                                    setReportData([]);
                                                    setReportSummary({ totalRevenue: 0, platformFees: 0, totalPayouts: 0, netRevenue: 0 });
                                                }}
                                                className={`w-full flex items-start gap-3 p-4 rounded-lg border-2 transition text-left ${
                                                    selectedReportType === type.id
                                                        ? "border-blue-600 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className={`text-2xl ${selectedReportType === type.id ? "text-blue-600" : "text-gray-600"}`}>
                                                    {type.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold mb-1 ${selectedReportType === type.id ? "text-blue-600" : "text-gray-900"}`}>
                                                        {type.label}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{type.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Configuration, Summary, and Preview */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Report Configuration */}
                                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={reportStartDate}
                                                            onChange={(e) => setReportStartDate(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={reportEndDate}
                                                            onChange={(e) => setReportEndDate(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={generateReportData}
                                                    disabled={generatingReport}
                                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FaFileAlt />
                                                    <span>Generate Report</span>
                                                </button>
                                                <button
                                                    onClick={exportToCSV}
                                                    disabled={reportData.length === 0}
                                                    className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FaFileExcel />
                                                    <span>Export CSV</span>
                                                </button>
                                                <button
                                                    onClick={exportToPDF}
                                                    disabled={reportData.length === 0}
                                                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <FaFilePdf />
                                                    <span>Export PDF</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Report Summary (for Financial Reports) */}
                                    {selectedReportType === "financial" && reportData.length > 0 && (
                                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h2>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <p className="text-xs text-gray-600 mb-1">TOTAL REVENUE</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        ₱{reportSummary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <p className="text-xs text-gray-600 mb-1">PLATFORM FEES</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        ₱{reportSummary.platformFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <p className="text-xs text-gray-600 mb-1">TOTAL PAYOUTS</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        ₱{reportSummary.totalPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <p className="text-xs text-gray-600 mb-1">NET REVENUE</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        ₱{reportSummary.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Report Preview */}
                                    {reportData.length > 0 && (
                                        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h2 className="text-lg font-semibold text-gray-900">Report Preview</h2>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Date Range: {reportStartDate} to {reportEndDate}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium text-blue-600">
                                                    {selectedReportType === "financial" ? "$ Financial Reports" :
                                                     selectedReportType === "booking" ? "Booking Reports" :
                                                     selectedReportType === "user" ? "User Reports" :
                                                     selectedReportType === "listing" ? "Listing Reports" :
                                                     selectedReportType === "review" ? "Review Reports" :
                                                     "Transaction Reports"}
                                                </span>
                                            </div>

                                            {/* Filters (for Financial Reports) */}
                                            {selectedReportType === "financial" && (
                                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <FaFilter className="text-gray-600" />
                                                        <h3 className="font-semibold text-gray-900">Filters</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <div className="relative">
                                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search..."
                                                                value={reportFilters.search}
                                                                onChange={(e) => setReportFilters({...reportFilters, search: e.target.value})}
                                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <select
                                                            value={reportFilters.status}
                                                            onChange={(e) => setReportFilters({...reportFilters, status: e.target.value})}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="All">All Status</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                            <option value="pending">Pending</option>
                                                        </select>
                                                        <input
                                                            type="number"
                                                            placeholder="Min Amount"
                                                            value={reportFilters.minAmount}
                                                            onChange={(e) => setReportFilters({...reportFilters, minAmount: e.target.value})}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Max Amount"
                                                            value={reportFilters.maxAmount}
                                                            onChange={(e) => setReportFilters({...reportFilters, maxAmount: e.target.value})}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Report Table */}
                                            <div>
                                                <div className="mb-4 text-sm text-gray-600">
                                                    {selectedReportType === "financial" ? "Bookings" : 
                                                     selectedReportType === "booking" ? "Bookings" :
                                                     selectedReportType === "user" ? "Users" :
                                                     selectedReportType === "listing" ? "Listings" :
                                                     selectedReportType === "review" ? "Reviews" :
                                                     "Transactions"} ({getFilteredReportData().length} of {reportData.length})
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b border-gray-200">
                                                                {selectedReportType === "financial" && (
                                                                    <>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">ID</th>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">AMOUNT</th>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">STATUS</th>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">DATE</th>
                                                                    </>
                                                                )}
                                                                {selectedReportType === "booking" && (
                                                                    <>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">ID</th>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Guest</th>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Host</th>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Listing</th>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Amount</th>
                                                                        <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {getFilteredReportData().map((item) => (
                                                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                                    {selectedReportType === "financial" && (
                                                                        <>
                                                                            <td className="py-3 px-4 text-gray-900 font-mono text-sm">
                                                                                {item.id.substring(0, 12)}...
                                                                            </td>
                                                                            <td className="py-3 px-4 text-gray-900 font-semibold">
                                                                                ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                            </td>
                                                                            <td className="py-3 px-4">
                                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                                    item.status === "confirmed"
                                                                                        ? "bg-green-100 text-green-700 border border-green-300"
                                                                                        : "bg-gray-100 text-gray-700 border border-gray-300"
                                                                                }`}>
                                                                                    {item.status}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-3 px-4 text-gray-700">
                                                                                {item.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                    {selectedReportType === "booking" && (
                                                                        <>
                                                                            <td className="py-3 px-4 text-gray-900 font-mono text-sm">{item.id.substring(0, 12)}...</td>
                                                                            <td className="py-3 px-4 text-gray-700">{item.guestName}</td>
                                                                            <td className="py-3 px-4 text-gray-700">{item.hostName}</td>
                                                                            <td className="py-3 px-4 text-gray-700">{item.listingTitle}</td>
                                                                            <td className="py-3 px-4 text-gray-900 font-semibold">₱{item.amount.toFixed(2)}</td>
                                                                            <td className="py-3 px-4">
                                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                                    item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                                                }`}>
                                                                                    {item.status}
                                                                                </span>
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {reportData.length === 0 && !generatingReport && (
                                        <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center">
                                            <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-600">No report data generated yet. Click "Generate Report" to create a report.</p>
                                        </div>
                                    )}

                                    {/* Loading State */}
                                    {generatingReport && (
                                        <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                            <p className="text-gray-600">Generating report...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {!loading && activeTab === "payments" && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">E-Wallet</h2>
                                <EWallet />
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Review & Confirmation</h2>
                                
                                {/* Transaction Message */}
                                {transactionMessage.text && (
                                    <div className={`mb-4 p-4 rounded-lg border ${
                                        transactionMessage.type === 'success' 
                                            ? 'bg-green-50 border-green-200 text-green-800' 
                                            : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {transactionMessage.type === 'success' ? (
                                                <FaCheckCircle className="text-green-600" />
                                            ) : (
                                                <FaTimesCircle className="text-red-600" />
                                            )}
                                            <p className="text-sm font-medium">{transactionMessage.text}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {transactions.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500">No transactions to review.</p>
                                ) : (
                                    <TransactionTable transactions={transactions} 
                                        processingTransactionId={processingTransactionId}
                                        setProcessingTransactionId={setProcessingTransactionId}
                                        setTransactionMessage={setTransactionMessage}
                                        approveWithdrawal={approveWithdrawal}
                                        rejectWithdrawal={rejectWithdrawal}
                                        getAllTransactions={getAllTransactions}
                                        setTransactions={setTransactions}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Service Fees Tab */}
                    {activeTab === "serviceFees" && (
                        <div className="space-y-6">
                            {/* Platform Fee Configuration */}
                            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <FaCog className="text-purple-600 text-2xl" />
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Platform Fee Configuration</h2>
                                            <p className="text-sm text-gray-600">Set the percentage of booking revenue that goes to the platform</p>
                                        </div>
                                    </div>
                                    {!editingFee && (
                                        <button
                                            onClick={() => setEditingFee(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                        >
                                            <FaEdit />
                                            <span>Edit Percentage</span>
                                        </button>
                                    )}
                                </div>

                                {editingFee ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <label className="text-sm font-medium text-gray-700">Platform Fee Percentage:</label>
                                            <input
                                                type="number"
                                                value={platformFeePercentage}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    setPlatformFeePercentage(value);
                                                    setHostSharePercentage(100 - value);
                                                }}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-32"
                                            />
                                            <span className="text-gray-600">%</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="text-sm font-medium text-gray-700">Host Share Percentage:</label>
                                            <input
                                                type="number"
                                                value={hostSharePercentage}
                                                readOnly
                                                className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 w-32"
                                            />
                                            <span className="text-gray-600">%</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await savePlatformFeePercentage(platformFeePercentage);
                                                        setEditingFee(false);
                                                        alert("Platform fee percentage updated successfully!");
                                                    } catch (error) {
                                                        console.error("Error saving platform fee:", error);
                                                        alert("Failed to save platform fee. Please try again.");
                                                    }
                                                }}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                                            >
                                                <FaSave />
                                                <span>Save</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingFee(false);
                                                    // Reset to original values
                                                    fetchServiceFeesData();
                                                }}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-700">Platform Fee:</span>
                                            <span className="text-2xl font-bold text-purple-600">{platformFeePercentage}%</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-700">Host Share:</span>
                                            <span className="text-2xl font-bold text-green-600">{hostSharePercentage}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Account Settings Tab */}
                    {activeTab === "settings" && (
                        <UserDetails 
                            onBack={async () => {
                                const user = auth.currentUser;
                                if (user) {
                                    await fetchUserData(user);
                                }
                                setActiveTab("analytics");
                            }}
                            hideBackButton={true}
                            isHostPage={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Adminpage;

                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Account Settings Tab */}
                    {activeTab === "settings" && (
                        <UserDetails 
                            onBack={async () => {
                                const user = auth.currentUser;
                                if (user) {
                                    await fetchUserData(user);
                                }
                                setActiveTab("analytics");
                            }}
                            hideBackButton={true}
                            isHostPage={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Adminpage;
