import React, { useState } from "react";
import Loginmodal from "../auth/Loginmodal";
import LoginForm from "../auth/LoginForm";
import video from "../assets/showcase.mp4";
import { 
  FaHome, 
  FaShieldAlt, 
  FaWallet, 
  FaStar, 
  FaUsers, 
  FaCheckCircle,
  FaMapMarkerAlt,
  FaChartLine
} from "react-icons/fa";

const LandingPage = ({ onNavigateToGuest, onNavigateToHost, onNavigateToAdmin, onShowGoogleSignupModal }) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginType, setLoginType] = useState("guest");

  const handleGetStarted = (type) => {
    setLoginType(type);
    setLoginOpen(true);
  };

  const features = [
    {
      icon: <FaHome className="text-4xl text-blue-600" />,
      title: "Unique Experiences",
      description: "Discover extraordinary places and experiences you won't find anywhere else. From themed stays to exclusive venues."
    },
    {
      icon: <FaShieldAlt className="text-4xl text-blue-600" />,
      title: "Secure & Safe",
      description: "Your safety is our priority. All hosts and guests are verified, and payments are processed securely."
    },
    {
      icon: <FaStar className="text-4xl text-blue-600" />,
      title: "Verified Reviews",
      description: "Read authentic reviews from real guests and hosts. Make informed decisions with trusted feedback."
    },
    {
      icon: <FaWallet className="text-4xl text-blue-600" />,
      title: "Fair Pricing",
      description: "Competitive rates with transparent pricing. No hidden fees, just honest deals for everyone."
    },
    {
      icon: <FaUsers className="text-4xl text-blue-600" />,
      title: "Community Driven",
      description: "Join a community of travelers and hosts who share their unique spaces and stories."
    },
    {
      icon: <FaMapMarkerAlt className="text-4xl text-blue-600" />,
      title: "Worldwide Access",
      description: "Explore destinations near and far. Find your perfect stay or list your property from anywhere."
    }
  ];

  const guestBenefits = [
    "Access to exclusive and unique accommodations",
    "Easy booking process with instant confirmation",
    "24/7 customer support",
    "Flexible cancellation policies",
    "Special deals and rewards for frequent travelers",
    "Personalized recommendations based on your preferences"
  ];

  const hostBenefits = [
    "Easy listing management and calendar sync",
    "Secure payment processing",
    "Marketing tools to reach more guests",
    "Analytics and insights to optimize your listings",
    "Dedicated host support team",
    "Earn rewards and build your hosting reputation"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section id="home" className="relative text-white py-24 md:py-36 lg:py-48 overflow-hidden min-h-[70vh] md:min-h-[75vh]">
         {/* Video Background */}
         <video
           autoPlay
           loop
           muted
           playsInline
           className="absolute inset-0 w-full h-full object-cover"
         >
           <source src={video} type="video/mp4" />
         </video>
         
         {/* Overlay for better text readability */}
         <div className="absolute inset-0 bg-black/30"></div>
         
         {/* Content */}
         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
           <div className="text-center">
             <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
               Discover Extraordinary Experiences
             </h1>
             <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
               Your gateway to unique stays, exclusive venues, and unforgettable memories. 
               Whether you're traveling or hosting, we've got you covered.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <button
                 onClick={() => handleGetStarted("guest")}
                 className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
               >
                 Start Exploring as Guest
               </button>
               <button
                 onClick={() => handleGetStarted("host")}
                 className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-white"
               >
                 Become a Host
               </button>
             </div>
           </div>
         </div>
       </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best experience for both guests and hosts
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-200 transform hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Benefits Section */}
      <section id="guests" className="py-16 md:py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Perfect for Travelers
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Experience the world like never before. Find unique accommodations, exclusive venues, 
                and create memories that last a lifetime.
              </p>
              <ul className="space-y-4">
                {guestBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheckCircle className="text-blue-600 text-xl mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 md:p-12">
              <div className="text-center">
                <FaHome className="text-8xl text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of travelers discovering amazing places around the world
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Host Benefits Section */}
      <section id="hosts" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-blue-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="text-center">
                <FaChartLine className="text-8xl text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Turn Your Space into Income
                </h3>
                <p className="text-gray-600 mb-6">
                  Join our community of hosts and start earning from your unique spaces
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Perfect for Hosts
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Share your unique space with travelers from around the world. 
                Manage your listings easily and grow your hosting business.
              </p>
              <ul className="space-y-4">
                {hostBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheckCircle className="text-blue-600 text-xl mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users already experiencing the future of travel and hosting
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleGetStarted("guest")}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition duration-200 shadow-lg"
            >
              Sign Up as Guest
            </button>
            <button
              onClick={() => handleGetStarted("host")}
              className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-800 transition duration-200 shadow-lg border-2 border-white"
            >
              Sign Up as Host
            </button>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <Loginmodal isOpen={loginOpen} onClose={() => setLoginOpen(false)}>
        <LoginForm
          loginType={loginType}
          onNavigateToGuest={onNavigateToGuest}
          onNavigateToHost={onNavigateToHost}
          onNavigateToAdmin={onNavigateToAdmin}
          onNavigateToHome={() => setLoginOpen(false)}
          onClose={() => setLoginOpen(false)}
          onGoogleSignIn={(userInfo) => {
            setLoginOpen(false);
            if (onShowGoogleSignupModal) {
              onShowGoogleSignupModal(userInfo, loginType);
            }
          }}
        />
      </Loginmodal>
    </div>
  );
};

export default LandingPage;

