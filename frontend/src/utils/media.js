const DEFAULT_API_ORIGIN = import.meta.env.PROD
  ? "https://unified-booking-platform.onrender.com"
  : "http://localhost:5000";

const configuredBase = import.meta.env.VITE_API_BASE_URL || "";
const configuredOrigin = import.meta.env.VITE_API_ORIGIN || "";

const stripTrailingSlash = (value) => value.replace(/\/+$/, "");

const deriveApiOrigin = () => {
  if (configuredOrigin) {
    return stripTrailingSlash(configuredOrigin);
  }

  if (configuredBase) {
    return stripTrailingSlash(configuredBase.replace(/\/api\/?$/, ""));
  }

  return DEFAULT_API_ORIGIN;
};

const API_ORIGIN = deriveApiOrigin();

export const isAbsoluteUrl = (value) => /^https?:\/\//i.test(String(value || ""));

const normalizeRelativePath = (value) =>
  String(value || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

export const toMediaUrl = (value) => {
  if (!value) return "";
  if (isAbsoluteUrl(value)) return value;
  return `${API_ORIGIN}/${normalizeRelativePath(value)}`;
};

const injectCloudinaryTransform = (url, transform) => {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", `/upload/${transform}/`);
};

export const getOptimizedImageUrl = (value, options = {}) => {
  const source = toMediaUrl(value);
  if (!source) return "";

  const transformParts = ["f_auto", "q_auto"];
  if (options.width) {
    transformParts.push(`w_${options.width}`, "c_limit");
  }

  return injectCloudinaryTransform(source, transformParts.join(","));
};

const YOUTUBE_WATCH_REGEX = /(?:youtube\.com\/watch\?v=)([\w-]{11})/i;
const YOUTUBE_SHORT_REGEX = /(?:youtu\.be\/)([\w-]{11})/i;
const YOUTUBE_EMBED_REGEX = /(?:youtube\.com\/embed\/)([\w-]{11})/i;

const extractYouTubeId = (url) => {
  const match =
    url.match(YOUTUBE_WATCH_REGEX) ||
    url.match(YOUTUBE_SHORT_REGEX) ||
    url.match(YOUTUBE_EMBED_REGEX);
  return match ? match[1] : "";
};

export const getTrailerSource = (value) => {
  const source = toMediaUrl(value);
  if (!source) {
    return { type: "none", url: "" };
  }

  if (/youtu\.be|youtube\.com/i.test(source)) {
    const videoId = extractYouTubeId(source);
    if (videoId) {
      return {
        type: "youtube",
        url: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      };
    }
  }

  return { type: "video", url: source };
};
