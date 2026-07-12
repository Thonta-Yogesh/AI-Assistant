import React, { useContext, useState } from 'react'
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userdataContext } from '../Contexts/UserContext';
import axios from "axios"

function SignUp() {
  const [showPassword, setshowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { serverUrl, setUserdata } = useContext(userdataContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signup`, { name, email, password }, { withCredentials: true });
      setUserdata(result.data);
      setLoading(false);
      navigate("/customize");
    } catch (error) {
      console.log(error);
      setUserdata(null);
      setLoading(false);
      setError(error.response?.data?.message || "A network error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#020209] flex justify-center items-center p-6 relative overflow-hidden">
      
      {/* Background glow & stars */}
      <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />

      <form
        className="relative z-10 w-full max-w-[440px] bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[32px] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col gap-6"
        onSubmit={handleSignUp}
        style={{ animation: 'fadeSlideIn 0.4s ease-out forwards' }}
      >
        <div className="text-center mb-4">
          <h1 className="font-orbitron text-2xl font-bold text-transparent bg-clip-text mb-2"
            style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #6366f1, #38bdf8)' }}>
            Join the Future
          </h1>
          <p className="text-white/40 text-sm tracking-wide">Register your AI Assistant account</p>
        </div>

        <div className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full h-14 px-6 rounded-2xl text-white text-sm placeholder-white/30
              bg-white/5 border border-white/10 outline-none transition-all duration-300
              focus:border-indigo-500/60 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full h-14 px-6 rounded-2xl text-white text-sm placeholder-white/30
              bg-white/5 border border-white/10 outline-none transition-all duration-300
              focus:border-indigo-500/60 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />

          <div className="relative w-full h-14">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create Password"
              className="w-full h-full px-6 pr-14 rounded-2xl text-white text-sm placeholder-white/30
                bg-white/5 border border-white/10 outline-none transition-all duration-300
                focus:border-indigo-500/60 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button type="button" onClick={() => setshowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
              {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <button
          className="w-full h-14 mt-2 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300
            text-white bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-500 hover:to-purple-500
            shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]
            active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Creating Account...
            </>
          ) : 'Sign Up'}
        </button>

        <p className="text-white/40 text-xs text-center mt-2">
          Already have an account?{' '}
          <span 
            className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium transition-colors"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignUp;