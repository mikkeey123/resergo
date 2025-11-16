import React, { useState, useEffect, useMemo } from "react";
import { 
  FaWifi, 
  FaLock, 
  FaLaptop, 
  FaWind, 
  FaCar, 
  FaSuitcaseRolling,
  FaCalendar,
  FaStar,
  FaMapMarkerAlt,
  FaShare,
  FaHeart,
  FaPhone,
  FaBroom,
  FaCheckCircle,
  FaKey,
  FaComments,
  FaTag,
  FaUtensils,
  FaIceCream,
  FaTv,
  FaTshirt,
  FaDollarSign,
  FaSnowflake,
  FaSwimmingPool,
  FaHotTub,
  FaUmbrella,
  FaFire,
  FaUtensilSpoon,
  FaTable,
  FaChess,
  FaMusic,
  FaDumbbell,
  FaWater,
  FaUmbrellaBeach,
  FaSkiing,
  FaShower,
  FaExclamationTriangle,
  FaFirstAid,
  FaFireExtinguisher,
  FaShieldAlt,
  FaChair,
  FaGamepad,
  FaEdit,
  FaTrash,
  FaUsers,
  FaBed,
  FaBath,
  FaCheck,
  FaClock,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaTimes
} from "react-icons/fa";
import { getListing, getUserData, saveReview, getListingReviews, updateReview, updateListingRating, auth, db, validateCoupon, createBooking } from "../../Config";
import { doc, deleteDoc } from "firebase/firestore";
import ListingMap from "./components/ListingMap";

