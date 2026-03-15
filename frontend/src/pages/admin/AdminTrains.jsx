import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit2, Plus, TrainFront, Trash2 } from "lucide-react";
import { AI_MOOD_TAG_OPTIONS, hasTag, toggleTag } from "../../utils/adminAiTags";
import {
  createTrain,
  deleteTrain,
  getTrains,
  updateTrain,
} from "../../services/trainService";
import { formatINR } from "../../utils/currency";

const toDateTimeInputValue = (value) => {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const localTime = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 16);
};

const initialFormState = {
  operator: "",
  origin: "",
  destination: "",
  price: "",
  departureTime: "",
  arrivalTime: "",
  duration: "",
  trainType: "Premium Sleeper",
  seatsAvailable: "48",
  amenities: "2-Tier Berths, Charging Ports, Wi-Fi, Onboard Meals",
  description: "",
  popularityScore: "5",
  recommendationWeight: "5",
  distanceScore: "5",
  travelTime: "",
  tags: "transport, train",
  isFeatured: false,
};

const AdminTrains = () => {
  const [trains, setTrains] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTrainId, setCurrentTrainId] = useState(null);
  const [currentTrain, setCurrentTrain] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  const fetchTrains = async () => {
    try {
      const data = await getTrains();
      setTrains(Array.isArray(data) ? data : []);
      setApiMessage("");
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        setApiMessage(
          "Train API route is not available on the running backend. Restart backend from the backend folder and try again."
        );
      } else {
        setApiMessage("Unable to load trains right now. Please check backend service and retry.");
      }
      setTrains([]);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setImageFile(null);
    setCurrentTrainId(null);
    setCurrentTrain(null);
    setIsEditing(false);
  };

  const handleTagToggle = (tag, checked) => {
    setForm((prev) => ({
      ...prev,
      tags: toggleTag(prev.tags, tag, checked),
    }));
  };

  const startEdit = (train) => {
    setForm({
      operator: train.operator || "",
      origin: train.origin || "",
      destination: train.destination || "",
      price: train.price || "",
      departureTime: toDateTimeInputValue(train.departureTime),
      arrivalTime: toDateTimeInputValue(train.arrivalTime),
      duration: train.duration || "",
      trainType: train.trainType || "Premium Sleeper",
      seatsAvailable: train.seatsAvailable ?? 48,
      amenities: train.amenities?.join(", ") || "",
      description: train.description || "",
      popularityScore: train.popularityScore ?? 5,
      recommendationWeight: train.recommendationWeight ?? 5,
      distanceScore: train.distanceScore ?? 5,
      travelTime: train.travelTime || "",
      tags: train.tags?.join(", ") || "",
      isFeatured: Boolean(train.isFeatured),
    });
    setImageFile(null);
    setCurrentTrainId(train._id);
    setCurrentTrain(train);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (isEditing && currentTrainId) {
        await updateTrain(currentTrainId, payload);
      } else {
        await createTrain(payload);
      }

      resetForm();
      fetchTrains();
      alert(isEditing ? "Train route updated." : "Train route added.");
    } catch (error) {
      console.error("Failed to save train", error);
      alert("Failed to save train route.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this train route?")) {
      return;
    }

    try {
      await deleteTrain(id);
      if (currentTrainId === id) {
        resetForm();
      }
      fetchTrains();
    } catch (error) {
      console.error("Failed to delete train", error);
      alert("Failed to delete train route.");
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8b84e] font-black">Admin Rail Studio</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2">Manage Train Routes</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/hotels"
              className="px-5 py-3 rounded-xl border border-white/20 text-sm font-bold text-white/90 hover:text-white hover:border-white/40"
            >
              Back To Admin Panel
            </Link>
            <Link
              to="/trains"
              className="px-5 py-3 rounded-xl bg-[#f8b84e] text-[#1a1110] text-sm font-black"
            >
              Preview User Train Page
            </Link>
          </div>
        </div>

        {apiMessage && (
          <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {apiMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 space-y-4 sticky top-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                {isEditing ? <Edit2 size={18} className="text-[#f8b84e]" /> : <Plus size={18} className="text-[#f8b84e]" />}
                {isEditing ? "Edit Train" : "Add New Train"}
              </h2>

              {isEditing && currentTrain?.image && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-bold text-[#f8b84e] mb-3">Current Train Image</p>
                  <img
                    src={currentTrain.image}
                    alt={currentTrain.operator}
                    className="w-full h-40 rounded-2xl object-cover border border-white/10"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="operator"
                  value={form.operator}
                  onChange={handleChange}
                  placeholder="Operator"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                  required
                />
                <input
                  name="trainType"
                  value={form.trainType}
                  onChange={handleChange}
                  placeholder="Train Type"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                  required
                />
                <input
                  name="origin"
                  value={form.origin}
                  onChange={handleChange}
                  placeholder="Origin"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                  required
                />
                <input
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="Destination"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                  required
                />
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                  required
                />
                <input
                  name="seatsAvailable"
                  type="number"
                  min="0"
                  value={form.seatsAvailable}
                  onChange={handleChange}
                  placeholder="Seats Available"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="departureTime"
                  type="datetime-local"
                  value={form.departureTime}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                  required
                />
                <input
                  name="arrivalTime"
                  type="datetime-local"
                  value={form.arrivalTime}
                  onChange={handleChange}
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                  required
                />
              </div>

              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Duration (e.g. 06h 30m)"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
              />

              <input
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="Amenities comma separated"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e] min-h-24"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  name="popularityScore"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={form.popularityScore}
                  onChange={handleChange}
                  placeholder="Popularity Score (0-10)"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                />
                <input
                  name="recommendationWeight"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={form.recommendationWeight}
                  onChange={handleChange}
                  placeholder="Recommendation Weight (0-10)"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                />
                <input
                  name="distanceScore"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={form.distanceScore}
                  onChange={handleChange}
                  placeholder="Distance Score (0-10)"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                />
                <input
                  name="travelTime"
                  value={form.travelTime}
                  onChange={handleChange}
                  placeholder="Travel Time (e.g. 2h 30m)"
                  className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <p className="text-sm font-bold text-[#f8b84e]">AI Mood Tags</p>
                <div className="flex flex-wrap gap-2">
                  {AI_MOOD_TAG_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${hasTag(form.tags, option.value) ? 'border-[#f8b84e]/40 bg-[#f8b84e]/10 text-[#ffe3b5]' : 'border-white/10 bg-white/5 text-white/80'}`}
                    >
                      <input
                        type="checkbox"
                        checked={hasTag(form.tags, option.value)}
                        onChange={(event) => handleTagToggle(option.value, event.target.checked)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="Additional AI Tags comma separated"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#f8b84e]"
              />

              <label className="flex items-center justify-between p-3 rounded-xl border border-[#f8b84e]/30 bg-[#f8b84e]/10">
                <span className="text-sm">Feature on user hero</span>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
              </label>

              <label className="block rounded-xl border border-dashed border-white/20 p-4 text-sm text-slate-300 cursor-pointer hover:border-[#f8b84e]/40 transition-colors">
                Upload Train Image {isEditing ? '(leave blank to keep current)' : ''}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                />
                {imageFile && <p className="text-xs text-[#f8b84e] mt-2">{imageFile.name}</p>}
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-[#f8b84e] text-[#1a1110] font-black hover:bg-[#ffd487] transition-colors disabled:opacity-60"
              >
                {isSaving ? "Saving..." : isEditing ? "Update Train" : "Add Train"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full py-3 rounded-xl border border-white/20 text-white/80 font-bold hover:text-white hover:border-white/40"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {trains.map((train) => (
                <div
                  key={train._id}
                  className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:border-[#f8b84e]/30 transition-colors"
                >
                  <div className="aspect-[16/9] relative">
                    <img
                      src={train.image || "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80"}
                      alt={train.operator}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    {train.isFeatured && (
                      <div className="absolute top-4 right-4 bg-[#f8b84e] text-[#1a1110] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                        Featured
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#f8b84e] uppercase tracking-[0.2em] font-black">{train.trainType}</p>
                        <h3 className="text-xl font-black mt-1">{train.operator}</h3>
                      </div>
                      <span className="text-[#f8b84e] font-black">{formatINR(train.price || 0)}</span>
                    </div>

                    <p className="text-sm text-slate-300 mt-3">{train.origin} to {train.destination}</p>
                    <p className="text-xs text-slate-400 mt-1">{train.duration || "Duration TBA"}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {(train.amenities || []).slice(0, 3).map((item) => (
                        <span
                          key={`${train._id}-${item}`}
                          className="text-[11px] px-2 py-1 rounded-full bg-white/10 border border-white/10"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(train)}
                        className="flex-1 py-2 rounded-xl bg-[#f8b84e]/15 border border-[#f8b84e]/40 text-[#ffe3b5] font-bold text-sm hover:bg-[#f8b84e]/25"
                      >
                        <span className="inline-flex items-center gap-2"><Edit2 size={14} /> Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(train._id)}
                        className="flex-1 py-2 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 font-bold text-sm hover:bg-red-500/25"
                      >
                        <span className="inline-flex items-center gap-2"><Trash2 size={14} /> Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {trains.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/20 p-10 mt-4 text-center bg-white/5">
                <TrainFront size={28} className="mx-auto text-[#f8b84e]" />
                <p className="mt-4 font-bold">No trains created yet.</p>
                <p className="text-sm text-slate-400 mt-1">Add your first train route using the form.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTrains;