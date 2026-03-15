const Hotel = require("../models/Hotel");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const parseListField = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeHotelPayload = (payload = {}) => ({
    ...payload,
    price: payload.price === undefined ? undefined : Number(payload.price),
    starCategory: payload.starCategory === undefined ? undefined : Number(payload.starCategory),
    rating: payload.rating === undefined ? undefined : Number(payload.rating),
    popularityScore: payload.popularityScore === undefined ? undefined : Number(payload.popularityScore),
    recommendationWeight: payload.recommendationWeight === undefined ? undefined : Number(payload.recommendationWeight),
    distanceScore: payload.distanceScore === undefined ? undefined : Number(payload.distanceScore),
    tags: payload.tags === undefined ? undefined : parseListField(payload.tags),
    travelTime: payload.travelTime === undefined ? undefined : String(payload.travelTime).trim(),
});

// Get all hotels
exports.getHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single hotel
exports.getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create hotel (Admin)
exports.createHotel = async (req, res) => {
    try {
        const hotelData = normalizeHotelPayload(req.body);

        Object.keys(hotelData).forEach((key) => {
            if (hotelData[key] === undefined || Number.isNaN(hotelData[key])) {
                delete hotelData[key];
            }
        });

        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(
                req.files.map((file) =>
                    uploadToCloudinary(file, {
                        folder: "unified-booking/hotels/images",
                        resourceType: "image",
                    })
                )
            );
            hotelData.images = uploadedImages.map((image) => image.secure_url);
        }
        const hotel = new Hotel(hotelData);
        const newHotel = await hotel.save();
        res.status(201).json(newHotel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update hotel (Admin)
exports.updateHotel = async (req, res) => {
    try {
        const hotelData = normalizeHotelPayload(req.body);

        Object.keys(hotelData).forEach((key) => {
            if (hotelData[key] === undefined || Number.isNaN(hotelData[key])) {
                delete hotelData[key];
            }
        });

        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(
                req.files.map((file) =>
                    uploadToCloudinary(file, {
                        folder: "unified-booking/hotels/images",
                        resourceType: "image",
                    })
                )
            );
            hotelData.images = uploadedImages.map((image) => image.secure_url);
        }
        const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, hotelData, { new: true });
        res.status(200).json(updatedHotel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete hotel (Admin)
exports.deleteHotel = async (req, res) => {
    try {
        await Hotel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add review
exports.addReview = async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });

        const review = {
            user: req.user.id,
            rating: Number(rating),
            comment,
        };

        hotel.reviews.push(review);
        hotel.rating = hotel.reviews.reduce((acc, item) => item.rating + acc, 0) / hotel.reviews.length;

        await hotel.save();
        res.status(201).json({ message: "Review added" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
