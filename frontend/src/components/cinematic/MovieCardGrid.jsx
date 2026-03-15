import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Info, Search } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/media';

const MovieCard = ({ movie, onClick }) => {
    const posterUrl = getOptimizedImageUrl(movie.poster, { width: 560 });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            onClick={() => onClick(movie)}
            className="group relative bg-dark-bg/40 rounded-2xl overflow-hidden cursor-pointer border border-white/5 transition-all shadow-xl hover:shadow-brand-red/10"
        >
            {/* Poster Image */}
            <div className="aspect-[2/3] overflow-hidden relative">
                <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                        <Star size={16} fill="currentColor" />
                        <span className="text-white font-bold">{movie.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-xs mb-4">
                        <Clock size={14} />
                        <span>{movie.duration}</span>
                    </div>
                    <button className="bg-brand-red/90 text-white w-full py-2 rounded-lg font-bold text-sm backdrop-blur-sm flex items-center justify-center gap-2 hover:bg-brand-red transition-colors">
                        BOOK NOW
                    </button>
                </div>

                {/* Categories / Badges */}
                <div className="absolute top-4 right-4 bg-brand-red/80 backdrop-blur-md text-[10px] font-extrabold px-2 py-1 rounded text-white uppercase tracking-tighter">
                    HD
                </div>
            </div>

            {/* Basic Info (Visible always) */}
            <div className="p-4 bg-gradient-to-b from-dark-bg/60 to-dark-bg/95">
                <h3 className="font-bold text-gray-100 truncate group-hover:text-brand-red transition-colors">{movie.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{movie.genre?.join(', ')}</p>
            </div>
        </motion.div>
    );
};

const MovieCardGrid = ({ movies, onMovieClick }) => {
    const categories = ["Now Showing"];

    return (
        <section className="container mx-auto px-6 lg:px-12 py-16">
            <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                <div className="flex flex-wrap items-center gap-8">
                    {categories.map((cat, i) => (
                        <button
                            key={cat}
                            className={`text-lg font-bold transition-all relative py-2 ${i === 0 ? "text-white" : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            {cat}
                            {i === 0 && (
                                <motion.div
                                    layoutId="activeCategory"
                                    className="absolute bottom-0 left-0 w-full h-1 bg-brand-red rounded-full shadow-[0_0_10px_rgba(255,42,42,0.8)]"
                                />
                            )}
                        </button>
                    ))}
                </div>


            </div>

            <div className="flex flex-wrap justify-center gap-10">
                {movies.map((movie) => (
                    <div key={movie._id} className="w-[280px]">
                        <MovieCard movie={movie} onClick={onMovieClick} />
                    </div>
                ))}
            </div>

            <div className="mt-16 flex justify-center">
                <button className="bg-white/5 border border-white/10 px-12 py-4 rounded-xl font-bold text-gray-300 hover:bg-brand-red hover:text-white hover:border-brand-red transition-all shadow-lg active:scale-95">
                    SHOW MORE
                </button>
            </div>
        </section>
    );
};

export default MovieCardGrid;