const ListingDetail = ({ listing, onBack, onNavigateToMessages }) => {
  console.log("ListingDetail component rendered with listing:", listing);
  
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  // Experience/Service booking fields
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingHour, setBookingHour] = useState("12");
  const [bookingMinute, setBookingMinute] = useState("00");
  const [bookingAmPm, setBookingAmPm] = useState("AM");
  const [experienceGroupSize, setExperienceGroupSize] = useState(1);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [fullListingData, setFullListingData] = useState(null);
  const [hostData, setHostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentRating, setCommentRating] = useState(5);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");
  const [updatingReview, setUpdatingReview] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  
  // Amenity icon mapping (matching AddListingModal)
  const amenityIcons = {
    wifi: FaWifi,
    tv: FaTv,
    kitchen: FaUtensils,
    washer: FaTshirt,
    free_parking: FaCar,
    paid_parking: FaDollarSign,
    air_conditioning: FaSnowflake,
    dedicated_workspace: FaLaptop,
    pool: FaSwimmingPool,
    hot_tub: FaHotTub,
    patio: FaUmbrella,
    bbq_grill: FaFire,
    outdoor_dining: FaTable,
    fire_pit: FaFire,
    pool_table: FaGamepad,
    indoor_fireplace: FaFire,
    piano: FaMusic,
    exercise_equipment: FaDumbbell,
    lake_access: FaWater,
    beach_access: FaUmbrellaBeach,
    ski_in_out: FaSkiing,
    outdoor_shower: FaShower,
    smoke_alarm: FaExclamationTriangle,
    first_aid_kit: FaFirstAid,
    fire_extinguisher: FaFireExtinguisher,
    carbon_monoxide_alarm: FaShieldAlt,
  };

  // Helper function to fetch guest data for reviews
  const fetchReviewsWithGuestData = async (listingReviews) => {
    return await Promise.all(
      listingReviews.map(async (review) => {
        try {
          const guestData = await getUserData(review.guestId);
          if (guestData) {
            // Get avatar from multiple sources, prioritize ProfilePicture from guestData
            // Only use existing guestAvatar if it's not a placeholder
            let avatar = null;
            if (guestData.ProfilePicture && guestData.ProfilePicture.trim() !== "" && !guestData.ProfilePicture.includes("placeholder.com")) {
              avatar = guestData.ProfilePicture;
            } else if (guestData.photoURL && guestData.photoURL.trim() !== "" && !guestData.photoURL.includes("placeholder.com")) {
              avatar = guestData.photoURL;
            } else if (review.guestAvatar && review.guestAvatar.trim() !== "" && !review.guestAvatar.includes("placeholder.com")) {
              avatar = review.guestAvatar;
            } else {
              avatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%239ca3af'%3EGuest%3C/text%3E%3C/svg%3E";
            }
            
            console.log("Setting avatar for guest:", {
              guestId: review.guestId,
              username: guestData.Username,
              profilePicture: guestData.ProfilePicture,
              photoURL: guestData.photoURL,
              finalAvatar: avatar
            });
            
            // Update review with latest guest data - prioritize current username from database
            return {
              ...review,
              guestName: guestData.Username || guestData.displayName || review.guestName || "Guest",
              guestAvatar: avatar,
              avatar: avatar // Also set avatar field for consistency
            };
          }
          // If no guest data, ensure we have a placeholder
          return {
            ...review,
            guestAvatar: (review.guestAvatar && review.guestAvatar.trim() !== "")
              ? review.guestAvatar
              : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%239ca3af'%3EGuest%3C/text%3E%3C/svg%3E"
          };
        } catch (error) {
          console.error("Error fetching guest data for review:", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          console.error("Guest ID:", review.guestId);
          // Return review with placeholder if guest data fetch fails
          return {
            ...review,
            guestAvatar: (review.guestAvatar && review.guestAvatar.trim() !== "")
              ? review.guestAvatar
              : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%239ca3af'%3EGuest%3C/text%3E%3C/svg%3E"
          };
        }
      })
    );
  };
  
  // Handle modal photo index sync when opening modal
  useEffect(() => {
    if (showAllPhotos) {
      setModalPhotoIndex(selectedPhotoIndex);
    }
  }, [showAllPhotos, selectedPhotoIndex]);
  
  // Fetch full listing data and host information
  useEffect(() => {
    const fetchListingData = async () => {
      try {
        setLoading(true);
        
        // Get full listing data - use fullListing if available, otherwise fetch by ID
        let listingData = null;
        if (listing?.fullListing) {
          listingData = listing.fullListing;
        } else if (listing?.id) {
          listingData = await getListing(listing.id);
        }
        
        if (listingData) {
          setFullListingData(listingData);
          
          // Initialize guests based on listing's max guests
          const listingMaxGuests = listingData.basics?.guests || 1;
          setGuests(prevGuests => Math.min(prevGuests, listingMaxGuests)); // Don't exceed max, but keep current if valid
          
          // Debug: Log images data
          console.log("Listing images:", listingData.images);
          console.log("Images count:", listingData.images?.length || 0);
          if (listingData.images && listingData.images.length > 0) {
            console.log("First image preview:", listingData.images[0]?.substring(0, 100));
            console.log("First image starts with data:", listingData.images[0]?.startsWith('data:'));
          }
          
          // Debug: Log basics data
          console.log("Listing basics:", listingData.basics);
          console.log("Max guests:", listingData.basics?.guests || 1);
          
          // Fetch host data
          if (listingData.hostId) {
            console.log("Fetching host data for hostId:", listingData.hostId);
            const host = await getUserData(listingData.hostId);
            console.log("Fetched host data:", host);
            console.log("Host Username:", host?.Username);
            console.log("Host ProfilePicture:", host?.ProfilePicture);
            if (host) {
              setHostData(host);
            } else {
              console.warn("No host data found for hostId:", listingData.hostId);
            }
          } else {
            console.warn("No hostId found in listing data");
          }
          
          // Fetch reviews for this listing
          const listingId = listingData.id || listing?.id;
          if (listingId) {
            try {
              const listingReviews = await getListingReviews(listingId);
              
              // Fetch guest data for each review to ensure we have profile pictures
              const reviewsWithGuestData = await fetchReviewsWithGuestData(listingReviews);
              
              setReviews(reviewsWithGuestData);
            } catch (error) {
              console.error("Error fetching reviews:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching listing data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListingData();
  }, [listing]);
  
  // Map amenities to display format with icons
  const mapAmenities = (amenityIds) => {
    if (!amenityIds || !Array.isArray(amenityIds)) return [];
    
    return amenityIds.map(amenityId => {
      const Icon = amenityIcons[amenityId] || FaTag;
      const label = amenityId.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      return {
        id: amenityId,
        name: label,
        icon: <Icon />
      };
    });
  };
  
  // Compute photos array with useMemo to ensure it updates when data changes
  const photos = useMemo(() => {
    console.log("=== Computing photos ===");
    console.log("fullListingData?.id:", fullListingData?.id);
    console.log("fullListingData?.images:", fullListingData?.images);
    console.log("fullListingData?.images?.length:", fullListingData?.images?.length);
    console.log("listing?.id:", listing?.id);
    console.log("listing?.fullListing?.images:", listing?.fullListing?.images);
    console.log("listing?.fullListing?.images?.length:", listing?.fullListing?.images?.length);
    console.log("listing?.photos:", listing?.photos);
    console.log("listing?.photos?.length:", listing?.photos?.length);
    console.log("listing?.image:", listing?.image);
    
    // Prioritize: fullListingData.images > listing.fullListing.images > listing.photos > listing.image
    let photoArray = [];
    
    // First check fullListingData (set from useEffect)
    if (fullListingData?.images && Array.isArray(fullListingData.images) && fullListingData.images.length > 0) {
      console.log("✅ Using fullListingData.images, count:", fullListingData.images.length);
      photoArray = fullListingData.images;
    } 
    // Then check listing.fullListing (passed from listing card)
    else if (listing?.fullListing?.images && Array.isArray(listing.fullListing.images) && listing.fullListing.images.length > 0) {
      console.log("✅ Using listing.fullListing.images, count:", listing.fullListing.images.length);
      photoArray = listing.fullListing.images;
    }
    // Then check listing.photos (transformed listing)
    else if (listing?.photos && Array.isArray(listing.photos) && listing.photos.length > 0) {
      console.log("✅ Using listing.photos, count:", listing.photos.length);
      photoArray = listing.photos;
    } 
    // Then check listing.image (single image)
    else if (listing?.image) {
      console.log("✅ Using listing.image");
      photoArray = [listing.image];
    } 
    // Fallback to placeholder
    else {
      console.log("❌ No images found, using placeholder");
      photoArray = ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"];
    }
    
    // Filter out invalid images, placeholders, and ensure they're valid Base64 data URLs
    const validPhotos = photoArray.filter(photo => {
      if (!photo || typeof photo !== 'string') {
        console.warn("❌ Invalid photo (not a string):", photo);
        return false;
      }
      
      // Filter out placeholder SVGs
      if (photo.includes('No Image') || photo.includes('fill=\'%23f3f4f6\'') || photo.includes('fill=\'%23e5e7eb\'')) {
        console.warn("❌ Filtered out placeholder image");
        return false;
      }
      
      // Accept data URLs (Base64), HTTP/HTTPS URLs, or blob URLs
      const isValid = photo.startsWith('data:image/') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('blob:');
      if (!isValid) {
        console.warn("❌ Invalid photo format (not a valid image URL):", photo.substring(0, 100));
      }
      return isValid;
    });
    
    console.log("✅ Valid photos after filtering:", validPhotos.length, "out of", photoArray.length);
    
    // If no valid photos, return empty array (don't use placeholder)
    if (validPhotos.length === 0) {
      console.log("❌ No valid photos found");
      return [];
    }
    
    console.log("✅ Returning", validPhotos.length, "valid photos");
    if (validPhotos.length > 0) {
      console.log("✅ First photo preview:", validPhotos[0].substring(0, 100));
      console.log("✅ First photo starts with data:", validPhotos[0].startsWith('data:'));
    }
    console.log("=== End computing photos ===");
    
    return validPhotos;
  }, [fullListingData, listing]);

  // Use real listing data from Firestore with fallbacks
  const listingData = {
    id: fullListingData?.id || listing?.id || 1,
    title: fullListingData?.title || listing?.title || "Untitled Listing",
    description: fullListingData?.description || listing?.description || "No description available",
    price: fullListingData?.rate || listing?.price || 0,
    currency: listing?.currency || "₱",
    rating: reviews.length > 0 
      ? (fullListingData?.rating || listing?.rating || 0)
      : null, // Only show rating if there are actual reviews
    reviewsCount: reviews.length || fullListingData?.reviewsCount || listing?.reviewsCount || 0,
    isGuestFavorite: false, // Can be calculated based on ratings later
    host: hostData ? {
      name: hostData.Username || hostData.name || hostData.displayName || "Host",
      avatar: hostData.ProfilePicture || hostData.photoURL || hostData.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%239ca3af'%3EHost%3C/text%3E%3C/svg%3E",
      isSuperhost: false, // Can be calculated based on reviews/ratings
      hostingYears: 0 // Can be calculated from account creation date
    } : {
      name: "Host",
      avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%239ca3af'%3EHost%3C/text%3E%3C/svg%3E",
      isSuperhost: false,
      hostingYears: 0
    },
    photos: photos,
    amenities: mapAmenities(fullListingData?.amenities || listing?.amenities || []),
    categoryRatings: fullListingData?.categoryRatings || (reviews.length > 0 ? {
      cleanliness: 5.0,
      accuracy: 5.0,
      checkin: 5.0,
      communication: 5.0,
      location: 4.9,
      value: 4.9
    } : {
      cleanliness: 0,
      accuracy: 0,
      checkin: 0,
      communication: 0,
      location: 0,
      value: 0
    }),
    reviews: reviews.map(review => {
      // Handle avatar - prioritize guestAvatar from fetched data, then fallback to avatar, then placeholder
      // Check multiple sources for profile picture
      const avatar = (review.guestAvatar && review.guestAvatar.trim() !== "" && !review.guestAvatar.includes("placeholder.com")) 
        ? review.guestAvatar 
        : (review.avatar && review.avatar.trim() !== "" && !review.avatar.includes("placeholder.com"))
        ? review.avatar
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%239ca3af'%3EGuest%3C/text%3E%3C/svg%3E";
      
      return {
        id: review.id,
        reviewer: review.guestName || "Guest", // Use guestName which is updated from current database
        avatar: avatar,
        rating: review.rating || 5,
        comment: review.comment || "",
        date: review.createdAt ? new Date(review.createdAt.toMillis()).toLocaleDateString() : "Recently",
        duration: review.createdAt ? "Recently" : "",
        tenure: "",
        // Keep original data for fallback
        guestAvatar: review.guestAvatar,
        guestName: review.guestName || review.reviewer,
        guestId: review.guestId // Keep guestId for ownership check
      };
    }),
    location: fullListingData?.location ? {
      address: fullListingData.location.address 
        ? `${fullListingData.location.address}, ${fullListingData.location.city || ''}`.trim()
        : fullListingData.location.city || "Location not specified",
      coordinates: {
        lat: fullListingData.location.latitude || 0,
        lng: fullListingData.location.longitude || 0
      }
    } : (listing?.location ? {
      address: typeof listing.location === 'string' ? listing.location : (listing.location.address || listing.location.city || "Location not specified"),
      coordinates: typeof listing.location === 'object' && listing.location.coordinates ? listing.location.coordinates : { lat: 0, lng: 0 }
    } : {
      address: "Location not specified",
      coordinates: { lat: 0, lng: 0 }
    })
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={i < Math.floor(rating) ? "text-black" : "text-gray-300"}
      />
    ));
  };

  const displayedAmenities = showAllAmenities 
    ? listingData.amenities 
    : listingData.amenities.slice(0, 9);

  const displayedReviews = showAllReviews 
    ? listingData.reviews 
    : listingData.reviews.slice(0, 2);

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setCommentError("");
    setCommentSuccess("");
    
    if (!auth.currentUser) {
      setCommentError("Please log in to leave a comment");
      return;
    }

    if (!commentText.trim()) {
      setCommentError("Please enter a comment");
      return;
    }

    setSubmittingComment(true);
    try {
      const listingId = fullListingData?.id || listing?.id;
      if (!listingId) {
        throw new Error("Listing ID not found");
      }

      await saveReview(listingId, auth.currentUser.uid, {
        rating: commentRating,
        comment: commentText.trim(),
        categoryRatings: {
          cleanliness: commentRating,
          accuracy: commentRating,
          checkin: commentRating,
          communication: commentRating,
          location: commentRating,
          value: commentRating
        }
      });

      // Refresh reviews with guest data
      const updatedReviews = await getListingReviews(listingId);
      const reviewsWithGuestData = await fetchReviewsWithGuestData(updatedReviews);
      setReviews(reviewsWithGuestData);
      
      // Refresh listing data to get updated rating
      const updatedListing = await getListing(listingId);
      setFullListingData(updatedListing);

      setCommentSuccess("Comment submitted successfully!");
      setCommentText("");
      setCommentRating(5);
      setShowCommentForm(false);
      
      setTimeout(() => {
        setCommentSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error submitting comment:", error);
      setCommentError(error.message || "Failed to submit comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle edit review
  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating || 5);
    setEditText(review.comment || "");
    setUpdateError("");
    setUpdateSuccess("");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditText("");
    setUpdateError("");
    setUpdateSuccess("");
  };

  // Handle update review
  const handleUpdateReview = async (reviewId) => {
    setUpdateError("");
    setUpdateSuccess("");
    
    if (!editText.trim()) {
      setUpdateError("Please enter a comment");
      return;
    }

    setUpdatingReview(true);
    try {
      await updateReview(reviewId, {
        rating: editRating,
        comment: editText.trim(),
        categoryRatings: {
          cleanliness: editRating,
          accuracy: editRating,
          checkin: editRating,
          communication: editRating,
          location: editRating,
          value: editRating
        }
      });

      // Refresh reviews with guest data
      const listingId = fullListingData?.id || listing?.id;
      if (listingId) {
        const updatedReviews = await getListingReviews(listingId);
        const reviewsWithGuestData = await fetchReviewsWithGuestData(updatedReviews);
        setReviews(reviewsWithGuestData);
        
        // Refresh listing data to get updated rating
        const updatedListing = await getListing(listingId);
        setFullListingData(updatedListing);
      }

      setUpdateSuccess("Review updated successfully!");
      setEditingReviewId(null);
      setEditText("");
      setEditRating(5);
      
      setTimeout(() => {
        setUpdateSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error updating review:", error);
      setUpdateError(error.message || "Failed to update review");
    } finally {
      setUpdatingReview(false);
    }
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      // Delete review from Firestore
      const reviewRef = doc(db, "reviews", reviewId);
      await deleteDoc(reviewRef);

      // Update listing rating
      const listingId = fullListingData?.id || listing?.id;
      if (listingId) {
        await updateListingRating(listingId);
        
        // Refresh reviews with guest data
        const updatedReviews = await getListingReviews(listingId);
        const reviewsWithGuestData = await fetchReviewsWithGuestData(updatedReviews);
        setReviews(reviewsWithGuestData);
        
        // Refresh listing data
        const updatedListing = await getListing(listingId);
        setFullListingData(updatedListing);
      }

      setUpdateSuccess("Review deleted successfully!");
      setTimeout(() => {
        setUpdateSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error deleting review:", error);
      setUpdateError(error.message || "Failed to delete review");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!fullListingData?.hostId) {
      setCouponError("Unable to validate coupon");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");
    
    try {
      const basePrice = listingData.price;
      const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 1;
      const totalPrice = basePrice * nights;
      
      const result = await validateCoupon(couponCode.trim(), fullListingData.hostId, totalPrice, auth.currentUser?.uid);
      
      if (result.valid) {
        setAppliedCoupon(result);
        setCouponError("");
      } else {
        setAppliedCoupon(null);
        setCouponError(result.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("Error validating coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) {
      return listingData.price;
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return listingData.price;
    }
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const baseTotal = listingData.price * nights;
    
    // Apply coupon discount if available
    if (appliedCoupon && appliedCoupon.valid) {
      return baseTotal - appliedCoupon.discountAmount;
    }
    
    return baseTotal;
  };

  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0;

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");

    if (!auth.currentUser) {
      setBookingError("Please log in to make a booking");
      return;
    }

    const category = fullListingData?.category || "Home";
    const listingId = fullListingData?.id || listing?.id;
    if (!listingId) {
      setBookingError("Listing not found");
      return;
    }

    // Category-specific validation
    if (category === "Home") {
      if (!checkIn || !checkOut) {
        setBookingError("Please select check-in and check-out dates");
        return;
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (checkOutDate <= checkInDate) {
        setBookingError("Check-out date must be after check-in date");
        return;
      }
    } else if (category === "Experience" || category === "Service") {
      if (!bookingDate) {
        setBookingError(`Please select a ${category === "Experience" ? "date" : "service date"}`);
        return;
      }
      if (!bookingHour || !bookingMinute || !bookingAmPm) {
        setBookingError("Please select a time");
        return;
      }
      if (category === "Experience" && experienceGroupSize < 1) {
        setBookingError("Please select at least 1 participant");
        return;
      }
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        couponCode: appliedCoupon ? couponCode : null
      };

      // Add category-specific booking data
      if (category === "Home") {
        bookingData.checkIn = checkIn;
        bookingData.checkOut = checkOut;
        bookingData.guests = guests;
      } else if (category === "Experience" || category === "Service") {
        bookingData.bookingDate = bookingDate;
        // Format time as 12-hour format string (e.g., "12:00 AM")
        const formattedTime = `${bookingHour}:${bookingMinute} ${bookingAmPm}`;
        bookingData.bookingTime = formattedTime;
        if (category === "Experience") {
          bookingData.groupSize = experienceGroupSize;
        }
      }

      await createBooking(listingId, bookingData);

      setBookingSuccess("Booking request submitted! The host will review and approve your booking. You will receive an email notification once it's approved.");
      
      // Reset form
      setCheckIn("");
      setCheckOut("");
      setGuests(1);
      setBookingDate("");
      setBookingTime("");
      setBookingHour("12");
      setBookingMinute("00");
      setBookingAmPm("AM");
      setExperienceGroupSize(1);
      setCouponCode("");
      setAppliedCoupon(null);
      
      setTimeout(() => {
        setBookingSuccess("");
      }, 5000);
    } catch (error) {
      console.error("Error creating booking:", error);
      setBookingError(error.message || "Failed to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-semibold text-lg mb-6"
          >
            Back
          </button>
        )}
        {/* Title and Actions */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {listingData.title}
            </h1>
            <p className="text-gray-600">{listingData.location.address}</p>
            <p className="text-sm text-gray-500 mt-1">{listingData.description}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                const listingId = fullListingData?.id || listing?.id || listingData.id;
                if (!listingId) {
                  alert("Unable to generate share link. Listing ID not found.");
                  return;
                }
                const listingUrl = `${window.location.origin}${window.location.pathname}?listingId=${listingId}`;
                navigator.clipboard.writeText(listingUrl).then(() => {
                  setShareCopied(true);
                  setTimeout(() => setShareCopied(false), 2000);
                }).catch((error) => {
                  console.error("Failed to copy:", error);
                  alert("Failed to copy link. Please try again.");
                });
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
              title="Copy listing link"
            >
              {shareCopied ? (
                <FaCheck className="text-green-600" />
              ) : (
                <FaShare className="text-gray-700" />
              )}
              <span className={`text-sm font-medium ${shareCopied ? 'text-green-600' : 'text-gray-700'}`}>
                {shareCopied ? "Copied!" : "Share"}
              </span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white">
              <FaHeart className="text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Save</span>
            </button>
          </div>
        </div>

        {/* Ratings and Highlights */}
        <div className="flex flex-wrap items-center gap-6 mb-8">
          {listingData.isGuestFavorite && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600 text-xl">🏆</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Guest favorite</p>
                <p className="text-xs text-gray-600">One of the most loved homes</p>
              </div>
            </div>
          )}
          {listingData.rating !== null && listingData.rating > 0 ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                {renderStars(listingData.rating)}
              </div>
              <span className="font-semibold text-gray-900">{listingData.rating.toFixed(1)}</span>
              <span className="text-gray-600 text-sm">({listingData.reviewsCount} {listingData.reviewsCount === 1 ? 'Review' : 'Reviews'})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-gray-600 text-sm">No ratings yet</span>
            </div>
          )}
        </div>

        {/* Photo Gallery Section */}
        <div className="mb-12">
          {listingData.photos && listingData.photos.length > 0 && listingData.photos.some(photo => photo && !photo.includes('No Image') && !photo.includes('fill=\'%23f3f4f6\'')) ? (
            <>
              {/* Mobile: Circular Layout */}
              <div className="block sm:hidden">
                {/* Main Circular Photo */}
                <div className="flex justify-center mb-4">
                  <div 
                    className="w-64 h-64 rounded-full overflow-hidden border-2 border-gray-300 shadow-lg cursor-pointer relative group"
                    onClick={() => {
                      setModalPhotoIndex(selectedPhotoIndex);
                      setShowAllPhotos(true);
                    }}
                  >
                    {(() => {
                      const mainPhoto = listingData.photos[selectedPhotoIndex] || listingData.photos[0];
                      
                      if (!mainPhoto || mainPhoto.includes('No Image') || mainPhoto.includes('fill=\'%23f3f4f6\'')) {
                        return (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <p className="text-gray-500 text-sm">No image</p>
                          </div>
                        );
                      }
                      
                      return (
                        <img
                          key={`main-mobile-${selectedPhotoIndex}`}
                          src={mainPhoto}
                          alt={listingData.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.backgroundColor = '#f3f4f6';
                          }}
                        />
                      );
                    })()}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                  </div>
                </div>
                
                {/* Circular Thumbnails Row */}
                <div className="flex gap-3 justify-center overflow-x-auto pb-2 px-2">
                  {listingData.photos.slice(0, 5).map((photo, index) => {
                    if (!photo || photo.includes('No Image') || photo.includes('fill=\'%23f3f4f6\'')) {
                      return null;
                    }
                    
                    const isSelected = index === selectedPhotoIndex;
                    
                    return (
                      <button
                        key={`thumb-mobile-${index}`}
                        onClick={() => {
                          setSelectedPhotoIndex(index);
                          setModalPhotoIndex(index);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 scale-110 shadow-md'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`${listingData.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desktop: Grid Layout */}
              <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                {/* Main Photo */}
                <div 
                  className="col-span-2 row-span-2 cursor-pointer relative group overflow-hidden bg-white"
                  onClick={() => {
                    setModalPhotoIndex(selectedPhotoIndex);
                    setShowAllPhotos(true);
                  }}
                >
                  {(() => {
                    const mainPhoto = listingData.photos[selectedPhotoIndex] || listingData.photos[0];
                    
                    if (!mainPhoto || mainPhoto.includes('No Image') || mainPhoto.includes('fill=\'%23f3f4f6\'')) {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <p className="text-gray-500">No image available</p>
                        </div>
                      );
                    }
                    
                    return (
                      <img
                        key={`main-${selectedPhotoIndex}-${mainPhoto?.substring(0, 50)}`}
                        src={mainPhoto}
                        alt={listingData.title}
                        className="w-full h-full object-cover block"
                        style={{ 
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          backgroundColor: 'transparent'
                        }}
                        onError={(e) => {
                          console.error('Main photo failed to load');
                          e.target.onerror = null;
                          e.target.style.backgroundColor = '#f3f4f6';
                          e.target.style.display = 'flex';
                          e.target.style.alignItems = 'center';
                          e.target.style.justifyContent = 'center';
                        }}
                        onLoad={(e) => {
                          console.log('Main photo loaded successfully');
                          e.target.style.display = 'block';
                        }}
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none z-10"></div>
                </div>
                
                {/* Thumbnail Photos */}
                {listingData.photos.slice(1, 5).map((photo, index) => {
                  if (!photo || photo.includes('No Image') || photo.includes('fill=\'%23f3f4f6\'')) {
                    return null;
                  }
                  
                  return (
                    <div
                      key={`thumb-${index + 1}-${photo?.substring(0, 50)}`}
                      className="cursor-pointer relative group overflow-hidden bg-white"
                      onClick={() => {
                        const newIndex = index + 1;
                        setSelectedPhotoIndex(newIndex);
                        setModalPhotoIndex(newIndex);
                      }}
                    >
                      <img
                        src={photo}
                        alt={`${listingData.title} ${index + 2}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform block"
                        style={{ 
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          backgroundColor: 'transparent'
                        }}
                        onError={(e) => {
                          console.error(`Thumbnail ${index + 1} failed to load`);
                          e.target.onerror = null;
                          e.target.style.backgroundColor = '#f3f4f6';
                        }}
                        onLoad={(e) => {
                          console.log(`Thumbnail ${index + 1} loaded successfully`);
                          e.target.style.display = 'block';
                        }}
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none z-10"></div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-[500px] md:h-[600px] rounded-xl border border-gray-200 shadow-sm bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No images available</p>
                <p className="text-gray-400 text-sm">Images will appear here once uploaded</p>
              </div>
            </div>
          )}
          
          {/* Show All Photos Button */}
          <button
            onClick={() => {
              setModalPhotoIndex(selectedPhotoIndex);
              setShowAllPhotos(true);
            }}
            className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white text-gray-700 font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span className="text-sm">Show all photos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Host Information */}
            <div className="border border-gray-200 rounded-xl p-4 md:p-6 mb-8 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4 flex-1">
                  <img
                    src={listingData.host.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%239ca3af'%3EHost%3C/text%3E%3C/svg%3E"}
                    alt={listingData.host.name || "Host"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    onError={(e) => {
                      console.error("Error loading host avatar:", listingData.host.avatar);
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%239ca3af'%3EHost%3C/text%3E%3C/svg%3E";
                    }}
                    onLoad={() => {
                      console.log("Host avatar loaded successfully:", listingData.host.avatar);
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {listingData.host.name || "Host"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {listingData.host.isSuperhost && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium mr-2">
                          ⭐ Superhost
                        </span>
                      )}
                      {listingData.host.hostingYears > 0 ? `${listingData.host.hostingYears} years hosting` : "Host"}
                    </p>
                    {hostData && hostData.Number && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <FaPhone className="text-blue-600 text-xs" />
                          <span>+{hostData.Number}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md whitespace-nowrap"
                  onClick={() => {
                    console.log("Chat with host button clicked");
                    console.log("fullListingData:", fullListingData);
                    console.log("hostId:", fullListingData?.hostId);
                    console.log("auth.currentUser:", auth.currentUser);
                    console.log("onNavigateToMessages:", onNavigateToMessages);
                    
                    if (fullListingData?.hostId && auth.currentUser) {
                      if (onNavigateToMessages) {
                        console.log("Navigating to messages...");
                        // Store the host info to open conversation directly
                        sessionStorage.setItem('openConversation', JSON.stringify({
                          otherUserId: fullListingData.hostId,
                          listingId: fullListingData.id,
                          otherUserName: listingData.host.name,
                          otherUserAvatar: listingData.host.avatar
                        }));
                        onNavigateToMessages();
                      } else {
                        console.error("onNavigateToMessages is not defined");
                        alert("Navigation function not available. Please try refreshing the page.");
                      }
                    } else {
                      if (!auth.currentUser) {
                        alert("Please log in to chat with the host");
                      } else if (!fullListingData?.hostId) {
                        alert("Host information not available");
                      }
                    }
                  }}
                >
                  <FaComments className="text-sm" />
                  <span>Chat with host</span>
                </button>
              </div>
            </div>

            {/* Basics Section - Category Specific */}
            {fullListingData?.category === "Home" && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-6 mb-8 bg-white shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  About this place
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-2xl text-blue-600" />
                    <div className="text-lg font-semibold text-gray-900">
                      {fullListingData?.basics?.guests || listing?.basics?.guests || 1} {(fullListingData?.basics?.guests || listing?.basics?.guests || 1) === 1 ? 'guest' : 'guests'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaBed className="text-2xl text-blue-600" />
                    <div className="text-lg font-semibold text-gray-900">
                      {fullListingData?.basics?.bedrooms || listing?.basics?.bedrooms || 1} {(fullListingData?.basics?.bedrooms || listing?.basics?.bedrooms || 1) === 1 ? 'bedroom' : 'bedrooms'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaBed className="text-2xl text-blue-600" />
                    <div className="text-lg font-semibold text-gray-900">
                      {fullListingData?.basics?.beds || listing?.basics?.beds || 1} {(fullListingData?.basics?.beds || listing?.basics?.beds || 1) === 1 ? 'bed' : 'beds'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaBath className="text-2xl text-blue-600" />
                    <div className="text-lg font-semibold text-gray-900">
                      {fullListingData?.basics?.bathrooms || listing?.basics?.bathrooms || 1} {(fullListingData?.basics?.bathrooms || listing?.basics?.bathrooms || 1) === 1 ? 'bathroom' : 'bathrooms'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Experience Details Section */}
            {fullListingData?.category === "Experience" && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-6 mb-8 bg-white shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  Experience Details
                </h2>
                <div className="space-y-4">
                  {fullListingData?.duration && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FaClock className="text-2xl text-blue-600" />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {fullListingData.duration} {fullListingData.duration === 1 ? 'hour' : 'hours'}
                        </div>
                        <div className="text-sm text-gray-600">Duration</div>
                      </div>
                    </div>
                  )}
                  {fullListingData?.groupSize && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <FaUsers className="text-2xl text-green-600" />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          Up to {fullListingData.groupSize} {fullListingData.groupSize === 1 ? 'participant' : 'participants'}
                        </div>
                        <div className="text-sm text-gray-600">Maximum group size</div>
                      </div>
                    </div>
                  )}
                  {fullListingData?.whatsIncluded && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FaCheckCircle className="text-green-600" />
                        What's Included
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullListingData.whatsIncluded}</p>
                    </div>
                  )}
                  {fullListingData?.meetingPoint && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-600" />
                        Meeting Point
                      </h3>
                      <p className="text-gray-700">{fullListingData.meetingPoint}</p>
                    </div>
                  )}
                  {fullListingData?.requirements && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FaExclamationTriangle className="text-yellow-600" />
                        Requirements
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullListingData.requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Details Section */}
            {fullListingData?.category === "Service" && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-6 mb-8 bg-white shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  Service Details
                </h2>
                <div className="space-y-4">
                  {fullListingData?.serviceType && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <FaInfoCircle className="text-2xl text-purple-600" />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {fullListingData.serviceType}
                        </div>
                        <div className="text-sm text-gray-600">Service Type</div>
                      </div>
                    </div>
                  )}
                  {fullListingData?.serviceDuration && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FaClock className="text-2xl text-blue-600" />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {fullListingData.serviceDuration}
                        </div>
                        <div className="text-sm text-gray-600">Duration</div>
                      </div>
                    </div>
                  )}
                  {fullListingData?.serviceIncludes && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FaCheckCircle className="text-green-600" />
                        What's Included
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullListingData.serviceIncludes}</p>
                    </div>
                  )}
                  {fullListingData?.serviceRequirements && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FaExclamationTriangle className="text-yellow-600" />
                        Requirements
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullListingData.serviceRequirements}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities Section */}
            {listingData.amenities.length > 0 && (
              <div className="border border-gray-200 rounded-xl p-4 md:p-6 mb-8 bg-white shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                  What this place offers
                </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-xl text-blue-600">{amenity.icon}</div>
                    <span className="text-gray-700 font-medium">{amenity.name}</span>
                  </div>
                ))}
              </div>
              {listingData.amenities.length > 9 && !showAllAmenities && (
                <button
                  onClick={() => setShowAllAmenities(true)}
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white text-sm font-medium text-gray-700"
                >
                  Show all {listingData.amenities.length} amenities
                </button>
              )}
              </div>
            )}

            {/* Location Section */}
            <div className="border border-gray-200 rounded-xl p-4 md:p-6 mb-8 bg-white shadow-sm">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                Where you'll be
              </h2>
              <div className="mb-4">
                <ListingMap 
                  latitude={listingData.location.coordinates.lat}
                  longitude={listingData.location.coordinates.lng}
                  address={listingData.location.address}
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-900 font-semibold flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  {listingData.location.address}
                </p>
                {fullListingData?.location?.city && (
                  <p className="text-sm text-gray-600 mt-2 ml-6">{fullListingData.location.city}</p>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="border border-gray-200 rounded-xl p-6 mb-8 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Comments
                </h2>
                {listingData.rating !== null && listingData.rating > 0 ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    {renderStars(listingData.rating)}
                    <span className="font-semibold text-gray-900">{listingData.rating.toFixed(1)}</span>
                    <span className="text-gray-600 text-sm">({listingData.reviewsCount})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-600 text-sm">No ratings yet</span>
                  </div>
                )}
              </div>

              {/* Comment Form */}
              {auth.currentUser && !showCommentForm && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowCommentForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Leave a Comment
                  </button>
                </div>
              )}

              {showCommentForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Comment</h3>
                  <form onSubmit={handleSubmitComment}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setCommentRating(star)}
                            className="focus:outline-none"
                          >
                            <FaStar
                              className={`text-2xl ${
                                star <= commentRating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{commentRating} out of 5</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Comment
                      </label>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your experience..."
                      />
                    </div>
                    {commentError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {commentError}
                      </div>
                    )}
                    {commentSuccess && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                        {commentSuccess}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submittingComment}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {submittingComment ? "Submitting..." : "Submit Comment"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCommentForm(false);
                          setCommentText("");
                          setCommentError("");
                          setCommentSuccess("");
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Individual Comments */}
              {listingData.reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No comments yet. Be the first to leave a comment!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {displayedReviews.map((review) => {
                    const isOwnReview = auth.currentUser && review.guestId === auth.currentUser.uid;
                    const isEditing = editingReviewId === review.id;
                    
                    return (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                        {isEditing ? (
                          // Edit Form
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-4">Edit Your Review</h4>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleUpdateReview(review.id);
                            }}>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Rating
                                </label>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setEditRating(star)}
                                      className="focus:outline-none"
                                    >
                                      <FaStar
                                        className={`text-2xl ${
                                          star <= editRating
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                  <span className="ml-2 text-sm text-gray-600">{editRating} out of 5</span>
                                </div>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Your Comment
                                </label>
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  rows={4}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Share your experience..."
                                />
                              </div>
                              {updateError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                  {updateError}
                                </div>
                              )}
                              {updateSuccess && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                  {updateSuccess}
                                </div>
                              )}
                              <div className="flex gap-3">
                                <button
                                  type="submit"
                                  disabled={updatingReview}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                                >
                                  {updatingReview ? "Updating..." : "Update Review"}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          // Review Display
                          <div className="flex items-start gap-4 mb-4">
                            <img
                              src={
                                (review.guestAvatar && review.guestAvatar.trim() !== "" && !review.guestAvatar.includes("placeholder.com"))
                                  ? review.guestAvatar
                                  : (review.avatar && review.avatar.trim() !== "" && !review.avatar.includes("placeholder.com"))
                                  ? review.avatar
                                  : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%239ca3af'%3EGuest%3C/text%3E%3C/svg%3E"
                              }
                              alt={review.guestName || review.reviewer || "Guest"}
                              className="w-12 h-12 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                console.error("Error loading guest avatar:", {
                                  guestAvatar: review.guestAvatar,
                                  avatar: review.avatar,
                                  guestId: review.guestId
                                });
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%239ca3af'%3EGuest%3C/text%3E%3C/svg%3E";
                              }}
                              onLoad={() => {
                                console.log("Guest avatar loaded successfully:", {
                                  guestAvatar: review.guestAvatar,
                                  avatar: review.avatar,
                                  guestId: review.guestId
                                });
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">{review.guestName || review.reviewer || "Guest"}</p>
                                  {review.tenure && (
                                    <p className="text-sm text-gray-500">{review.tenure}</p>
                                  )}
                                </div>
                                {isOwnReview && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditReview(review)}
                                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                      title="Edit review"
                                    >
                                      <FaEdit className="text-sm" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReview(review.id)}
                                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                      title="Delete review"
                                    >
                                      <FaTrash className="text-sm" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {review.date}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {listingData.reviews.length > 2 && !showAllReviews && (
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white text-sm font-medium text-gray-700"
                >
                  Show all {listingData.reviewsCount} comments
                </button>
              )}
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-20 border border-gray-200 rounded-xl p-4 md:p-6 shadow-md bg-white">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {listingData.currency}{listingData.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600">
                    {fullListingData?.category === "Home" ? "night" :
                     fullListingData?.category === "Experience" ? "per person" :
                     "per service"}
                  </span>
                </div>
                
                {/* Coupon Code Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have a coupon code?
                  </label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        placeholder="Enter coupon code"
                        disabled={validatingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {validatingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-green-900">{couponCode}</p>
                          {appliedCoupon.description && (
                            <p className="text-xs text-green-700">{appliedCoupon.description}</p>
                          )}
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-700 hover:text-green-900 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-xs text-red-600 mt-1">{couponError}</p>
                  )}
                </div>

                {(() => {
                  const category = fullListingData?.category || "Home";
                  if (category === "Home" && nights > 0) {
                    return (
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>
                            {listingData.currency}{listingData.price.toLocaleString()} x {nights} {nights === 1 ? 'night' : 'nights'}
                          </span>
                          <span>
                            {listingData.currency}{(listingData.price * nights).toLocaleString()}
                          </span>
                        </div>
                        {appliedCoupon && appliedCoupon.valid && (
                          <div className="flex justify-between text-sm text-green-600 mb-1">
                            <span>Coupon Discount</span>
                            <span>-{listingData.currency}{appliedCoupon.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                          <span>Total</span>
                          <span>{listingData.currency}{calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    );
                  } else if (category === "Experience" && bookingDate && experienceGroupSize > 0) {
                    const total = listingData.price * experienceGroupSize;
                    return (
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>
                            {listingData.currency}{listingData.price.toLocaleString()} x {experienceGroupSize} {experienceGroupSize === 1 ? 'person' : 'people'}
                          </span>
                          <span>
                            {listingData.currency}{total.toLocaleString()}
                          </span>
                        </div>
                        {appliedCoupon && appliedCoupon.valid && (
                          <div className="flex justify-between text-sm text-green-600 mb-1">
                            <span>Coupon Discount</span>
                            <span>-{listingData.currency}{appliedCoupon.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                          <span>Total</span>
                          <span>{listingData.currency}{(appliedCoupon && appliedCoupon.valid ? total - appliedCoupon.discountAmount : total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    );
                  } else if (category === "Service" && bookingDate) {
                    return (
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Service Fee</span>
                          <span>{listingData.currency}{listingData.price.toLocaleString()}</span>
                        </div>
                        {appliedCoupon && appliedCoupon.valid && (
                          <div className="flex justify-between text-sm text-green-600 mb-1">
                            <span>Coupon Discount</span>
                            <span>-{listingData.currency}{appliedCoupon.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                          <span>Total</span>
                          <span>{listingData.currency}{(appliedCoupon && appliedCoupon.valid ? listingData.price - appliedCoupon.discountAmount : listingData.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-2 border border-blue-100">
                  Prices include all fees
                </p>
              </div>

              <div className="space-y-4">
                {/* Home Category: Check-in, Check-out, Guests */}
                {fullListingData?.category === "Home" && (
                  <>
                    {/* Check-in */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                        CHECK-IN
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    {/* Check-out */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                        CHECKOUT
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                        GUESTS
                      </label>
                      {(() => {
                        const maxGuests = fullListingData?.basics?.guests || listing?.basics?.guests || 1;
                        return (
                          <>
                            <select
                              value={guests}
                              onChange={(e) => setGuests(parseInt(e.target.value))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            >
                              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                                <option key={num} value={num}>
                                  {num} {num === 1 ? "guest" : "guests"}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Maximum {maxGuests} {maxGuests === 1 ? 'guest' : 'guests'} allowed
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}

                {/* Experience/Service Category: Date, Time, Group Size (for Experience) */}
                {(fullListingData?.category === "Experience" || fullListingData?.category === "Service") && (
                  <>
                    {/* Booking Date */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                        {fullListingData?.category === "Experience" ? "EXPERIENCE DATE" : "SERVICE DATE"}
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    {/* Booking Time - 12 Hour Format */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                        TIME
                      </label>
                      <div className="flex gap-2 items-center">
                        {/* Hour Select */}
                        <select
                          value={bookingHour}
                          onChange={(e) => setBookingHour(e.target.value)}
                          className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                            <option key={hour} value={hour.toString()}>
                              {hour}
                            </option>
                          ))}
                        </select>
                        <span className="text-gray-600 font-semibold">:</span>
                        {/* Minute Select */}
                        <select
                          value={bookingMinute}
                          onChange={(e) => setBookingMinute(e.target.value)}
                          className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          {Array.from({ length: 60 }, (_, i) => i).map((min) => (
                            <option key={min} value={min.toString().padStart(2, '0')}>
                              {min.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        {/* AM/PM Select */}
                        <select
                          value={bookingAmPm}
                          onChange={(e) => setBookingAmPm(e.target.value)}
                          className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Group Size (Experience only) */}
                    {fullListingData?.category === "Experience" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                          PARTICIPANTS
                        </label>
                        {(() => {
                          const maxGroupSize = fullListingData?.groupSize || 10;
                          return (
                            <>
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => setExperienceGroupSize(Math.max(1, experienceGroupSize - 1))}
                                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition"
                                >
                                  <span className="text-gray-600">−</span>
                                </button>
                                <span className="text-lg font-medium text-gray-900 w-12 text-center">{experienceGroupSize}</span>
                                <button
                                  type="button"
                                  onClick={() => setExperienceGroupSize(Math.min(maxGroupSize, experienceGroupSize + 1))}
                                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition"
                                >
                                  <span className="text-gray-600">+</span>
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Maximum {maxGroupSize} {maxGroupSize === 1 ? 'participant' : 'participants'} allowed
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}

                {/* Booking Messages */}
                {bookingError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{bookingError}</p>
                  </div>
                )}
                {bookingSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">{bookingSuccess}</p>
                  </div>
                )}

                {/* Reserve Button */}
                <button 
                  onClick={handleBooking}
                  disabled={(() => {
                    const category = fullListingData?.category || "Home";
                    if (category === "Home") {
                      return bookingLoading || !checkIn || !checkOut;
                    } else if (category === "Experience" || category === "Service") {
                      return bookingLoading || !bookingDate || !bookingHour || !bookingMinute || !bookingAmPm || (category === "Experience" && experienceGroupSize < 1);
                    }
                    return bookingLoading;
                  })()}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? "Submitting..." : (fullListingData?.category === "Experience" || fullListingData?.category === "Service") ? "Book Now" : "Reserve"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Payment will be deducted only after host approval
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <FaCalendar className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Free cancellation</p>
                    <p className="text-gray-600 text-xs mt-0.5">Cancel before check-in for a full refund</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Photo Gallery Modal */}
      {showAllPhotos && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={(e) => {
            // Close modal if clicking on backdrop (not on modal content)
            if (e.target === e.currentTarget) {
              setShowAllPhotos(false);
            }
          }}
        >
          {/* Blurred Background */}
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
          
          {/* Modal Content */}
          <div 
            className="relative z-10 w-full max-w-7xl mx-auto px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAllPhotos(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
              aria-label="Close gallery"
            >
              <FaTimes className="text-gray-800 text-xl" />
            </button>

            {/* Main Image Container */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden mb-4" style={{ minHeight: '70vh' }}>
              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft className="text-gray-800 text-xl" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
                    aria-label="Next image"
                  >
                    <FaChevronRight className="text-gray-800 text-xl" />
                  </button>
                </>
              )}

              {/* Main Image */}
              <div className="flex items-center justify-center h-full p-8">
                <img
                  src={photos[modalPhotoIndex]}
                  alt={`${listingData?.title || 'Listing'} - Image ${modalPhotoIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  style={{ 
                    display: 'block',
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '70vh'
                  }}
                  onError={(e) => {
                    console.error('Modal image failed to load');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" style={{ scrollbarWidth: 'thin' }}>
                {photos.map((photo, index) => (
                  <button
                    key={`thumb-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalPhotoIndex(index);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      modalPhotoIndex === index
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-transparent hover:border-white/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
              
              {/* Image Counter */}
              <div className="text-center mt-3">
                <span className="text-white text-sm font-medium">
                  {modalPhotoIndex + 1} / {photos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Navigation */}
      {showAllPhotos && photos.length > 0 && (
        <div
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              setModalPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
            } else if (e.key === 'ArrowRight') {
              setModalPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
            } else if (e.key === 'Escape') {
              setShowAllPhotos(false);
            }
          }}
          className="fixed inset-0 z-40"
          style={{ pointerEvents: 'none' }}
        />
      )}

    </div>
  );
};

export default ListingDetail;

