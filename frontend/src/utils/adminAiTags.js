export const AI_MOOD_TAG_OPTIONS = [
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "tired", label: "Tired" },
  { value: "stressed", label: "Stressed" },
  { value: "relaxed", label: "Relaxed" },
  { value: "romantic", label: "Romantic" },
  { value: "adventurous", label: "Adventurous" },
];

export const normalizeTagList = (value) => {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value.split(",")
    : [];

  return Array.from(
    new Set(
      source
        .map((item) => String(item).trim())
        .filter(Boolean)
    )
  );
};

export const hasTag = (value, tag) =>
  normalizeTagList(value).some((item) => item.toLowerCase() === String(tag).toLowerCase());

export const toggleTag = (value, tag, shouldInclude) => {
  const normalizedTag = String(tag).trim();
  const remaining = normalizeTagList(value).filter(
    (item) => item.toLowerCase() !== normalizedTag.toLowerCase()
  );

  if (shouldInclude) {
    remaining.push(normalizedTag);
  }

  return remaining.join(", ");
};