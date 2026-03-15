const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      reject(new Error("No file buffer found for upload."));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType || "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

module.exports = uploadToCloudinary;