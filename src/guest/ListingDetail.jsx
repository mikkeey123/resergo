import React, { useState, useEffect } from "react";
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
  FaBroom,
  FaCheckCircle,
  FaKey,
  FaComments,
  FaTag,
  FaUtensils,
  FaIceCream
} from "react-icons/fa";

const ListingDetail = ({ listing, onBack }) => {
  console.log("ListingDetail component rendered with listing:", listing);
  
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Log when component mounts
  useEffect(() => {
    console.log("ListingDetail mounted");
    return () => {
      console.log("ListingDetail unmounting");
    };
  }, []);

  // Use provided listing data with fallbacks
  const listingData = {
    id: listing?.id || 1,
    title: listing?.title || "Room in São Paulo",
    description: listing?.description || "1 single bed • Private attached bathroom",
    price: listing?.price || 2181,
    currency: listing?.currency || "₱",
    rating: listing?.rating || 4.99,
    reviewsCount: listing?.reviewsCount || 440,
    isGuestFavorite: listing?.isGuestFavorite !== undefined ? listing.isGuestFavorite : true,
    host: listing?.host || {
      name: "Host",
      avatar: "https://via.placeholder.com/64",
      isSuperhost: true,
      hostingYears: 6
    },
    photos: listing?.photos && listing.photos.length > 0 ? listing.photos : [
      listing?.image || "https://via.placeholder.com/800x600?text=Main+Room",
      "https://via.placeholder.com/400x300?text=Living+Area",
      "https://via.placeholder.com/400x300?text=Kitchen",
      "https://via.placeholder.com/400x300?text=Bathroom",
      "https://via.placeholder.com/400x300?text=Balcony",
      "https://via.placeholder.com/400x300?text=Bedroom"
    ],
    amenities: listing?.amenities || [
      { name: "Wifi", icon: <FaWifi /> },
      { name: "Lock on bedroom door", icon: <FaLock /> },
      { name: "Dedicated workspace", icon: <FaLaptop /> },
      { name: "Hair dryer", icon: <FaWind /> },
      { name: "Microwave", icon: <FaUtensils /> },
      { name: "Refrigerator", icon: <FaIceCream /> },
      { name: "Paid street parking off premises", icon: <FaCar /> },
      { name: "Luggage dropoff allowed", icon: <FaSuitcaseRolling /> },
      { name: "Long term stays allowed", icon: <FaCalendar /> }
    ],
    categoryRatings: listing?.categoryRatings || {
      cleanliness: 5.0,
      accuracy: 5.0,
      checkin: 5.0,
      communication: 5.0,
      location: 4.9,
      value: 4.9
    },
    reviews: listing?.reviews || [
      {
        id: 1,
        reviewer: "Yameng",
        avatar: "https://via.placeholder.com/48",
        tenure: "4 years on Airbnb",
        rating: 5,
        date: "October 2025",
        duration: "Stayed a few nights",
        comment: "This is a beautiful place — I woke up to a serene, Zen-like view through the window every morning, which was such a joy. The room was clean, comfortable, and exactly as described. Highly recommended!"
      },
      {
        id: 2,
        reviewer: "영화",
        avatar: "https://via.placeholder.com/48",
        tenure: "4 months on Airbnb",
        rating: 5,
        date: "October 2025",
        duration: "Stayed a few nights",
        comment: "I had the attic room up the stairs from where Helene and Alain on the third floor. It was a very cozy and pretty room, with great natural light and a comfortable bed."
      }
    ],
    location: listing?.location ? {
      address: typeof listing.location === 'string' ? listing.location : (listing.location.address || listing.location),
      coordinates: typeof listing.location === 'object' && listing.location.coordinates ? listing.location.coordinates : { lat: -23.5505, lng: -46.6333 }
    } : {
      address: "São Paulo, Brazil",
      coordinates: { lat: -23.5505, lng: -46.6333 }
    }
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

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return listingData.price;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) return listingData.price;
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    return listingData.price * nights;
  };

  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      {onBack && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-8 py-4">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Actions */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {listingData.title}
            </h1>
            <p className="text-gray-600">{listingData.location.address}</p>
            <p className="text-sm text-gray-500 mt-1">{listingData.description}</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaShare className="text-gray-600" />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FaHeart className="text-gray-600" />
              <span className="text-sm font-medium">Save</span>
            </button>
          </div>
        </div>

        {/* Ratings and Highlights */}
        <div className="flex flex-wrap items-center gap-6 mb-6">
          {listingData.isGuestFavorite && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-xl">🏆</span>
              <div>
                <p className="font-semibold text-gray-900">Guest favorite</p>
                <p className="text-xs text-gray-500">One of the most loved homes</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(listingData.rating)}
            </div>
            <span className="font-semibold text-gray-900">{listingData.rating}</span>
            <span className="text-gray-600">({listingData.reviewsCount} Reviews)</span>
          </div>
        </div>

        {/* Photo Gallery Section */}
        <div className="mb-12">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
            {/* Main Photo */}
            <div 
              className="col-span-2 row-span-2 cursor-pointer relative group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={listingData.photos[selectedPhotoIndex]}
                alt={listingData.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition"></div>
            </div>
            
            {/* Thumbnail Photos */}
            {listingData.photos.slice(1, 5).map((photo, index) => (
              <div
                key={index + 1}
                className="cursor-pointer relative group overflow-hidden"
                onClick={() => setSelectedPhotoIndex(index + 1)}
              >
                <img
                  src={photo}
                  alt={`${listingData.title} ${index + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition"></div>
              </div>
            ))}
          </div>
          
          {/* Show All Photos Button */}
          <button
            onClick={() => setShowAllPhotos(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            <span className="text-sm font-medium">Show all photos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Host Information */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <div className="flex items-start gap-4">
                <img
                  src={listingData.host.avatar}
                  alt={listingData.host.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Stay with {listingData.host.name}
                  </h3>
                  <p className="text-gray-600">
                    {listingData.host.isSuperhost && "Superhost • "}
                    {listingData.host.hostingYears} years hosting
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-yellow-500">🏆</span>
                <div>
                  <p className="font-semibold text-gray-900">Top 5% of homes</p>
                  <p className="text-sm text-gray-600">
                    This home is highly ranked based on ratings, reviews, and reliability.
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What this place offers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-xl text-gray-700">{amenity.icon}</div>
                    <span className="text-gray-700">{amenity.name}</span>
                  </div>
                ))}
              </div>
              {listingData.amenities.length > 9 && !showAllAmenities && (
                <button
                  onClick={() => setShowAllAmenities(true)}
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Show all {listingData.amenities.length} amenities
                </button>
              )}
            </div>

            {/* Reviews Section */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Reviews
                </h2>
                <div className="flex items-center gap-2">
                  {renderStars(listingData.rating)}
                  <span className="font-semibold text-gray-900">{listingData.rating}</span>
                  <span className="text-gray-600">({listingData.reviewsCount})</span>
                </div>
              </div>

              {/* Category Ratings */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <FaBroom className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Cleanliness</p>
                    <p className="font-semibold">{listingData.categoryRatings.cleanliness}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Accuracy</p>
                    <p className="font-semibold">{listingData.categoryRatings.accuracy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaKey className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-semibold">{listingData.categoryRatings.checkin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaComments className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Communication</p>
                    <p className="font-semibold">{listingData.categoryRatings.communication}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{listingData.categoryRatings.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaTag className="text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Value</p>
                    <p className="font-semibold">{listingData.categoryRatings.value}</p>
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-8">
                {displayedReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={review.avatar}
                        alt={review.reviewer}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{review.reviewer}</p>
                          <p className="text-sm text-gray-500">{review.tenure}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.date} · {review.duration}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {listingData.reviews.length > 2 && !showAllReviews && (
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Show all {listingData.reviewsCount} reviews
                </button>
              )}
            </div>

            {/* Location Section */}
            <div className="pb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Where you'll be
              </h2>
              <div className="bg-gray-200 rounded-lg h-64 mb-4 flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-4xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">{listingData.location.address}</p>
                  <p className="text-sm text-gray-500 mt-2">Map view would go here</p>
                </div>
              </div>
              <p className="text-gray-700">{listingData.location.address}</p>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 border border-gray-200 rounded-2xl p-6 shadow-lg bg-white">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {listingData.currency}{listingData.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600">night</span>
                </div>
                {nights > 0 && (
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{listingData.currency}{listingData.price.toLocaleString()} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
                      <span>{listingData.currency}{(listingData.price * nights).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                      <span>Total</span>
                      <span>{listingData.currency}{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-pink-600 bg-pink-50 px-2 py-1 rounded inline-block mt-2">
                  Prices include all fees
                </p>
              </div>

              <div className="space-y-4">
                {/* Check-in */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                    CHECK-IN
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    min={checkIn}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
                    GUESTS
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reserve Button */}
                <button className="w-full bg-pink-600 text-white py-4 rounded-lg font-semibold hover:bg-pink-700 transition">
                  Reserve
                </button>

                <p className="text-center text-sm text-gray-600">
                  You won't be charged yet
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <FaCalendar className="text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Free cancellation</p>
                    <p className="text-gray-600">Cancel before check-in for a full refund</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal (simplified) */}
      {showAllPhotos && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllPhotos(false)}
        >
          <div className="max-w-6xl w-full">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              ×
            </button>
            <img
              src={listingData.photos[selectedPhotoIndex]}
              alt={listingData.title}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;

