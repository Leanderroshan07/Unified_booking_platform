import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/media';

const HeroBanner = ({ movie, onWatchTrailer }) => {
    if (!movie) return null;

    const bgUrl = getOptimizedImageUrl(movie.backgroundImage, { width: 1800 });
    const posterUrl = getOptimizedImageUrl(movie.poster, { width: 720 });

    return (
        <section className="relative w-full h-[85vh] overflow-hidden flex items-center">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bgUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent z-10" />
                {/* Subtle Particle Glow Placeholder */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px] animate-pulse z-0" />
            </div>

            <div className="container mx-auto px-6 lg:px-12 relative z-20 flex flex-col lg:flex-row items-center gap-12">
                {/* Movie Poster (Glassmorphism card) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden lg:block w-72 h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-md"
                >
                    <img
                        src={posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />
                </motion.div>

                {/* Movie Info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 text-center lg:text-left"
                >
                    <p className="text-brand-red font-semibold mb-2 tracking-widest uppercase text-sm">Now Showing</p>
                    <h1 className="text-5xl lg:text-7xl font-bold mb-4 tracking-tighter leading-tight font-poppins">
                        {movie.title}
                    </h1>

                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 text-gray-300">
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star size={18} fill="currentColor" />
                            <span className="font-bold text-white text-lg">{movie.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{movie.genre?.join(', ')}</span>
                        <span>•</span>
                        <span>{movie.duration}</span>
                    </div>

                    <p className="max-w-xl text-gray-400 text-lg mb-8 leading-relaxed font-inter">
                        {movie.description || "Experience the mystery and thrill in this cinematic masterpiece. Join the journey beyond the stars in the most anticipated reunion of the year."}
                    </p>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                        <button
                            onClick={onWatchTrailer}
                            className="group relative flex items-center gap-3 bg-brand-red px-8 py-4 rounded-full font-bold text-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,42,42,0.4)] hover:shadow-[0_0_30px_rgba(255,42,42,0.6)]"
                        >
                            <div className="bg-white/20 p-1.5 rounded-full group-hover:bg-white/30 transition-colors">
                                <Play size={18} fill="white" />
                            </div>
                            WATCH TRAILER
                        </button>
                        <button className="px-8 py-4 rounded-full border border-white/20 font-bold hover:bg-white/10 transition-all">
                            LEARN MORE
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroBanner;
