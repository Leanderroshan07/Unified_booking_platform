import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 glass-nav py-4 px-8 flex justify-between items-center">
            <div className="text-2xl font-bold tracking-tight glow-text font-serif">
                <Link to="/" className="text-blue hover:text-blue">Stay Booking</Link>
            </div>

            <div className="flex items-center gap-4">
                {/* My Account removed as per user request */}
            </div>
        </nav>
    );
};

export default Navbar;
