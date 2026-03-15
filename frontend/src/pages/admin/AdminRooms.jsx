import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import hotelService from '../../services/hotelService';
import { ChevronLeft, Plus, Edit2, Trash2, Bed, Users } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/media';
import { formatINR } from '../../utils/currency';

const ROOM_TYPE_PRESETS = {
    normal: {
        type: 'Normal Room',
        capacity: 2,
        price: 4500,
        taxes: 650,
        size: '220 sq.ft',
        bedType: 'Queen Bed',
        bathroomCount: 1,
        view: 'City View',
        coupleFriendly: true,
        mealPlans: 'Room Only'
    },
    deluxe: {
        type: 'Deluxe Room',
        capacity: 2,
        price: 7500,
        taxes: 900,
        size: '320 sq.ft',
        bedType: 'King Bed',
        bathroomCount: 1,
        view: 'Garden View',
        coupleFriendly: true,
        mealPlans: 'Breakfast Included'
    },
    luxury: {
        type: 'Luxury Suite',
        capacity: 3,
        price: 12500,
        taxes: 1400,
        size: '450 sq.ft',
        bedType: 'King Bed',
        bathroomCount: 2,
        view: 'Sea View',
        coupleFriendly: true,
        mealPlans: 'Breakfast + Dinner'
    }
};

const getDefaultFormData = () => ({
    ...ROOM_TYPE_PRESETS.normal,
    description: ''
});

const AdminRooms = () => {
    const { hotelId } = useParams();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState(getDefaultFormData);
    const [selectedPreset, setSelectedPreset] = useState('normal');
    const [selectedFiles, setSelectedFiles] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const h = await hotelService.getHotelById(hotelId);
            setHotel(h);
            const r = await hotelService.getRoomsByHotel(hotelId);
            setRooms(r);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [hotelId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            data.append('hotel', hotelId);

            selectedFiles.forEach(file => {
                data.append('roomImages', file);
            });

            if (isEditing) {
                await hotelService.updateRoom(currentId, data);
            } else {
                await hotelService.createRoom(data);
            }

            alert("Room saved successfully!");
            resetForm();
            fetchData();
        } catch (error) {
            console.error("Error saving room:", error);
        }
    };

    const resetForm = () => {
        setFormData(getDefaultFormData());
        setSelectedFiles([]);
        setIsEditing(false);
        setCurrentId(null);
        setSelectedPreset('normal');
    };

    const handleEdit = (room) => {
        setFormData({
            type: room.type,
            capacity: room.capacity,
            price: room.price,
            taxes: room.taxes,
            description: room.description || '',
            size: room.size || '320 sq.ft',
            bedType: room.bedType || 'King Bed',
            bathroomCount: room.bathroomCount || 1,
            view: room.view || 'City View',
            coupleFriendly: room.coupleFriendly,
            mealPlans: room.mealPlans?.[0] || 'Room Only'
        });
        setSelectedPreset('custom');
        setIsEditing(true);
        setCurrentId(room._id);
    };

    const applyRoomPreset = (presetKey) => {
        const preset = ROOM_TYPE_PRESETS[presetKey];
        if (!preset) return;

        setSelectedPreset(presetKey);
        setFormData((prev) => ({
            ...prev,
            ...preset,
            description: prev.description,
        }));
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this room?")) {
            await hotelService.deleteRoom(id);
            fetchData();
        }
    };

    if (!hotel) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#030816] text-white p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <Link to="/admin/hotels" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                    <ChevronLeft size={20} /> Back to Hotels
                </Link>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold glow-text">Manage Rooms: {hotel.name}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="glass p-8 rounded-[40px] border border-white/5 h-fit">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            {isEditing ? <Edit2 size={20} /> : <Plus size={20} />}
                            {isEditing ? 'Edit Room' : 'Add New Room Type'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">Quick Room Presets</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { key: 'normal', label: 'Normal' },
                                        { key: 'deluxe', label: 'Deluxe' },
                                        { key: 'luxury', label: 'Luxury' },
                                    ].map((preset) => (
                                        <button
                                            key={preset.key}
                                            type="button"
                                            onClick={() => applyRoomPreset(preset.key)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors ${selectedPreset === preset.key
                                                    ? 'bg-[#00d2ff]/20 border-[#00d2ff] text-[#00d2ff]'
                                                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-[#00d2ff]/60'
                                                }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <input
                                name="type"
                                placeholder="Room Type (e.g. Deluxe Suite)"
                                value={formData.type}
                                onChange={handleChange}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff] md:col-span-2"
                                required
                            />
                            <input
                                name="price"
                                type="number"
                                placeholder="Price per Night (INR)"
                                value={formData.price}
                                onChange={handleChange}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                                required
                            />
                            <input
                                name="capacity"
                                type="number"
                                placeholder="Capacity (Guests)"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                                required
                            />
                            <input
                                name="size"
                                placeholder="Room Size (e.g. 450 sq.ft)"
                                value={formData.size}
                                onChange={handleChange}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                            />
                            <input
                                name="bedType"
                                placeholder="Bed Type"
                                value={formData.bedType}
                                onChange={handleChange}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                            />
                            <input
                                name="view"
                                placeholder="View (e.g. Ocean View)"
                                value={formData.view}
                                onChange={handleChange}
                                className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                            />
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                                <input
                                    type="checkbox"
                                    name="coupleFriendly"
                                    checked={formData.coupleFriendly}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-[#00d2ff]"
                                />
                                <label className="text-sm">Couple Friendly</label>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold mb-2">Room Photos</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00d2ff]"
                                    accept="image/*"
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-4">
                                <button type="submit" className="flex-1 bg-[#00d2ff] text-white py-3 rounded-xl font-bold hover:bg-[#00b8e6] transition-all active:scale-95">
                                    {isEditing ? 'Update Room' : 'Add Room'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={resetForm} className="bg-white/10 px-6 rounded-xl hover:bg-white/20">Cancel</button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Room List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4">Existing Room Types</h2>
                        {rooms.map(room => (
                            <div key={room._id} className="glass p-6 rounded-3xl border border-white/5 flex gap-4">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-inner bg-gray-800">
                                    {room.images?.[0] && (
                                        <img
                                            src={getOptimizedImageUrl(room.images[0], { width: 280 })}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{room.type}</h3>
                                    <div className="text-sm text-gray-400 space-y-1 mt-1">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><Bed size={14} /> {room.bedType}</span>
                                            <span className="flex items-center gap-1"><Users size={14} /> {room.capacity}</span>
                                        </div>
                                        <p className="text-[#00d2ff] font-black">{formatINR(room.price)} / night</p>
                                    </div>
                                    <div className="flex gap-4 mt-3">
                                        <button onClick={() => handleEdit(room)} className="text-blue-400 hover:underline text-sm font-bold flex items-center gap-1">
                                            <Edit2 size={12} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(room._id)} className="text-red-500 hover:underline text-sm font-bold flex items-center gap-1">
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRooms;
