import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Search, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: "MOVIES", href: "/movies" },
        { name: "FLIGHTS", href: "/flights" },
        { name: "TRAINS", href: "/trains" },
        { name: "HOTELS", href: "/hotels" },
        { name: "BUSES", href: "/buses" },
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-dark-bg/90 backdrop-blur-xl py-4 shadow-2xl" : "bg-transparent py-6"
            }`}>
            <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2 text-white">
                    <Film className="text-brand-red" size={28} />
                    <span className="text-2xl font-bold tracking-tighter">Unified<span className="text-brand-red">Booking</span></span>
                </Link>

                {/* Actions - Pushed to right since links are removed */}
                <div className="flex items-center gap-6">
                    <button className="text-gray-300 hover:text-white transition-colors hidden md:block">
                        <Search size={22} />
                    </button>

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-dark-bg/95 backdrop-blur-3xl border-b border-white/10"
                    >
                        <div className="flex flex-col items-center py-12 gap-8 text-xl font-bold">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className="text-gray-300 hover:text-brand-red transition-colors">{link.name}</a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
