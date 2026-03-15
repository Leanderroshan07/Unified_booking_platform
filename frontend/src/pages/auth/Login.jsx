import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Mail, Lock, ArrowRight } from "lucide-react";
import api from "../../services/api";
import LightPillar from "../../components/LightPillar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Trigger hyperspeed warp effect
      setIsWarping(true);
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate("/admin/hotels");
        } else {
          navigate("/dashboard");
        }
      }, 1200); // Wait for the warp animation to peak before redirecting

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
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
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-red/20 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-red/10 rounded-full blur-[120px] z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="bg-brand-red p-4 rounded-2xl shadow-[0_0_20px_rgba(255,42,42,0.4)] mb-4">
            <Film size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tighter text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-2">Sign in to continue your cinematic journey</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-red transition-colors" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-red focus:bg-white/10 transition-all text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-red transition-colors" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-red focus:bg-white/10 transition-all text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red py-4 rounded-xl font-bold text-white shadow-[0_10px_20px_rgba(255,42,42,0.3)] hover:shadow-[0_10px_30px_rgba(255,42,42,0.5)] transition-all flex items-center justify-center gap-2 group transform active:scale-95 disabled:opacity-50"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?
            <Link to="/register" className="text-brand-red font-bold ml-2 hover:underline tracking-tight">Create one now</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
