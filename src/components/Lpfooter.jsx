import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaGlobe } from "react-icons/fa";

const Lpfooter = () => {
    return (
        <footer className="bg-gray-50 text-gray-700">
            <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Top Section - Three Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
                        {/* Support Column */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:underline cursor-pointer">Help Centre</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">AirCover</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Anti-discrimination</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Disability support</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Cancellation options</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Report neighbourhood concern</a></li>
                            </ul>
                        </div>

                        {/* Hosting Column */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Hosting</h3>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:underline cursor-pointer">Airbnb your home</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">AirCover for Hosts</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Hosting resources</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Community forum</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Hosting responsibly</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Join a free Hosting class</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Find a co-host</a></li>
                            </ul>
                        </div>

                        {/* ReserGo Column */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">ReserGo</h3>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:underline cursor-pointer">Newsroom</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">New features</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Careers</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">Investors</a></li>
                                <li><a href="#" className="hover:underline cursor-pointer">ReserGo.org emergency stays</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-300 my-8"></div>

                    {/* Bottom Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        {/* Left Side - Copyright and Legal Links */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <p className="text-sm text-gray-700">© 2024 ReserGo, Inc.</p>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <a href="#" className="hover:underline">Privacy</a>
                                <span className="text-gray-400">•</span>
                                <a href="#" className="hover:underline">Terms</a>
                            </div>
                        </div>

                        {/* Right Side - Language/Currency and Social Media */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Language/Currency Selector */}
                            <div className="flex items-center gap-2 text-sm">
                                <FaGlobe className="text-gray-700" />
                                <span className="hover:underline cursor-pointer">English (UN)</span>
                            </div>

                            {/* Social Media Icons */}
                            <div className="flex items-center gap-3">
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition">
                                    <FaFacebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition">
                                    <FaTwitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="text-gray-700 hover:text-gray-900 transition">
                                    <FaInstagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Lpfooter;
