const Room = require("../models/Room");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

exports.getRoomsByHotel = async (req, res) => {
    try {
        const rooms = await Room.find({ hotel: req.params.hotelId });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: "Room not found" });
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const roomData = { ...req.body };
        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(
                req.files.map((file) =>
                    uploadToCloudinary(file, {
                        folder: "unified-booking/rooms/images",
                        resourceType: "image",
                    })
                )
            );
            roomData.images = uploadedImages.map((image) => image.secure_url);
        }
        const room = new Room(roomData);
        const newRoom = await room.save();
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateRoom = async (req, res) => {
    try {
        const roomData = { ...req.body };
        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(
                req.files.map((file) =>
                    uploadToCloudinary(file, {
                        folder: "unified-booking/rooms/images",
                        resourceType: "image",
                    })
                )
            );
            roomData.images = uploadedImages.map((image) => image.secure_url);
        }
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, roomData, { new: true });
        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
