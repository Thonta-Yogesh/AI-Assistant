import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userdataContext } from '../Contexts/UserContext';
import axios from 'axios';
import { MdKeyboardBackspace } from 'react-icons/md';

function Customize2() {
  const { userData, backendImage, selectedImage, serverUrl, setUserdata } = useContext(userdataContext);
  const navigate = useNavigate();
  const [assistantName, setAssistantName] = useState(userData?.assistantName || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const formData = new FormData();
      formData.append('assistantName', assistantName);
      if (backendImage) formData.append('assistantImage', backendImage);
      else formData.append('imageurl', selectedImage);

      const result = await axios.post(`${serverUrl}/api/user/update`, formData, {
        withCredentials: true,
        headers,
      });
      setUserdata(result.data);
      setLoading(false);
      navigate('/');
    } catch (error) {
      console.warn('Backend update failed. Applying locally.');
      const localImage = backendImage ? URL.createObjectURL(backendImage) : selectedImage;
      setUserdata(prev => ({ ...prev, assistantName, assistantImage: localImage }));
      setLoading(false);
      navigate('/');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#020209] flex justify-center items-center flex-col p-6 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />

      {/* Back button */}
      <button
        onClick={() => navigate('/customize')}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/40 hover:text-indigo-400 transition-colors text-sm"
      >
        <MdKeyboardBackspace className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Selected avatar preview */}
      {selectedImage && selectedImage !== 'input' && (
        <div className="w-24 h-36 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-[0_0_24px_rgba(99,102,241,0.4)] mb-6">
          <img src={selectedImage} alt="selected avatar" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-orbitron text-3xl font-bold text-transparent bg-clip-text mb-2"
          style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #6366f1, #38bdf8)' }}>
          Name Your Assistant
        </h1>
        <p className="text-white/30 text-sm tracking-wide">
          This is the wake word — say it to activate your AI
        </p>
      </div>

      {/* Name input */}
      <div className="relative w-full max-w-md">
        <input
          type="text"
          placeholder="e.g. Jarvis, Aria, Nova..."
          value={assistantName}
          onChange={e => setAssistantName(e.target.value)}
          className="w-full h-14 px-6 rounded-2xl text-white text-base placeholder-white/20
            bg-white/5 border border-white/10 outline-none transition-all duration-300
            focus:border-indigo-500/60 focus:bg-white/8 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
        {assistantName && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        )}
      </div>

      {assistantName && (
        <p className="mt-3 text-indigo-400/60 text-xs">
          Your AI will respond when you say "<span className="text-indigo-400 font-semibold">{assistantName}</span>"
        </p>
      )}

      {/* Create button */}
      {assistantName && (
        <button
          onClick={handleUpdateAssistant}
          disabled={loading}
          className="mt-8 px-12 py-3.5 rounded-full font-semibold text-sm tracking-wide transition-all duration-300
            text-white bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-500 hover:to-purple-500
            shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]
            active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ animation: 'fadeSlideIn 0.4s ease-out' }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Creating...
            </span>
          ) : 'Launch Assistant →'}
        </button>
      )}
    </div>
  );
}

export default Customize2;
