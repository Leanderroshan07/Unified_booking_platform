import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import hotelService from '../../services/hotelService';
import * as movieService from "../../services/adminMovieService";
import * as flightService from "../../services/flightService";
import * as busService from "../../services/busService";
import * as trainService from "../../services/trainService";
import * as routeMatrixService from "../../services/routeMatrixService";
import { AI_MOOD_TAG_OPTIONS, hasTag, toggleTag } from '../../utils/adminAiTags';
import { getOptimizedImageUrl } from '../../utils/media';
import { formatINR } from '../../utils/currency';
import {
    Plus, Edit2, Trash2, Bed, Users, Building2,
    Settings, Image as ImageIcon, Layout, ChevronRight,
    CheckCircle2, AlertCircle, Maximize, Film, Video, Star, MapPin, AlignLeft,
    PlaneTakeoff, Clock3, BusFront, TrainFront
} from 'lucide-react';

const toDateTimeInputValue = (value) => {
    if (!value) {
        return '';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    const localTime = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
    return localTime.toISOString().slice(0, 16);
};

const AdminPanel = () => {
    const { hotelId: routeHotelId } = useParams();

    // Hotel State
    const [hotels, setHotels] = useState([]);
    const [selectedHotelId, setSelectedHotelId] = useState(routeHotelId || null);
    const [activeTab, setActiveTab] = useState(routeHotelId ? 'rooms' : 'hotels');

    // Movie State
    const [movies, setMovies] = useState([]);
    const [movieForm, setMovieForm] = useState({
        title: "", description: "", genre: "", duration: "", language: "", releaseYear: "", cast: "", rating: "", location: "", storyline: "",
        popularityScore: "5", recommendationWeight: "5", distanceScore: "5",
        travelTime: "", tags: ""
    });
    const [movieFiles, setMovieFiles] = useState({
        poster: null, backgroundImage: null, trailer: null
    });
    const [isEditingMovie, setIsEditingMovie] = useState(false);
    const [currentMovieId, setCurrentMovieId] = useState(null);

    // Flight State
    const [flights, setFlights] = useState([]);
    const [trains, setTrains] = useState([]);
    const [buses, setBuses] = useState([]);
    const [routeMatrixRows, setRouteMatrixRows] = useState([]);
    const [routeMatrixForm, setRouteMatrixForm] = useState({
        from: '',
        to: '',
        distanceKm: '',
        flightMinutes: '',
        trainMinutes: '',
        busMinutes: '',
    });
    const [isEditingRouteMatrix, setIsEditingRouteMatrix] = useState(false);
    const [currentRouteMatrixId, setCurrentRouteMatrixId] = useState(null);
    const [flightForm, setFlightForm] = useState({
        airline: '',
        origin: '',
        destination: '',
        price: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        cabinClasses: 'Economy, Premium, Deluxe',
        luggageAllowance: '25kg check-in + 7kg cabin',
        mealOptions: 'Veg Meal, Non-Veg Meal, Continental',
        aircraft: '',
        description: '',
        popularityScore: '5',
        recommendationWeight: '5',
        distanceScore: '5',
        travelTime: '',
        tags: 'transport, flight',
        isFeatured: false,
    });
    const [flightFile, setFlightFile] = useState(null);
    const [isEditingFlight, setIsEditingFlight] = useState(false);
    const [currentFlightId, setCurrentFlightId] = useState(null);

    useEffect(() => {
        if (routeHotelId) {
            setSelectedHotelId(routeHotelId);
            setActiveTab('rooms');
        }
    }, [routeHotelId]);

    const [hotelData, setHotelData] = useState({
        name: '', location: '', price: '', description: '',
        starCategory: 3, rating: '0', distanceFromAirport: '', images: [],
        popularityScore: '5', recommendationWeight: '5', distanceScore: '5',
        travelTime: '', tags: 'hotel, stay'
    });
    const [hotelFiles, setHotelFiles] = useState([]);

    // Room State
    const [rooms, setRooms] = useState([]);
    const [roomData, setRoomData] = useState({
        type: '', capacity: 2, price: '', taxes: 45, description: '',
        size: '320 sq.ft', bedType: 'King Bed', bathroomCount: 1,
        view: 'City View', coupleFriendly: true, mealPlans: 'Room Only'
    });
    const [roomFiles, setRoomFiles] = useState([]);
    const [isEditingRoom, setIsEditingRoom] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState(null);

    // Global loading/editing
    const [isEditingHotel, setIsEditingHotel] = useState(false);
    const [isSavingHotel, setIsSavingHotel] = useState(false);
    const [isSavingMovie, setIsSavingMovie] = useState(false);
    const [isSavingFlight, setIsSavingFlight] = useState(false);
    const [isSavingRouteMatrix, setIsSavingRouteMatrix] = useState(false);

    useEffect(() => {
        fetchHotels();
        fetchMovies();
        fetchFlights();
        fetchTrains();
        fetchBuses();
        fetchRouteMatrix();
    }, []);

    useEffect(() => {
        if (selectedHotelId) {
            fetchRooms(selectedHotelId);
        }
    }, [selectedHotelId]);

    const fetchHotels = async () => {
        try {
            const data = await hotelService.getHotels();
            setHotels(data);
        } catch (error) {
            console.error("Error fetching hotels:", error);
        }
    };

    const fetchRooms = async (hotelId) => {
        try {
            const data = await hotelService.getRoomsByHotel(hotelId);
            setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    const fetchMovies = async () => {
        try {
            const res = await movieService.getMovies();
            setMovies(res.data);
        } catch (error) {
            console.error("Failed to load movies", error);
        }
    };

    const fetchFlights = async () => {
        try {
            const data = await flightService.getFlights();
            setFlights(data);
        } catch (error) {
            console.error("Failed to load flights", error);
        }
    };

    const fetchTrains = async () => {
        try {
            const data = await trainService.getTrains();
            setTrains(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load trains", error);
            setTrains([]);
        }
    };

    const fetchBuses = async () => {
        try {
            const data = await busService.getBuses();
            setBuses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load buses", error);
            setBuses([]);
        }
    };

    const fetchRouteMatrix = async () => {
        try {
            const data = await routeMatrixService.getRoutes();
            setRouteMatrixRows(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load route matrix", error);
            setRouteMatrixRows([]);
        }
    };

    // Hotel Handlers
    const handleHotelChange = (e) => {
        setHotelData({ ...hotelData, [e.target.name]: e.target.value });
    };

    const handleHotelTagToggle = (tag, checked) => {
        setHotelData((prev) => ({
            ...prev,
            tags: toggleTag(prev.tags, tag, checked),
        }));
    };

    const handleHotelFileChange = (e) => {
        setHotelFiles(Array.from(e.target.files));
    };

    const handleHotelSubmit = async (e) => {
        e.preventDefault();
        setIsSavingHotel(true);
        try {
            const data = new FormData();
            Object.keys(hotelData).forEach(key => {
                if (key !== 'images') data.append(key, hotelData[key]);
            });
            hotelFiles.forEach(file => data.append('hotelImages', file));

            if (isEditingHotel) {
                await hotelService.updateHotel(selectedHotelId, data);
            } else {
                await hotelService.createHotel(data);
            }
            alert("Hotel saved successfully! 🏨");
            resetHotelForm();
            fetchHotels();
        } catch (error) {
            console.error("Error saving hotel:", error);
        } finally {
            setIsSavingHotel(false);
        }
    };

    const resetHotelForm = () => {
        setHotelData({
            name: '',
            location: '',
            price: '',
            description: '',
            starCategory: 3,
            rating: '0',
            distanceFromAirport: '',
            images: [],
            popularityScore: '5',
            recommendationWeight: '5',
            distanceScore: '5',
            travelTime: '',
            tags: 'hotel, stay'
        });
        setHotelFiles([]);
        setIsEditingHotel(false);
        if (!isEditingHotel) setSelectedHotelId(null);
    };

    const startEditHotel = (hotel) => {
        setHotelData({
            name: hotel.name, location: hotel.location, price: hotel.price,
            description: hotel.description, starCategory: hotel.starCategory || 3,
            rating: hotel.rating ?? '0',
            distanceFromAirport: hotel.distanceFromAirport || '', images: hotel.images,
            popularityScore: hotel.popularityScore ?? '5',
            recommendationWeight: hotel.recommendationWeight ?? '5',
            distanceScore: hotel.distanceScore ?? '5',
            travelTime: hotel.travelTime || '',
            tags: hotel.tags?.join(', ') || ''
        });
        setSelectedHotelId(hotel._id);
        setIsEditingHotel(true);
        setActiveTab('edit-hotel');
    };

    const selectHotelForRooms = (hotel) => {
        setSelectedHotelId(hotel._id);
        setActiveTab('rooms');
    };

    const handleDeleteHotel = async (hotelId) => {
        if (!window.confirm("Delete this hotel? This cannot be undone.")) {
            return;
        }

        try {
            await hotelService.deleteHotel(hotelId);
            if (selectedHotelId === hotelId) {
                setSelectedHotelId(null);
                setActiveTab('hotels');
            }
            fetchHotels();
        } catch (error) {
            console.error("Error deleting hotel:", error);
            alert("Failed to delete hotel.");
        }
    };

    // Room Handlers
    const handleRoomChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setRoomData({ ...roomData, [e.target.name]: value });
    };

    const handleRoomFileChange = (e) => {
        setRoomFiles(Array.from(e.target.files));
    };

    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(roomData).forEach(key => data.append(key, roomData[key]));
            data.append('hotel', selectedHotelId);
            roomFiles.forEach(file => data.append('roomImages', file));

            if (isEditingRoom) {
                await hotelService.updateRoom(currentRoomId, data);
            } else {
                await hotelService.createRoom(data);
            }
            alert("Room saved successfully!");
            resetRoomForm();
            fetchRooms(selectedHotelId);
        } catch (error) {
            console.error("Error saving room:", error);
        }
    };

    const resetRoomForm = () => {
        setRoomData({
            type: '', capacity: 2, price: '', taxes: 45, description: '',
            size: '320 sq.ft', bedType: 'King Bed', bathroomCount: 1,
            view: 'City View', coupleFriendly: true, mealPlans: 'Room Only'
        });
        setRoomFiles([]);
        setIsEditingRoom(false);
        setCurrentRoomId(null);
    };

    const startEditRoom = (room) => {
        setRoomData({
            type: room.type, capacity: room.capacity, price: room.price, taxes: room.taxes,
            description: room.description || '', size: room.size || '320 sq.ft',
            bedType: room.bedType || 'King Bed', bathroomCount: room.bathroomCount || 1,
            view: room.view || 'City View', coupleFriendly: room.coupleFriendly,
            mealPlans: room.mealPlans?.[0] || 'Room Only'
        });
        setIsEditingRoom(true);
        setCurrentRoomId(room._id);
    };

    // Movie Handlers
    const handleMovieChange = (e) => {
        setMovieForm({ ...movieForm, [e.target.name]: e.target.value });
    };

    const handleMovieTagToggle = (tag, checked) => {
        setMovieForm((prev) => ({
            ...prev,
            tags: toggleTag(prev.tags, tag, checked),
        }));
    };

    const handleMovieFileChange = (e) => {
        setMovieFiles({ ...movieFiles, [e.target.name]: e.target.files[0] });
    };

    const handleMovieSubmit = async (e) => {
        e.preventDefault();
        setIsSavingMovie(true);
        try {
            const formData = new FormData();
            formData.append("title", movieForm.title);
            formData.append("description", movieForm.description);
            formData.append("genre", movieForm.genre);
            formData.append("duration", movieForm.duration);
            formData.append("language", movieForm.language);
            if (movieForm.releaseYear) formData.append("releaseYear", movieForm.releaseYear);
            formData.append("cast", movieForm.cast);
            formData.append("rating", movieForm.rating);
            formData.append("location", movieForm.location);
            formData.append("storyline", movieForm.storyline);
            formData.append("popularityScore", movieForm.popularityScore);
            formData.append("recommendationWeight", movieForm.recommendationWeight);
            formData.append("distanceScore", movieForm.distanceScore);
            formData.append("travelTime", movieForm.travelTime);
            formData.append("tags", movieForm.tags);

            if (movieFiles.poster) formData.append("poster", movieFiles.poster);
            if (movieFiles.backgroundImage) formData.append("backgroundImage", movieFiles.backgroundImage);
            if (movieFiles.trailer) formData.append("trailer", movieFiles.trailer);

            if (isEditingMovie && currentMovieId) {
                await movieService.updateMovie(currentMovieId, formData);
            } else {
                await movieService.addMovie(formData);
            }

            setMovieForm({
                title: "",
                description: "",
                genre: "",
                duration: "",
                language: "",
                releaseYear: "",
                cast: "",
                rating: "",
                location: "",
                storyline: "",
                popularityScore: "5",
                recommendationWeight: "5",
                distanceScore: "5",
                travelTime: "",
                tags: ""
            });
            setMovieFiles({ poster: null, backgroundImage: null, trailer: null });
            setIsEditingMovie(false);
            setCurrentMovieId(null);
            fetchMovies();
            alert(isEditingMovie ? "Movie updated successfully!" : "Movie added successfully! 🎬");
        } catch (error) {
            console.error("Failed to add movie", error);
        } finally {
            setIsSavingMovie(false);
        }
    };

    const startEditMovie = (movie) => {
        setMovieForm({
            title: movie.title || "",
            description: movie.description || "",
            genre: movie.genre?.join(', ') || "",
            duration: movie.duration || "",
            language: movie.language || "",
            releaseYear: movie.releaseYear || "",
            cast: movie.cast?.join(', ') || "",
            rating: movie.rating || "",
            location: movie.location || "",
            storyline: movie.storyline || movie.description || "",
            popularityScore: movie.popularityScore ?? "5",
            recommendationWeight: movie.recommendationWeight ?? "5",
            distanceScore: movie.distanceScore ?? "5",
            travelTime: movie.travelTime || "",
            tags: movie.tags?.join(', ') || "",
        });
        setMovieFiles({ poster: null, backgroundImage: null, trailer: null });
        setIsEditingMovie(true);
        setCurrentMovieId(movie._id);
    };

    const resetMovieForm = () => {
        setMovieForm({
            title: "",
            description: "",
            genre: "",
            duration: "",
            language: "",
            releaseYear: "",
            cast: "",
            rating: "",
            location: "",
            storyline: "",
            popularityScore: "5",
            recommendationWeight: "5",
            distanceScore: "5",
            travelTime: "",
            tags: ""
        });
        setMovieFiles({ poster: null, backgroundImage: null, trailer: null });
        setIsEditingMovie(false);
        setCurrentMovieId(null);
    };

    const handleDeleteMovie = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await movieService.deleteMovie(id);
                if (currentMovieId === id) {
                    resetMovieForm();
                }
                fetchMovies();
            } catch (error) {
                console.error("Failed to delete movie", error);
                alert("Failed to delete movie.");
            }
        }
    };

    // Flight Handlers
    const handleFlightChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFlightForm({ ...flightForm, [e.target.name]: value });
    };

    const handleFlightTagToggle = (tag, checked) => {
        setFlightForm((prev) => ({
            ...prev,
            tags: toggleTag(prev.tags, tag, checked),
        }));
    };

    const handleFlightFileChange = (e) => {
        setFlightFile(e.target.files?.[0] || null);
    };

    const resetFlightForm = () => {
        setFlightForm({
            airline: '',
            origin: '',
            destination: '',
            price: '',
            departureTime: '',
            arrivalTime: '',
            duration: '',
            cabinClasses: 'Economy, Premium, Deluxe',
            luggageAllowance: '25kg check-in + 7kg cabin',
            mealOptions: 'Veg Meal, Non-Veg Meal, Continental',
            aircraft: '',
            description: '',
            popularityScore: '5',
            recommendationWeight: '5',
            distanceScore: '5',
            travelTime: '',
            tags: 'transport, flight',
            isFeatured: false,
        });
        setFlightFile(null);
        setIsEditingFlight(false);
        setCurrentFlightId(null);
    };

    const startEditFlight = (flight) => {
        setFlightForm({
            airline: flight.airline || '',
            origin: flight.origin || '',
            destination: flight.destination || '',
            price: flight.price || '',
            departureTime: toDateTimeInputValue(flight.departureTime),
            arrivalTime: toDateTimeInputValue(flight.arrivalTime),
            duration: flight.duration || '',
            cabinClasses: flight.cabinClasses?.join(', ') || 'Economy, Premium, Deluxe',
            luggageAllowance: flight.luggageAllowance || '25kg check-in + 7kg cabin',
            mealOptions: flight.mealOptions?.join(', ') || 'Veg Meal, Non-Veg Meal, Continental',
            aircraft: flight.aircraft || '',
            description: flight.description || '',
            popularityScore: flight.popularityScore ?? '5',
            recommendationWeight: flight.recommendationWeight ?? '5',
            distanceScore: flight.distanceScore ?? '5',
            travelTime: flight.travelTime || '',
            tags: flight.tags?.join(', ') || 'transport, flight',
            isFeatured: Boolean(flight.isFeatured),
        });
        setFlightFile(null);
        setIsEditingFlight(true);
        setCurrentFlightId(flight._id);
        setActiveTab('flights');
    };

    const handleFlightSubmit = async (e) => {
        e.preventDefault();
        setIsSavingFlight(true);

        try {
            const formData = new FormData();
            Object.entries(flightForm).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (flightFile) {
                formData.append('image', flightFile);
            }

            if (isEditingFlight && currentFlightId) {
                await flightService.updateFlight(currentFlightId, formData);
            } else {
                await flightService.createFlight(formData);
            }

            await fetchFlights();
            resetFlightForm();
            alert(isEditingFlight ? 'Flight updated successfully! ✈️' : 'Flight added successfully! ✈️');
        } catch (error) {
            console.error('Failed to save flight', error);
            alert('Failed to save flight.');
        } finally {
            setIsSavingFlight(false);
        }
    };

    const handleDeleteFlight = async (id) => {
        if (!window.confirm('Delete this flight?')) {
            return;
        }

        try {
            await flightService.deleteFlight(id);
            if (currentFlightId === id) {
                resetFlightForm();
            }
            fetchFlights();
        } catch (error) {
            console.error('Failed to delete flight', error);
            alert('Failed to delete flight.');
        }
    };

    const handleRouteMatrixChange = (e) => {
        setRouteMatrixForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const resetRouteMatrixForm = () => {
        setRouteMatrixForm({
            from: '',
            to: '',
            distanceKm: '',
            flightMinutes: '',
            trainMinutes: '',
            busMinutes: '',
        });
        setIsEditingRouteMatrix(false);
        setCurrentRouteMatrixId(null);
    };

    const startEditRouteMatrix = (row) => {
        setRouteMatrixForm({
            from: row.from || '',
            to: row.to || '',
            distanceKm: row.distanceKm ?? '',
            flightMinutes: row?.travelMinutes?.flight ?? '',
            trainMinutes: row?.travelMinutes?.train ?? '',
            busMinutes: row?.travelMinutes?.bus ?? '',
        });
        setIsEditingRouteMatrix(true);
        setCurrentRouteMatrixId(row._id);
        setActiveTab('route-matrix');
    };

    const handleRouteMatrixSubmit = async (e) => {
        e.preventDefault();
        setIsSavingRouteMatrix(true);

        try {
            const payload = {
                from: routeMatrixForm.from,
                to: routeMatrixForm.to,
                distanceKm: routeMatrixForm.distanceKm,
                flightMinutes: routeMatrixForm.flightMinutes,
                trainMinutes: routeMatrixForm.trainMinutes,
                busMinutes: routeMatrixForm.busMinutes,
            };

            if (isEditingRouteMatrix && currentRouteMatrixId) {
                await routeMatrixService.updateRoute(currentRouteMatrixId, payload);
            } else {
                await routeMatrixService.createRoute(payload);
            }

            await fetchRouteMatrix();
            resetRouteMatrixForm();
            alert(isEditingRouteMatrix ? 'Route updated successfully.' : 'Route added successfully.');
        } catch (error) {
            console.error('Failed to save route matrix', error);
            alert(error?.response?.data?.message || 'Failed to save route matrix data.');
        } finally {
            setIsSavingRouteMatrix(false);
        }
    };

    const handleDeleteRouteMatrix = async (id) => {
        if (!window.confirm('Delete this route matrix entry?')) {
            return;
        }

        try {
            await routeMatrixService.deleteRoute(id);
            if (currentRouteMatrixId === id) {
                resetRouteMatrixForm();
            }
            await fetchRouteMatrix();
        } catch (error) {
            console.error('Failed to delete route matrix', error);
            alert(error?.response?.data?.message || 'Failed to delete route matrix entry.');
        }
    };

    return (
        <div className="min-h-screen bg-[#030816] text-white flex">
            {/* Left Sidebar - Navigation */}
            <div className="w-80 border-r border-white/5 bg-black/20 backdrop-blur-3xl overflow-y-auto hidden lg:block pb-20 pt-24">
                <div className="px-6 mb-8 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Building2 size={20} className="text-[#00d2ff]" /> Properties
                    </h2>
                    <button
                        onClick={() => { resetHotelForm(); setActiveTab('edit-hotel'); }}
                        className="bg-[#00d2ff]/10 text-[#00d2ff] p-2 rounded-lg hover:bg-[#00d2ff]/20"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2 px-3">
                    {hotels.map(hotel => (
                        <div
                            key={hotel._id}
                            onClick={() => selectHotelForRooms(hotel)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedHotelId === hotel._id && activeTab !== 'movies' ? 'bg-[#00d2ff]/10 border-[#00d2ff]/30 shadow-lg shadow-[#00d2ff]/5' : 'border-transparent hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                                    {hotel.images?.[0] && (
                                        <img
                                            src={getOptimizedImageUrl(hotel.images[0], { width: 160 })}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold truncate">{hotel.name}</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{hotel.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cinematic Section */}
                <div className="px-6 mt-12 mb-8 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-brand-red">
                        <Film size={20} /> Cinematic
                    </h2>
                    <button
                        onClick={() => setActiveTab('movies')}
                        className="bg-brand-red/10 text-brand-red p-2 rounded-lg hover:bg-brand-red/20 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2 px-3 pb-10">
                    <div
                        onClick={() => setActiveTab('movies')}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border group ${activeTab === 'movies' ? 'bg-brand-red/10 border-brand-red/30 shadow-lg shadow-brand-red/5' : 'border-transparent hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${activeTab === 'movies' ? 'bg-brand-red text-white' : 'bg-brand-red/20 text-brand-red'}`}>
                                <Film size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Manage Movies</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{movies.length} Active Tiles</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 mt-4 mb-8 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[#8BE9FF]">
                        <PlaneTakeoff size={20} /> Aviation
                    </h2>
                    <button
                        onClick={() => { resetFlightForm(); setActiveTab('flights'); }}
                        className="bg-[#8BE9FF]/10 text-[#8BE9FF] p-2 rounded-lg hover:bg-[#8BE9FF]/20 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2 px-3 pb-10">
                    <div
                        onClick={() => setActiveTab('flights')}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border group ${activeTab === 'flights' ? 'bg-[#8BE9FF]/10 border-[#8BE9FF]/30 shadow-lg shadow-[#8BE9FF]/10' : 'border-transparent hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${activeTab === 'flights' ? 'bg-[#8BE9FF] text-[#071126]' : 'bg-[#8BE9FF]/20 text-[#8BE9FF]'}`}>
                                <PlaneTakeoff size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Manage Flights</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{flights.length} Active Routes</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-3 pb-8">
                    <div
                        onClick={() => setActiveTab('route-matrix')}
                        className={`p-4 rounded-2xl cursor-pointer transition-all border group ${activeTab === 'route-matrix' ? 'bg-[#7df59a]/10 border-[#7df59a]/35 shadow-lg shadow-[#7df59a]/10' : 'border-transparent hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${activeTab === 'route-matrix' ? 'bg-[#7df59a] text-[#05230f]' : 'bg-[#7df59a]/20 text-[#7df59a]'}`}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Route Matrix</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{routeMatrixRows.length} City Pairs</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 mt-2 mb-8">
                    <Link
                        to="/admin/trains"
                        className="block p-4 rounded-2xl border border-[#f8b84e]/25 bg-[#f8b84e]/8 hover:bg-[#f8b84e]/14 transition-colors mb-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#f8b84e]/25 text-[#f8b84e]">
                                <TrainFront size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Manage Trains</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{trains.length} Active Routes</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/admin/buses"
                        className="block p-4 rounded-2xl border border-[#6ad7ff]/25 bg-[#6ad7ff]/8 hover:bg-[#6ad7ff]/14 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#6ad7ff]/25 text-[#6ad7ff]">
                                <BusFront size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Manage Buses</h3>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{buses.length} Active Routes</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden pt-20">
                {/* Internal Navbar */}
                <div className="bg-black/40 border-b border-white/5 px-8 pt-4">
                    <div className="flex items-center gap-8">
                        {[
                            { id: 'hotels', label: 'Overview', icon: Layout },
                            { id: 'edit-hotel', label: 'Property Info', icon: Settings },
                            { id: 'rooms', label: 'Room Inventory', icon: Bed },
                            { id: 'movies', label: 'Movies', icon: Film },
                            { id: 'flights', label: 'Flights', icon: PlaneTakeoff },
                            { id: 'route-matrix', label: 'Route Matrix', icon: MapPin },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.id === 'rooms' && !selectedHotelId) {
                                        alert("Please select a hotel first!");
                                        return;
                                    }
                                    setActiveTab(tab.id);
                                }}
                                className={`flex items-center gap-2 px-4 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? (tab.id === 'movies' ? 'text-brand-red' : tab.id === 'flights' ? 'text-[#8BE9FF]' : tab.id === 'route-matrix' ? 'text-[#7df59a]' : 'text-[#00d2ff]') : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                <tab.icon size={18} /> {tab.label}
                                {activeTab === tab.id && (
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-full shadow-lg ${tab.id === 'movies' ? 'bg-brand-red shadow-brand-red/50' : tab.id === 'flights' ? 'bg-[#8BE9FF] shadow-[#8BE9FF]/50' : tab.id === 'route-matrix' ? 'bg-[#7df59a] shadow-[#7df59a]/50' : 'bg-[#00d2ff] shadow-[#00d2ff]/50'}`} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content View */}
                <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                    {/* Hotels Overview Tab */}
                    {activeTab === 'hotels' && (
                        <div className="max-w-5xl">
                            <h1 className="text-4xl font-bold mb-4 glow-text">Admin Control Panel</h1>
                            <p className="text-gray-400 mb-12">Manage your luxury properties and room inventory from a single dashboard.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="glass p-8 rounded-[32px] border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <div className="bg-blue-500/20 text-blue-400 p-3 rounded-2xl w-fit mb-4">
                                            <Building2 size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Total Hotels</h3>
                                        <p className="text-3xl font-black text-white">{hotels.length}</p>
                                    </div>
                                    <button onClick={() => { resetHotelForm(); setActiveTab('edit-hotel'); }} className="mt-6 text-sm font-bold text-[#00d2ff] flex items-center gap-1 hover:underline">
                                        Add New Property <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="glass p-8 rounded-[32px] border border-white/5">
                                    <div className="bg-red-500/20 text-brand-red p-3 rounded-2xl w-fit mb-4">
                                        <Film size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Movies Released</h3>
                                    <p className="text-3xl font-black text-white">{movies.length}</p>
                                    <p className="text-xs text-gray-500 mt-2 italic">Global box office tracking active</p>
                                </div>
                                <div className="glass p-8 rounded-[32px] border border-[#8BE9FF]/20 bg-[#8BE9FF]/5">
                                    <PlaneTakeoff size={32} className="text-[#8BE9FF] mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Flights Live</h3>
                                    <p className="text-3xl font-black text-white">{flights.length}</p>
                                    <p className="text-xs text-gray-500 mt-2 italic">Cloudinary-backed airline imagery synced to the dashboard hero</p>
                                </div>
                                <div className="glass p-8 rounded-[32px] border border-[#f8b84e]/20 bg-[#f8b84e]/5">
                                    <TrainFront size={32} className="text-[#f8b84e] mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Trains Active</h3>
                                    <p className="text-3xl font-black text-white">{trains.length}</p>
                                    <p className="text-xs text-gray-500 mt-2 italic">Premium rail routes available for dashboard and user train module.</p>
                                </div>
                                <div className="glass p-8 rounded-[32px] border border-[#6ad7ff]/20 bg-[#6ad7ff]/5">
                                    <BusFront size={32} className="text-[#6ad7ff] mb-4" />
                                    <h3 className="text-xl font-bold mb-2">Buses Active</h3>
                                    <p className="text-3xl font-black text-white">{buses.length}</p>
                                    <p className="text-xs text-gray-500 mt-2 italic">Luxury bus routes available for dashboard and user booking.</p>
                                </div>
                            </div>

                            <div className="mt-16 bg-white/5 rounded-[40px] p-1 border border-white/5">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                                            <th className="px-8 py-6">Property</th>
                                            <th className="px-8 py-6">Pricing</th>
                                            <th className="px-8 py-6">Rooms</th>
                                            <th className="px-8 py-6">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {hotels.map(h => (
                                            <tr key={h._id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 overflow-hidden flex-shrink-0">
                                                            {h.images?.[0] && (
                                                                <img
                                                                    src={getOptimizedImageUrl(h.images[0], { width: 200 })}
                                                                    className="w-full h-full object-cover"
                                                                    loading="lazy"
                                                                    decoding="async"
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-200 group-hover:text-white">{h.name}</p>
                                                            <p className="text-xs text-gray-500">{h.location}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold">{formatINR(h.price)} / night</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-bold text-gray-400">{h.starCategory} Star Property</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex gap-4">
                                                        <button onClick={() => startEditHotel(h)} className="text-[#00d2ff] hover:scale-110 transition-transform"><Edit2 size={18} /></button>
                                                        <button onClick={() => selectHotelForRooms(h)} className="text-orange-400 hover:scale-110 transition-transform"><Settings size={18} /></button>
                                                        <button onClick={() => handleDeleteHotel(h._id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Property Info Tab */}
                    {activeTab === 'edit-hotel' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h2 className="text-3xl font-black">{isEditingHotel ? 'Edit Property' : 'Register New Hotel'}</h2>
                                    <p className="text-gray-400 mt-2">Update property metadata and high-resolution gallery.</p>
                                </div>
                                <button onClick={() => { resetHotelForm(); setActiveTab('hotels'); }} className="text-sm text-gray-500 hover:text-white">Cancel</button>
                            </div>

                            <form onSubmit={handleHotelSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 glass p-10 rounded-[48px] border border-white/10">
                                <div className="space-y-6 md:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Hotel Name</label>
                                            <input
                                                name="name" placeholder="Resort & Spa"
                                                value={hotelData.name} onChange={handleHotelChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff] transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Location</label>
                                            <input
                                                name="location" placeholder="City, Country"
                                                value={hotelData.location} onChange={handleHotelChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff] transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Category</label>
                                    <select
                                        name="starCategory"
                                        value={hotelData.starCategory} onChange={handleHotelChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff] text-gray-300"
                                    >
                                        <option value="1">1 Star Economy</option>
                                        <option value="2">2 Star Select</option>
                                        <option value="3">3 Star Signature</option>
                                        <option value="4">4 Star Premium</option>
                                        <option value="5">5 Star Luxury</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Base Price (INR)</label>
                                    <input
                                        name="price" type="number" placeholder="450"
                                        value={hotelData.price} onChange={handleHotelChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Rating (0-5)</label>
                                    <input
                                        name="rating" type="number" min="0" max="5" step="0.1" placeholder="4.6"
                                        value={hotelData.rating} onChange={handleHotelChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Description</label>
                                    <textarea
                                        name="description" placeholder="Describe the luxury experience..."
                                        value={hotelData.description} onChange={handleHotelChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff] h-40"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Popularity Score (0-10)</label>
                                    <input
                                        name="popularityScore" type="number" min="0" max="10" step="0.1"
                                        value={hotelData.popularityScore} onChange={handleHotelChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Recommendation Weight (0-10)</label>
                                    <input
                                        name="recommendationWeight" type="number" min="0" max="10" step="0.1"
                                        value={hotelData.recommendationWeight} onChange={handleHotelChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Distance Score (0-10)</label>
                                    <input
                                        name="distanceScore" type="number" min="0" max="10" step="0.1"
                                        value={hotelData.distanceScore} onChange={handleHotelChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">Travel Time</label>
                                    <input
                                        name="travelTime" placeholder="e.g. 20 min from downtown"
                                        value={hotelData.travelTime} onChange={handleHotelChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">AI Mood Tags</label>
                                    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                                        {AI_MOOD_TAG_OPTIONS.map((option) => (
                                            <label
                                                key={`hotel-tag-${option.value}`}
                                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${hasTag(hotelData.tags, option.value) ? 'border-[#00d2ff]/40 bg-[#00d2ff]/10 text-[#8de9ff]' : 'border-white/10 bg-white/5 text-white/80'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={hasTag(hotelData.tags, option.value)}
                                                    onChange={(event) => handleHotelTagToggle(option.value, event.target.checked)}
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] ml-2">AI Tags (comma separated)</label>
                                    <input
                                        name="tags" placeholder="luxury, family, scenic"
                                        value={hotelData.tags} onChange={handleHotelChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                    />
                                </div>

                                <div className="md:col-span-2 p-8 bg-[#00d2ff]/5 rounded-3xl border border-dashed border-[#00d2ff]/30 text-center">
                                    <ImageIcon size={32} className="mx-auto mb-4 text-[#00d2ff]" />
                                    <p className="font-bold text-sm mb-2">Upload Property Photos</p>
                                    <p className="text-xs text-gray-500 mb-6">Support JPEG, PNG for high-res galleries</p>
                                    <input
                                        type="file" multiple onChange={handleHotelFileChange}
                                        className="hidden" id="hotel-upload"
                                    />
                                    <label
                                        htmlFor="hotel-upload"
                                        className="bg-[#00d2ff] text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-[#00b8e6] transition-all shadow-lg shadow-[#00d2ff]/20"
                                    >
                                        Select Files
                                    </label>
                                    {hotelFiles.length > 0 && <p className="mt-4 text-[#00d2ff] font-bold text-xs">{hotelFiles.length} files staged for upload</p>}
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSavingHotel}
                                        className="w-full bg-[#00d2ff] text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-[#00d2ff]/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isSavingHotel ? 'Saving...' : isEditingHotel ? 'Commit Property Changes' : 'Register Property'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Room Inventory Tab */}
                    {activeTab === 'rooms' && (
                        <div className="max-w-6xl mx-auto pb-20">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h2 className="text-3xl font-black">Room Inventory</h2>
                                    <p className="text-gray-400 mt-1">Manage room categories for <span className="text-white font-bold">{hotels.find(h => h._id === selectedHotelId)?.name}</span></p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={resetRoomForm} className="bg-white/5 px-6 py-2 rounded-xl text-sm font-bold border border-white/10 hover:bg-white/10 transition-colors">Clean Form</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                                {/* Room List (Left) */}
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#00d2ff] flex items-center gap-2 mb-2">
                                        <Bed size={14} /> Active Units ({rooms.length})
                                    </h3>
                                    {rooms.length === 0 && (
                                        <div className="glass p-10 rounded-[32px] text-center border border-dashed border-white/10">
                                            <p className="text-gray-500 text-sm">No rooms registered yet.</p>
                                        </div>
                                    )}
                                    {rooms.map(room => (
                                        <div
                                            key={room._id}
                                            onClick={() => startEditRoom(room)}
                                            className={`glass p-5 rounded-[32px] cursor-pointer transition-all border group ${currentRoomId === room._id ? 'border-[#00d2ff] bg-[#00d2ff]/5' : 'border-white/5 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 flex-shrink-0">
                                                    {room.images?.[0] && (
                                                        <img
                                                            src={getOptimizedImageUrl(room.images[0], { width: 280 })}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold truncate group-hover:text-[#00d2ff]">{room.type}</h4>
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1 uppercase font-black">
                                                        <span>{room.capacity} Guests</span>
                                                        <span>{formatINR(room.price)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Room Form (Right) */}
                                <div className="lg:col-span-3">
                                    <form onSubmit={handleRoomSubmit} className="glass p-10 rounded-[48px] border border-white/10 sticky top-0">
                                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                                            {isEditingRoom ? <Edit2 size={20} className="text-[#00d2ff]" /> : <Plus size={20} className="text-[#00d2ff]" />}
                                            {isEditingRoom ? 'Update Room Category' : 'New Room Category'}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Category Title</label>
                                                <input
                                                    name="type" placeholder="Deluxe Premium Suite"
                                                    value={roomData.type} onChange={handleRoomChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Inventory Price (INR)</label>
                                                <input
                                                    name="price" type="number" placeholder="800"
                                                    value={roomData.price} onChange={handleRoomChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Taxes & Fees (INR)</label>
                                                <input
                                                    name="taxes" type="number" placeholder="45"
                                                    value={roomData.taxes} onChange={handleRoomChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Guest Capacity</label>
                                                <input
                                                    name="capacity" type="number"
                                                    value={roomData.capacity} onChange={handleRoomChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00d2ff]"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2 p-6 bg-[#00d2ff]/5 rounded-3xl border border-dashed border-[#00d2ff]/30 text-center">
                                                <ImageIcon size={26} className="mx-auto mb-3 text-[#00d2ff]" />
                                                <p className="font-bold text-sm mb-2">Upload Room Photos</p>
                                                <p className="text-xs text-gray-500 mb-5">These images are uploaded to Cloudinary and shown in Recommended Rooms.</p>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleRoomFileChange}
                                                    className="hidden"
                                                    id="room-upload"
                                                />
                                                <label
                                                    htmlFor="room-upload"
                                                    className="bg-[#00d2ff] text-white px-7 py-3 rounded-xl font-bold cursor-pointer hover:bg-[#00b8e6] transition-all shadow-lg shadow-[#00d2ff]/20"
                                                >
                                                    Select Room Images
                                                </label>
                                                {roomFiles.length > 0 && (
                                                    <p className="mt-4 text-[#00d2ff] font-bold text-xs">{roomFiles.length} file(s) staged for upload</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-2 pt-6">
                                                <button type="submit" className="w-full bg-[#00d2ff] text-white py-4 rounded-2xl font-black shadow-xl shadow-[#00d2ff]/20 hover:bg-[#00b8e6] active:scale-95 transition-all">
                                                    {isEditingRoom ? <span className="flex items-center justify-center gap-2">Update Inventory <CheckCircle2 size={18} /></span> : 'Initialize Room Category'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Movie Management Tab */}
                    {activeTab === 'movies' && (
                        <div className="max-w-6xl mx-auto pb-20">
                            <div className="mb-12">
                                <h1 className="text-4xl font-black mb-2 glow-text">Cinematic Portfolio</h1>
                                <p className="text-gray-400">Release new blockbusters and manage your digital movie library.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                                {/* Movie Form (Left) */}
                                <div className="lg:col-span-2">
                                    <form onSubmit={handleMovieSubmit} className="glass p-8 rounded-[40px] border border-white/10 sticky top-0 space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                                            {isEditingMovie ? <Edit2 size={20} className="text-brand-red" /> : <Plus size={20} className="text-brand-red" />} {isEditingMovie ? 'Edit Movie' : 'Add New Movie'}
                                        </h3>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Movie Title</label>
                                            <input
                                                name="title" placeholder="Inception"
                                                value={movieForm.title} onChange={handleMovieChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Description</label>
                                                <textarea
                                                    name="description" placeholder="Short description"
                                                    value={movieForm.description} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red h-28 resize-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Genres</label>
                                                <input
                                                    name="genre" placeholder="action, adventure"
                                                    value={movieForm.genre} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Duration</label>
                                                <input
                                                    name="duration" placeholder="2h 30m"
                                                    value={movieForm.duration} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Language</label>
                                                <input
                                                    name="language" placeholder="English"
                                                    value={movieForm.language} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Release Year</label>
                                                <input
                                                    name="releaseYear" type="number" placeholder="2025"
                                                    value={movieForm.releaseYear} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Cast</label>
                                                <input
                                                    name="cast" placeholder="Actor 1, Actor 2"
                                                    value={movieForm.cast} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Rating (0-10)</label>
                                                <input
                                                    name="rating" step="0.1" type="number" placeholder="8.8"
                                                    value={movieForm.rating} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Location</label>
                                                <input
                                                    name="location" placeholder="IMAX Hall 1"
                                                    value={movieForm.location} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Storyline</label>
                                            <textarea
                                                name="storyline" placeholder="A thief who steals corporate secrets through the use of dream-sharing technology..."
                                                value={movieForm.storyline} onChange={handleMovieChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red h-32 resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Popularity (0-10)</label>
                                                <input
                                                    name="popularityScore" type="number" min="0" max="10" step="0.1"
                                                    value={movieForm.popularityScore} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Weight (0-10)</label>
                                                <input
                                                    name="recommendationWeight" type="number" min="0" max="10" step="0.1"
                                                    value={movieForm.recommendationWeight} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Distance Score (0-10)</label>
                                                <input
                                                    name="distanceScore" type="number" min="0" max="10" step="0.1"
                                                    value={movieForm.distanceScore} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Travel Time</label>
                                                <input
                                                    name="travelTime" placeholder="e.g. 15 min"
                                                    value={movieForm.travelTime} onChange={handleMovieChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">AI Mood Tags</label>
                                            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                                                {AI_MOOD_TAG_OPTIONS.map((option) => (
                                                    <label
                                                        key={`movie-tag-${option.value}`}
                                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${hasTag(movieForm.tags, option.value) ? 'border-brand-red/40 bg-brand-red/10 text-brand-red' : 'border-white/10 bg-white/5 text-white/80'}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={hasTag(movieForm.tags, option.value)}
                                                            onChange={(event) => handleMovieTagToggle(option.value, event.target.checked)}
                                                        />
                                                        {option.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">AI Tags (comma separated)</label>
                                            <input
                                                name="tags" placeholder="fun, family, adventure"
                                                value={movieForm.tags} onChange={handleMovieChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-brand-red"
                                            />
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Poster Image</span>
                                                <label className="cursor-pointer bg-brand-red px-4 py-2 rounded-lg text-xs font-black hover:bg-red-600 transition-colors">
                                                    CHOOSE <input type="file" name="poster" className="hidden" onChange={handleMovieFileChange} />
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Background</span>
                                                <label className="cursor-pointer bg-brand-red px-4 py-2 rounded-lg text-xs font-black hover:bg-red-600 transition-colors">
                                                    CHOOSE <input type="file" name="backgroundImage" className="hidden" onChange={handleMovieFileChange} />
                                                </label>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trailer Video</span>
                                                <label className="cursor-pointer bg-brand-red px-4 py-2 rounded-lg text-xs font-black hover:bg-red-600 transition-colors">
                                                    CHOOSE <input type="file" name="trailer" className="hidden" onChange={handleMovieFileChange} />
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSavingMovie}
                                            className="w-full bg-brand-red text-white py-4 rounded-2xl font-black shadow-xl shadow-brand-red/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSavingMovie ? 'Saving...' : isEditingMovie ? 'UPDATE MOVIE' : 'RELEASE MOVIE'}
                                        </button>
                                        {isEditingMovie && (
                                            <button
                                                type="button"
                                                onClick={resetMovieForm}
                                                className="w-full border border-white/20 text-gray-300 py-3 rounded-2xl font-bold hover:bg-white/5 transition-all"
                                            >
                                                CANCEL EDIT
                                            </button>
                                        )}
                                    </form>
                                </div>

                                {/* Movie List (Right) */}
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {movies.map(m => (
                                            <div key={m._id} className="glass group relative overflow-hidden rounded-[32px] border border-white/5 hover:border-brand-red/30 transition-all duration-500">
                                                <div className="aspect-[2/3] relative overflow-hidden">
                                                    <img
                                                        src={getOptimizedImageUrl(m.poster, { width: 560 })}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        alt={m.title}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <button
                                                            onClick={() => startEditMovie(m)}
                                                            className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-[#00d2ff] hover:bg-[#00d2ff] hover:text-white transition-all border border-white/10"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMovie(m._id)}
                                                            className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all border border-white/10"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <h4 className="text-xl font-bold truncate">{m.title}</h4>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="flex items-center gap-1 text-xs text-brand-red font-black">
                                                            <Star size={12} fill="currentColor" /> {m.rating}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
                                                            <MapPin size={12} /> {m.location}
                                                        </div>
                                                    </div>
                                                    {m.storyline && (
                                                        <p className="mt-4 text-xs text-gray-400 line-clamp-2 leading-relaxed italic">
                                                            "{m.storyline}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Flight Management Tab */}
                    {activeTab === 'flights' && (
                        <div className="max-w-6xl mx-auto pb-20">
                            <div className="mb-12">
                                <h1 className="text-4xl font-black mb-2 text-[#8BE9FF] [text-shadow:0_0_14px_rgba(139,233,255,0.35)]">Flight Control Tower</h1>
                                <p className="text-gray-400">Upload premium airline visuals to Cloudinary and manage the flight details used in the travel hero and airline carousel.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                                <div className="lg:col-span-2">
                                    <form onSubmit={handleFlightSubmit} className="glass p-8 rounded-[40px] border border-white/10 sticky top-0 space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                                            {isEditingFlight ? <Edit2 size={20} className="text-[#8BE9FF]" /> : <PlaneTakeoff size={20} className="text-[#8BE9FF]" />} {isEditingFlight ? 'Edit Flight' : 'Add New Flight'}
                                        </h3>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Airline</label>
                                            <input
                                                name="airline" placeholder="Emirates"
                                                value={flightForm.airline} onChange={handleFlightChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Origin</label>
                                                <input
                                                    name="origin" placeholder="Dubai"
                                                    value={flightForm.origin} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Destination</label>
                                                <input
                                                    name="destination" placeholder="Paris"
                                                    value={flightForm.destination} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Price (INR)</label>
                                                <input
                                                    name="price" type="number" min="0" placeholder="32999"
                                                    value={flightForm.price} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Duration</label>
                                                <input
                                                    name="duration" placeholder="07h 45m"
                                                    value={flightForm.duration} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Cabin Classes (comma separated)</label>
                                            <input
                                                name="cabinClasses" placeholder="Economy, Premium, Deluxe"
                                                value={flightForm.cabinClasses} onChange={handleFlightChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Luggage Allowance</label>
                                            <input
                                                name="luggageAllowance" placeholder="25kg check-in + 7kg cabin"
                                                value={flightForm.luggageAllowance} onChange={handleFlightChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Meal Options (comma separated)</label>
                                            <input
                                                name="mealOptions" placeholder="Veg Meal, Non-Veg Meal, Continental"
                                                value={flightForm.mealOptions} onChange={handleFlightChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Departure Time</label>
                                                <input
                                                    name="departureTime" type="datetime-local"
                                                    value={flightForm.departureTime} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Arrival Time</label>
                                                <input
                                                    name="arrivalTime" type="datetime-local"
                                                    value={flightForm.arrivalTime} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Aircraft / Cabin Detail</label>
                                            <input
                                                name="aircraft" placeholder="Boeing 777 · Business Flex"
                                                value={flightForm.aircraft} onChange={handleFlightChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Description</label>
                                            <textarea
                                                name="description" placeholder="Low-layover premium itinerary with lounge access and priority boarding."
                                                value={flightForm.description} onChange={handleFlightChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF] h-28 resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Popularity (0-10)</label>
                                                <input
                                                    name="popularityScore" type="number" min="0" max="10" step="0.1"
                                                    value={flightForm.popularityScore} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Weight (0-10)</label>
                                                <input
                                                    name="recommendationWeight" type="number" min="0" max="10" step="0.1"
                                                    value={flightForm.recommendationWeight} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Distance Score (0-10)</label>
                                                <input
                                                    name="distanceScore" type="number" min="0" max="10" step="0.1"
                                                    value={flightForm.distanceScore} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Travel Time</label>
                                                <input
                                                    name="travelTime" placeholder="e.g. 35 min to airport"
                                                    value={flightForm.travelTime} onChange={handleFlightChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">AI Mood Tags</label>
                                            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                                                {AI_MOOD_TAG_OPTIONS.map((option) => (
                                                    <label
                                                        key={`flight-tag-${option.value}`}
                                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${hasTag(flightForm.tags, option.value) ? 'border-[#8BE9FF]/40 bg-[#8BE9FF]/10 text-[#8BE9FF]' : 'border-white/10 bg-white/5 text-white/80'}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={hasTag(flightForm.tags, option.value)}
                                                            onChange={(event) => handleFlightTagToggle(option.value, event.target.checked)}
                                                        />
                                                        {option.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">AI Tags (comma separated)</label>
                                            <input
                                                name="tags" placeholder="premium, business, fast"
                                                value={flightForm.tags} onChange={handleFlightChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#8BE9FF]"
                                            />
                                        </div>

                                        <label className="flex items-center justify-between gap-4 p-4 bg-[#8BE9FF]/6 rounded-2xl border border-[#8BE9FF]/20 cursor-pointer">
                                            <div>
                                                <p className="text-sm font-bold text-white">Feature this flight in hero</p>
                                                <p className="text-xs text-gray-400 mt-1">Featured flights take over the dashboard headline visual.</p>
                                            </div>
                                            <input
                                                name="isFeatured" type="checkbox"
                                                checked={flightForm.isFeatured} onChange={handleFlightChange}
                                                className="h-5 w-5 rounded border-white/20 bg-white/5 accent-[#8BE9FF]"
                                            />
                                        </label>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Flight Image</span>
                                            <label className="cursor-pointer bg-[#8BE9FF] text-[#071126] px-4 py-2 rounded-lg text-xs font-black hover:bg-[#72dffb] transition-colors">
                                                CHOOSE <input type="file" name="image" className="hidden" accept="image/*" onChange={handleFlightFileChange} />
                                            </label>
                                        </div>
                                        {flightFile && <p className="text-xs text-[#8BE9FF] font-bold -mt-2">{flightFile.name}</p>}

                                        <button
                                            type="submit"
                                            disabled={isSavingFlight}
                                            className="w-full bg-[#8BE9FF] text-[#071126] py-4 rounded-2xl font-black shadow-xl shadow-[#8BE9FF]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSavingFlight ? 'Saving...' : isEditingFlight ? 'UPDATE FLIGHT' : 'ADD FLIGHT'}
                                        </button>
                                        {isEditingFlight && (
                                            <button
                                                type="button"
                                                onClick={resetFlightForm}
                                                className="w-full border border-white/20 text-gray-300 py-3 rounded-2xl font-bold hover:bg-white/5 transition-all"
                                            >
                                                CANCEL EDIT
                                            </button>
                                        )}
                                    </form>
                                </div>

                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {flights.map(flight => (
                                            <div key={flight._id} className="glass group relative overflow-hidden rounded-[32px] border border-white/5 hover:border-[#8BE9FF]/30 transition-all duration-500">
                                                <div className="aspect-[3/2] relative overflow-hidden">
                                                    <img
                                                        src={getOptimizedImageUrl(flight.image, { width: 720 })}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        alt={flight.airline}
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-75" />
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <button
                                                            onClick={() => startEditFlight(flight)}
                                                            className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-[#8BE9FF] hover:bg-[#8BE9FF] hover:text-[#071126] transition-all border border-white/10"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFlight(flight._id)}
                                                            className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all border border-white/10"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    {flight.isFeatured && (
                                                        <div className="absolute left-4 top-4 rounded-full bg-[#8BE9FF] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#071126] shadow-lg shadow-[#8BE9FF]/20">
                                                            Featured
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-6">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h4 className="text-xl font-bold truncate">{flight.airline}</h4>
                                                            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-gray-500">{flight.origin} to {flight.destination}</p>
                                                        </div>
                                                        <span className="rounded-full bg-[#8BE9FF]/10 px-3 py-1 text-xs font-black text-[#8BE9FF]">
                                                            {formatINR(flight.price)}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-400">
                                                        <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-3 border border-white/5">
                                                            <Clock3 size={14} className="text-[#8BE9FF]" />
                                                            <span>{flight.duration || 'Schedule pending'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-3 border border-white/5">
                                                            <PlaneTakeoff size={14} className="text-[#8BE9FF]" />
                                                            <span>{flight.aircraft || 'Aircraft TBA'}</span>
                                                        </div>
                                                        <div className="col-span-2 flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-3 border border-white/5">
                                                            <span className="text-[#8BE9FF] font-black uppercase tracking-[0.12em] text-[10px]">Class</span>
                                                            <span>{flight.cabinClasses?.join(' / ') || 'Economy / Premium / Deluxe'}</span>
                                                        </div>
                                                        <div className="col-span-2 flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-3 border border-white/5">
                                                            <span className="text-[#8BE9FF] font-black uppercase tracking-[0.12em] text-[10px]">Luggage</span>
                                                            <span>{flight.luggageAllowance || '25kg check-in + 7kg cabin'}</span>
                                                        </div>
                                                    </div>

                                                    {flight.description && (
                                                        <p className="mt-4 text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                            {flight.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {flights.length === 0 && (
                                        <div className="glass mt-4 p-10 rounded-[32px] border border-dashed border-white/10 text-center">
                                            <PlaneTakeoff size={28} className="mx-auto text-[#8BE9FF] mb-4" />
                                            <p className="text-white font-bold">No flights added yet.</p>
                                            <p className="text-sm text-gray-500 mt-2">Create your first flight to populate the new dashboard hero and airline showcase.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Route Matrix Management Tab */}
                    {activeTab === 'route-matrix' && (
                        <div className="max-w-6xl mx-auto pb-20">
                            <div className="mb-12">
                                <h1 className="text-4xl font-black mb-2 text-[#7df59a] [text-shadow:0_0_14px_rgba(125,245,154,0.35)]">Route Matrix Control</h1>
                                <p className="text-gray-400">Maintain city-to-city distance and travel-time benchmarks used by the AI planner.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                                <div className="lg:col-span-2">
                                    <form onSubmit={handleRouteMatrixSubmit} className="glass p-8 rounded-[40px] border border-white/10 sticky top-0 space-y-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                                            <MapPin size={20} className="text-[#7df59a]" />
                                            {isEditingRouteMatrix ? 'Edit Route Pair' : 'Add Route Pair'}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">From City</label>
                                                <input
                                                    name="from"
                                                    placeholder="Chennai"
                                                    value={routeMatrixForm.from}
                                                    onChange={handleRouteMatrixChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#7df59a]"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">To City</label>
                                                <input
                                                    name="to"
                                                    placeholder="Delhi"
                                                    value={routeMatrixForm.to}
                                                    onChange={handleRouteMatrixChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#7df59a]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Distance (KM)</label>
                                            <input
                                                name="distanceKm"
                                                type="number"
                                                min="1"
                                                placeholder="2200"
                                                value={routeMatrixForm.distanceKm}
                                                onChange={handleRouteMatrixChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#7df59a]"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Flight Time (minutes)</label>
                                                <input
                                                    name="flightMinutes"
                                                    type="number"
                                                    min="1"
                                                    placeholder="165"
                                                    value={routeMatrixForm.flightMinutes}
                                                    onChange={handleRouteMatrixChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#7df59a]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Train Time (minutes)</label>
                                                <input
                                                    name="trainMinutes"
                                                    type="number"
                                                    min="1"
                                                    placeholder="1600"
                                                    value={routeMatrixForm.trainMinutes}
                                                    onChange={handleRouteMatrixChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#7df59a]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Bus Time (minutes)</label>
                                                <input
                                                    name="busMinutes"
                                                    type="number"
                                                    min="1"
                                                    placeholder="2100"
                                                    value={routeMatrixForm.busMinutes}
                                                    onChange={handleRouteMatrixChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#7df59a]"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSavingRouteMatrix}
                                            className="w-full bg-[#7df59a] text-[#05230f] py-4 rounded-2xl font-black shadow-xl shadow-[#7df59a]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isSavingRouteMatrix ? 'Saving...' : isEditingRouteMatrix ? 'UPDATE ROUTE' : 'ADD ROUTE'}
                                        </button>

                                        {isEditingRouteMatrix && (
                                            <button
                                                type="button"
                                                onClick={resetRouteMatrixForm}
                                                className="w-full border border-white/20 text-gray-300 py-3 rounded-2xl font-bold hover:bg-white/5 transition-all"
                                            >
                                                CANCEL EDIT
                                            </button>
                                        )}
                                    </form>
                                </div>

                                <div className="lg:col-span-3">
                                    <div className="glass rounded-[32px] border border-white/10 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                                                        <th className="px-5 py-4">Route</th>
                                                        <th className="px-5 py-4">Distance</th>
                                                        <th className="px-5 py-4">Flight</th>
                                                        <th className="px-5 py-4">Train</th>
                                                        <th className="px-5 py-4">Bus</th>
                                                        <th className="px-5 py-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {routeMatrixRows.map((row) => (
                                                        <tr key={row._id} className="hover:bg-white/[0.02] transition-colors">
                                                            <td className="px-5 py-4">
                                                                <p className="font-bold text-white">{row.from} to {row.to}</p>
                                                            </td>
                                                            <td className="px-5 py-4 text-sm text-gray-300">{row.distanceKm} km</td>
                                                            <td className="px-5 py-4 text-sm text-gray-300">{row?.travelMinutes?.flight || '-'} min</td>
                                                            <td className="px-5 py-4 text-sm text-gray-300">{row?.travelMinutes?.train || '-'} min</td>
                                                            <td className="px-5 py-4 text-sm text-gray-300">{row?.travelMinutes?.bus || '-'} min</td>
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => startEditRouteMatrix(row)}
                                                                        className="text-[#7df59a] hover:scale-110 transition-transform"
                                                                    >
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteRouteMatrix(row._id)}
                                                                        className="text-red-500 hover:scale-110 transition-transform"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {routeMatrixRows.length === 0 && (
                                        <div className="glass mt-6 p-10 rounded-[32px] border border-dashed border-white/10 text-center">
                                            <MapPin size={28} className="mx-auto text-[#7df59a] mb-4" />
                                            <p className="text-white font-bold">No route matrix entries found.</p>
                                            <p className="text-sm text-gray-500 mt-2">Add city pairs to drive fastest-mode and distance-aware AI recommendations.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
