import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import api from "../../services/api";
import LightPillar from "../../components/LightPillar";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    contactNumber: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", form);

      // Trigger hyperspeed warp effect
      setIsWarping(true);
      setTimeout(() => {
        navigate("/");
      }, 1200); // Wait for the warp animation to peak before redirecting

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  // LightPillar doesn't need the complex options object like Hyperspeed did
  // We'll pass props directly.

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-dark-bg">
      {/* Dynamic LightPillar Background */}
      <div className="absolute inset-0 z-0">
        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={isWarping ? 5 : 1}
          rotationSpeed={isWarping ? 2.0 : 0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={isWarping ? 1.5 : 0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      {/* Dark Overlay for text legibility */}
      <div className={`absolute inset-0 backdrop-blur-[2px] z-0 transition-opacity duration-1000 ${isWarping ? 'bg-dark-bg/10' : 'bg-dark-bg/40'}`} />

      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-red/20 rounded-full blur-[120px] z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-red p-4 rounded-2xl shadow-[0_0_20px_rgba(255,42,42,0.4)] mb-4">
            <Film size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tighter text-white">Join MultiFlex</h2>
          <p className="text-gray-400 text-sm mt-2">Create your account to start booking</p>
        </div>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                name="username"
                placeholder="johndoe"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-brand-red transition-all text-white text-sm"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2 col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Contact</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                name="contactNumber"
                placeholder="+1 234..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-brand-red transition-all text-white text-sm"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-brand-red transition-all text-white text-sm"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-brand-red transition-all text-white text-sm"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Account Type</label>
            <div className="flex gap-4">
              {["user", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs transition-all border ${form.role === r
                      ? "bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20"
                      : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="col-span-2 bg-brand-red py-4 rounded-xl font-bold text-white shadow-[0_10px_20px_rgba(255,42,42,0.3)] hover:shadow-[0_10px_30px_rgba(255,42,42,0.5)] transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-500">
            Already have an account?
            <Link to="/" className="text-brand-red font-bold ml-2 hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
