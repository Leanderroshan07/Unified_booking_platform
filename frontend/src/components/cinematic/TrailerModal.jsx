import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getTrailerSource } from '../../utils/media';

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
    if (!isOpen) return null;

    const trailer = getTrailerSource(trailerUrl);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-5xl aspect-video bg-dark-bg rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 p-2 bg-black/60 rounded-full text-white hover:bg-brand-red transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {trailer.type === 'youtube' ? (
                        <iframe
                            title={`${movieTitle || 'Movie'} trailer`}
                            src={trailer.url}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : trailer.type === 'video' ? (
                        <video
                            controls
                            autoPlay
                            preload="metadata"
                            className="w-full h-full object-cover"
                        >
                            <source src={trailer.url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                            <span className="text-2xl font-bold">No Trailer Available</span>
                            <p>The trailer for {movieTitle} hasn't been added yet.</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TrailerModal;
