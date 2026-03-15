import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import hotelService from '../../services/hotelService';
import { AI_MOOD_TAG_OPTIONS, hasTag, toggleTag } from '../../utils/adminAiTags';
import { getOptimizedImageUrl } from '../../utils/media';
import { formatINR } from '../../utils/currency';

const AdminHotels = () => {
    const [hotels, setHotels] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        price: '',
        description: '',
        starCategory: '3',
        rating: '0',
        distanceFromAirport: '',
        travelTime: '',
        popularityScore: '5',
        recommendationWeight: '5',
        distanceScore: '5',
        tags: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [currentHotel, setCurrentHotel] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const data = await hotelService.getHotels();
            setHotels(data);
        } catch (error) {
            console.error("Error fetching hotels:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTagToggle = (tag, checked) => {
        setFormData((prev) => ({
            ...prev,
            tags: toggleTag(prev.tags, tag, checked),
        }));
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            location: '',
            price: '',
            description: '',
            starCategory: '3',
            rating: '0',
            distanceFromAirport: '',
            travelTime: '',
            popularityScore: '5',
            recommendationWeight: '5',
            distanceScore: '5',
            tags: ''
        });
        setSelectedFiles([]);
        setIsEditing(false);
        setCurrentId(null);
        setCurrentHotel(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            selectedFiles.forEach(file => {
                data.append('hotelImages', file);
            });

            if (isEditing) {
                await hotelService.updateHotel(currentId, data);
            } else {
                await hotelService.createHotel(data);
            }
            resetForm();
            fetchHotels();
            alert("Hotel saved successfully! 🏨");
        } catch (error) {
            console.error("Error saving hotel:", error);
            alert("Failed to save hotel.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (hotel) => {
        setFormData({
            name: hotel.name || '',
            location: hotel.location || '',
            price: hotel.price || '',
            description: hotel.description || '',
            starCategory: String(hotel.starCategory || 3),
            rating: String(hotel.rating ?? 0),
            distanceFromAirport: hotel.distanceFromAirport || '',
            travelTime: hotel.travelTime || '',
            popularityScore: String(hotel.popularityScore ?? 5),
            recommendationWeight: String(hotel.recommendationWeight ?? 5),
            distanceScore: String(hotel.distanceScore ?? 5),
            tags: hotel.tags?.join(', ') || ''
        });
        setSelectedFiles([]);
        setIsEditing(true);
        setCurrentId(hotel._id);
        setCurrentHotel(hotel);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await hotelService.deleteHotel(id);
                fetchHotels();
            } catch (error) {
                console.error("Error deleting hotel:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#030816] text-white p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 glow-text">Manage Hotels</h1>

                {/* Form */}
                <div className="glass p-8 rounded-3xl mb-12">
                    <h2 className="text-xl font-bold mb-6">{isEditing ? 'Edit Hotel' : 'Add New Hotel'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isEditing && (
                            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
                                <p className="text-sm font-bold text-[#00d2ff] mb-3">Current Hotel Media</p>
                                <div className="flex flex-wrap gap-4">
                                    {(currentHotel?.images || []).length > 0 ? (
                                        currentHotel.images.slice(0, 4).map((image, index) => (
                                            <img
                                                key={`${currentHotel._id}-${index}`}
                                                src={getOptimizedImageUrl(image, { width: 240 })}
                                                alt={`${currentHotel?.name || 'Hotel'} ${index + 1}`}
                                                className="w-28 h-20 rounded-xl object-cover border border-white/10"
                                            />
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400">No images uploaded yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <input
                            name="name"
                            placeholder="Hotel Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                            required
                        />
                        <input
                            name="location"
                            placeholder="Location"
                            value={formData.location}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                            required
                        />
                        <input
                            name="price"
                            type="number"
                            placeholder="Price (INR)"
                            value={formData.price}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                            required
                        />
                        <input
                            name="distanceFromAirport"
                            placeholder="Distance from Airport (e.g. 12km)"
                            value={formData.distanceFromAirport}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                        />
                        <input
                            name="travelTime"
                            placeholder="Travel Time (e.g. 20 min)"
                            value={formData.travelTime}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                        />
                        <select
                            name="starCategory"
                            value={formData.starCategory}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff] text-gray-400"
                        >
                            <option value="1">1 Star</option>
                            <option value="2">2 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="5">5 Stars</option>
                        </select>
                        <input
                            name="rating"
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            placeholder="Rating (0-5)"
                            value={formData.rating}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                        />
                        <textarea
                            name="description"
                            placeholder="Hotel Description"
                            value={formData.description}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff] md:col-span-2 h-32"
                        />
                        <input
                            name="popularityScore"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="Popularity Score (0-10)"
                            value={formData.popularityScore}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                        />
                        <input
                            name="recommendationWeight"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="Recommendation Weight (0-10)"
                            value={formData.recommendationWeight}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                        />
                        <input
                            name="distanceScore"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="Distance Score (0-10)"
                            value={formData.distanceScore}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                        />
                        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <label className="block text-sm font-bold mb-3">AI Mood Tags</label>
                            <div className="flex flex-wrap gap-3">
                                {AI_MOOD_TAG_OPTIONS.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${hasTag(formData.tags, option.value) ? 'border-[#00d2ff]/40 bg-[#00d2ff]/10 text-[#8de9ff]' : 'border-white/10 bg-white/5 text-white/80'}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={hasTag(formData.tags, option.value)}
                                            onChange={(event) => handleTagToggle(option.value, event.target.checked)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <input
                            name="tags"
                            placeholder="Additional AI Tags (comma separated)"
                            value={formData.tags}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff] md:col-span-2"
                        />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold mb-2">Upload Hotel Gallery Images {isEditing ? '(leave blank to keep current)' : ''}</label>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                                accept="image/*"
                            />
                            {selectedFiles.length > 0 && <p className="mt-2 text-sm text-[#00d2ff]">{selectedFiles.length} files selected</p>}
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full bg-[#00d2ff] text-white py-3 rounded-xl font-bold hover:bg-[#00b8e6] transition-colors shadow-lg shadow-[#00d2ff]/20">
                                {isSaving ? 'Saving...' : isEditing ? 'Update Hotel' : 'Create Hotel'}
                            </button>
                        </div>
                        {isEditing && (
                            <div className="md:col-span-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full border border-white/20 py-3 rounded-xl font-bold text-white/80 hover:text-white hover:border-white/40"
                                >
                                    Cancel Edit
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {hotels.map(hotel => (
                        <div key={hotel._id} className="glass p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {hotel.images[0] && (
                                    <img
                                        src={getOptimizedImageUrl(hotel.images[0], { width: 240 })}
                                        className="w-16 h-16 rounded-xl object-cover"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                )}
                                <div>
                                    <h3 className="text-lg font-bold">{hotel.name}</h3>
                                    <p className="text-gray-400 text-sm">{hotel.location} — {hotel.starCategory}★ — {formatINR(hotel.price)}</p>
                                </div>
                            </div>
                            <div className="flex gap-6 items-center w-full md:w-auto justify-end">
                                <Link to={`/admin/hotels/${hotel._id}/rooms`} className="text-orange-500 font-bold hover:underline">Manage Rooms</Link>
                                <button onClick={() => handleEdit(hotel)} className="text-[#00d2ff] hover:underline font-bold">Edit</button>
                                <button onClick={() => handleDelete(hotel._id)} className="text-red-500 hover:underline font-bold">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminHotels;
