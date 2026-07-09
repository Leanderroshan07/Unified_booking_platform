const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const BASE_UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const MIME_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-matroska": ".mkv",
};

const buildLocalUrl = (relativePath) => `/${relativePath.replace(/\\/g, "/")}`;

const uploadToCloudinary = async (file, options = {}) => {
  if (!file || !file.buffer) {
    throw new Error("No file buffer found for upload.");
  }

  const folderPath = path.join(BASE_UPLOAD_DIR, options.folder || "");
  await fs.mkdir(folderPath, { recursive: true });

  const originalName = path.basename(file.originalname || "upload");
  const parsedName = path.parse(originalName);
  const extension = parsedName.ext || MIME_EXTENSIONS[file.mimetype] || "";
  const safeBaseName = parsedName.name.replace(/[^a-zA-Z0-9-_]/g, "_") || "file";
  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const fileName = `${safeBaseName}-${uniqueSuffix}${extension}`;
  const absolutePath = path.join(folderPath, fileName);

  await fs.writeFile(absolutePath, file.buffer);

  const relativePath = path.relative(path.join(__dirname, ".."), absolutePath);

  return {
    secure_url: buildLocalUrl(relativePath),
    url: buildLocalUrl(relativePath),
    public_id: fileName,
    path: absolutePath,
    resource_type: options.resourceType || "auto",
  };
};

module.exports = uploadToCloudinary;