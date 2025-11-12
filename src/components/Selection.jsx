import React from "react";

const Selection = ({ activeLink, setActiveLink }) => {

    return (
        <div className="bg-white px-4 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-7xl mx-auto">
                <nav className="flex items-center gap-8 py-6">
                <button
                    onClick={() => setActiveLink("Home")}
                    className={`${
                        activeLink === "Home"
                            ? "font-bold text-gray-800 border-b-2 border-blue-600 pb-2"
                            : "font-normal text-gray-500"
                    } text-base transition-colors duration-200`}
                >
                    Home
                </button>
                
                <button
                    onClick={() => setActiveLink("Experiences")}
                    className={`${
                        activeLink === "Experiences"
                            ? "font-bold text-gray-800 border-b-2 border-blue-600 pb-2"
                            : "font-normal text-gray-500"
                    } text-base transition-colors duration-200`}
                >
                    Experiences
                </button>
                
                <button
                    onClick={() => setActiveLink("Selection")}
                    className={`${
                        activeLink === "Selection"
                            ? "font-bold text-gray-800 border-b-2 border-blue-600 pb-2"
                            : "font-normal text-gray-500"
                    } text-base transition-colors duration-200`}
                >
                    Services
                </button>
            </nav>
            </div>
        </div>
    );
};

export default Selection;

