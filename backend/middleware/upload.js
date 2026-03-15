const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	const isImage = file.mimetype && file.mimetype.startsWith("image/");
	const isVideo = file.mimetype && file.mimetype.startsWith("video/");

	if (isImage || isVideo) {
		cb(null, true);
		return;
	}

	cb(new Error("Only image and video files are allowed."));
};

const upload = multer({
	storage,
	fileFilter,
	limits: {
		// Allow larger files for trailers.
		fileSize: 100 * 1024 * 1024,
	},
});

module.exports = { upload };
