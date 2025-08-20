import React from 'react'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import LogoComponents from './LogoComponents'

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo and description */}
                    <div className="flex flex-col space-y-4">
                        <LogoComponents />
                        <p className="text-gray-600 mt-2">
                            Modern employee management system for businesses of all sizes.
                        </p>
                    </div>
                    
                    {/* Quick links */}
                    <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-psmbold text-gray-800 mb-2">Quick Links</h3>
                        <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">About Us</a>
                        <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">Features</a>
                        <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">Pricing</a>
                        <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">Contact</a>
                    </div>
                    
                    {/* Contact */}
                    <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-psmbold text-gray-800 mb-2">Connect</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">
                                <FaGithub size={20} />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">
                                <FaLinkedin size={20} />
                            </a>
                            <a href="#" className="text-gray-600 hover:text-primary transition-colors duration-200">
                                <FaTwitter size={20} />
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-600 text-sm">
                        {new Date().getFullYear()} Sourav. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-600 hover:text-primary text-sm transition-colors duration-200">Privacy Policy</a>
                        <a href="#" className="text-gray-600 hover:text-primary text-sm transition-colors duration-200">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer