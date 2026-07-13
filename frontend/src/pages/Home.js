import React, { useContext, useState, useEffect, useRef } from 'react';
import { userdataContext } from '../Contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from '../assests/ai.gif';

// Curated pool of distinct, broadly-available browser TTS voices
const VOICE_POOL = [
  { match: (v) => v.name.includes('Google UK English Male'), lang: 'en-GB' },
  { match: (v) => v.name.includes('Google US English'), lang: 'en-US' },
  { match: (v) => v.name.includes('Daniel'), lang: 'en-GB' },
  { match: (v) => v.name.includes('Samantha'), lang: 'en-US' },
  { match: (v) => v.name.includes('Google UK English Female'), lang: 'en-GB' },
  { match: (v) => v.name.includes('Victoria'), lang: 'en-US' },
  { match: (v) => v.name.includes('Google Australian'), lang: 'en-AU' },
  { match: (v) => v.name.includes('Karen'), lang: 'en-AU' },
  { match: (v) => v.name.includes('Google Indian'), lang: 'en-IN' },
  { match: (v) => v.name.includes('Rishi'), lang: 'en-IN' },
  { match: (v) => v.name.includes('Moira'), lang: 'en-IE' },
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickVoiceForAssistant(assistantName, voices) {
  if (!voices?.length) return null;
  const name = (assistantName || '').toLowerCase().trim();
  if (name.includes('jarvis') || name.includes('friday')) {
    return (
      voices.find((v) => v.name.includes('Google UK English Male')) ||
      voices.find((v) => v.name.includes('Daniel')) ||
      voices.find((v) => v.lang === 'en-GB')
    );
  }
  if (name.includes('sara') || name.includes('aria')) {
    return (
      voices.find((v) => v.name.includes('Google US English')) ||
      voices.find((v) => v.name.includes('Samantha')) ||
      voices.find((v) => v.lang === 'en-US')
    );
  }
  const availableSlots = VOICE_POOL
    .map((slot) => voices.find(slot.match) || voices.find((v) => v.lang === slot.lang))
    .filter(Boolean);
  if (availableSlots.length) {
    const idx = hashString(name || 'assistant') % availableSlots.length;
    return availableSlots[idx];
  }
  return voices.find((v) => v.lang?.startsWith('en')) || voices[0];
}

function Home() {
  const { userData, serverUrl, setUserdata, getGeminiResponse, backendStatus } = useContext(userdataContext);
  const navigate = useNavigate();

  const [listening, setListening]       = useState(false);
  const [aiSpeaking, setAiSpeaking]     = useState(false);
  const [messages, setMessages]         = useState([]);
  const [liveUserText, setLiveUserText] = useState('');
  const [textInput, setTextInput]       = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  const recognitionRef   = useRef(null);
  const isSpeakingRef    = useRef(false);
  const isRecognizingRef = useRef(false);
  const allVoices        = useRef([]);
  const chatEndRef       = useRef(null);
  const synth            = window.speechSynthesis;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, liveUserText]);

  const handleLogout = async () => {
    try { await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true }); } catch (_) {}
    setUserdata(null);
    navigate('/signin');
  };

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try { recognitionRef.current?.start(); setListening(true); }
      catch (e) { if (!e.message?.includes('start')) console.error(e); }
    }
  };

  const speak = (text) => {
    const utt = new SpeechSynthesisUtterance(text.replace(/\n/g, '. '));
    isSpeakingRef.current = true; setAiSpeaking(true);
    utt.onend = () => { isSpeakingRef.current = false; setAiSpeaking(false); setTimeout(startRecognition, 800); };
    
    const savedVoiceName = localStorage.getItem('selectedVoiceName');
    let selectedVoice = null;
    if (savedVoiceName) {
      selectedVoice = allVoices.current.find((v) => v.name === savedVoiceName);
    }
    if (!selectedVoice) {
      selectedVoice = pickVoiceForAssistant(userData?.assistantName, allVoices.current);
    }
    
    if (selectedVoice) utt.voice = selectedVoice;
    synth.cancel(); synth.speak(utt);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);
    if (type === 'google-search')                             window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank');
    if (type === 'youtube-search' || type === 'youtube-play') window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank');
    if (type === 'calculator-open') window.open('https://www.google.com/search?q=calculator', '_blank');
    if (type === 'instagram-open')  window.open('https://www.instagram.com/', '_blank');
    if (type === 'facebook-open')   window.open('https://www.facebook.com/', '_blank');
    if (type === 'weather-show')    window.open(`https://www.google.com/search?q=weather+${encodeURIComponent(userInput)}`, '_blank');
  };

  // ── Shared command processor used by both voice AND text input ──
  const processCommand = async (transcript) => {
    if (!transcript?.trim() || isProcessing) return;
    setIsProcessing(true);
    setLiveUserText('');
    setMessages(prev => [...prev, { role: 'user', text: transcript }]);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      isRecognizingRef.current = false;
      setListening(false);
    }
    try {
      const data = await getGeminiResponse(transcript, userData?.assistantName, userData?.name);
      const safeData = data && data.response
        ? data
        : { type: 'general', userInput: transcript, response: 'Sorry, something went wrong. Please try again.' };
      setMessages(prev => [...prev, { role: 'ai', text: safeData.response }]);
      handleCommand(safeData);
    } catch (err) {
      console.error(err);
      const fallback = 'Sorry, something went wrong on my end. Please try again.';
      setMessages(prev => [...prev, { role: 'ai', text: fallback }]);
      speak(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Text input submit ──
  const handleTextSubmit = (e) => {
    e.preventDefault();
    const cmd = textInput.trim();
    if (!cmd) return;
    setTextInput('');
    processCommand(cmd);
  };

  useEffect(() => {
    const load = () => { 
      const list = synth.getVoices();
      allVoices.current = list; 
      
      const preferredKeywords = [
        'siri', 'samantha', 'daniel', 'google us english', 
        'google uk english male', 'google uk english female',
        'guy', 'aria', 'jenny', 'david', 'zira'
      ];
      
      let engVoices = list.filter(v => {
        const langOK = v.lang.startsWith('en') || v.lang.startsWith('EN');
        if (!langOK) return false;
        const voiceName = v.name.toLowerCase();
        return preferredKeywords.some(kw => voiceName.includes(kw));
      });

      if (engVoices.length === 0) {
        engVoices = list.filter(v => v.lang.startsWith('en') || v.lang.startsWith('EN'));
      }

      setAvailableVoices(engVoices);
      
      const saved = localStorage.getItem('selectedVoiceName');
      if (saved) {
        setSelectedVoiceName(saved);
      } else {
        const defaultVoice = pickVoiceForAssistant(userData?.assistantName, list);
        if (defaultVoice) {
          setSelectedVoiceName(defaultVoice.name);
          localStorage.setItem('selectedVoiceName', defaultVoice.name);
        }
      }
    };
    if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = load;
    load();
    let attempts = 0;
    const pollId = setInterval(() => {
      load();
      attempts += 1;
      if (allVoices.current.length > 0 || attempts > 10) clearInterval(pollId);
    }, 300);
    return () => clearInterval(pollId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return; // graceful fallback — text input still works
    const rec = new SR();
    rec.continuous = true; rec.lang = 'en-US'; rec.interimResults = true;
    recognitionRef.current = rec;
    let mounted = true, interval;

    setTimeout(() => {
      const utt = new SpeechSynthesisUtterance(
        `Hello ${userData?.name || 'there'}, I am ${userData?.assistantName || 'your assistant'}. How can I help you?`
      );
      isSpeakingRef.current = true; setAiSpeaking(true);
      utt.onend = () => { isSpeakingRef.current = false; setAiSpeaking(false); setTimeout(startRecognition, 600); };
      const selectedVoice = pickVoiceForAssistant(userData?.assistantName, allVoices.current);
      if (selectedVoice) utt.voice = selectedVoice;
      synth.cancel(); synth.speak(utt);
    }, 600);

    rec.onstart  = () => { isRecognizingRef.current = true;  setListening(true);  };
    rec.onend    = () => { isRecognizingRef.current = false; setListening(false); if (!isSpeakingRef.current && mounted) setTimeout(startRecognition, 1000); };
    rec.onerror  = () => { isRecognizingRef.current = false; setListening(false); if (!isSpeakingRef.current && mounted) setTimeout(startRecognition, 1000); };

    rec.onresult = async (e) => {
      if (isProcessing) return;
      const results = Array.from(e.results);
      const interim = results.filter(r => !r.isFinal).map(r => r[0].transcript).join('');
      if (interim) setLiveUserText(interim);

      const last = results[results.length - 1];
      if (!last.isFinal) return;
      const transcript = results.filter(r => r.isFinal).map(r => r[0].transcript).join('').trim();

      // Always process the command when the user finishes speaking
      processCommand(transcript);
    };

    interval = setInterval(() => { if (!isRecognizingRef.current && !isSpeakingRef.current && mounted) startRecognition(); }, 10000);
    return () => { mounted = false; clearInterval(interval); try { rec.stop(); } catch (_) {} };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = listening || aiSpeaking;
  const accentColor = aiSpeaking ? '#c084fc' : '#818cf8';

  return (
    <div style={styles.root}>

      {/* ── Stars ── */}
      {stars.map((s, i) => (
        <div key={i} style={{ ...styles.star, top: s.top, left: s.left, width: s.size, height: s.size, animationDuration: s.dur + 's', animationDelay: s.delay + 's' }} />
      ))}

      {/* ── Glow blobs ── */}
      <div style={{ ...styles.blob, top: -80, left: -80, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)' }} />
      <div style={{ ...styles.blob, bottom: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 65%)' }} />

      {/* ════════════════ LEFT PANEL ════════════════ */}
      <div style={styles.leftPanel}>

        {/* ── Sleek Nav bar ── */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, padding: '4px 8px' }}>
          
          {/* Back Button */}
          <button 
            onClick={() => navigate('/customize')} 
            style={{ ...styles.iconBtn, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)' }}
            title="Back to Avatar Selection"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>

          {/* Online Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 20, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 8px #818cf8', animation: 'glowPulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'Orbitron, sans-serif', color: '#818cf8', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' }}>Online</span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            style={{ ...styles.iconBtn, background: 'rgba(248, 113, 113, 0.05)', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.1)' }}
            title="Logout"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        {/* ── Avatar ── */}
        <div style={styles.avatarWrap}>
          {active && (
            <>
              <div style={{ ...styles.pulseRing, borderColor: accentColor + '55', animation: 'pulseRing 1.6s ease-out infinite' }} />
              <div style={{ ...styles.pulseRing, borderColor: accentColor + '33', scale: '1.3', animation: 'pulseRing 1.6s ease-out 0.5s infinite' }} />
            </>
          )}
          <div style={{
            ...styles.avatarCard,
            borderColor: active ? accentColor : 'rgba(255,255,255,0.1)',
            boxShadow: active ? `0 0 32px ${accentColor}60` : '0 0 16px rgba(99,102,241,0.15)',
            animation: 'floatAvatar 4s ease-in-out infinite',
          }}>
            <img
              src={aiSpeaking ? aiImg : (userData?.assistantImage || aiImg)}
              alt="assistant"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* scan line */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.15 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`, animation: 'scanLine 3s linear infinite' }} />
            </div>
          </div>
        </div>

        {/* ── Name ── */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={styles.assistantName}>{userData?.assistantName || 'ARIA'}</h1>
          <p style={styles.assistantSub}>AI ASSISTANT</p>
          {availableVoices.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <select
                value={selectedVoiceName}
                onChange={(e) => {
                  setSelectedVoiceName(e.target.value);
                  localStorage.setItem('selectedVoiceName', e.target.value);
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  fontSize: '9px',
                  fontFamily: 'Orbitron, sans-serif',
                  letterSpacing: '1px',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '180px',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                }}
              >
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name} style={{ background: '#07070d', color: 'rgba(255,255,255,0.8)' }}>
                    {voice.name.replace('Microsoft', '').replace('Google', '').replace('Natural', '').replace('Desktop', '').trim()} ({voice.lang.split('-')[0].toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Status ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* Sound bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 24 }}>
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} style={{
                width: 3, borderRadius: 99,
                background: active ? accentColor : 'rgba(255,255,255,0.2)',
                height: active ? undefined : 3,
                animation: active ? `soundWave ${0.5 + i * 0.09}s ease-in-out ${i * 0.06}s infinite alternate` : 'none',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99,
            border: `1px solid ${active ? accentColor + '55' : 'rgba(255,255,255,0.1)'}`,
            background: active ? accentColor + '18' : 'rgba(255,255,255,0.04)',
            transition: 'all 0.3s',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? accentColor : 'rgba(255,255,255,0.2)', animation: active ? 'glowPulse 2s ease-in-out infinite' : 'none' }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: active ? accentColor : 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
              {isProcessing ? 'Thinking…' : aiSpeaking ? 'Speaking…' : listening ? `Listening for "${userData?.assistantName || ''}"` : 'Standby'}
            </span>
          </div>
          {/* Hint */}
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', lineHeight: 1.5 }}>
            Say <span style={{ color: '#818cf8' }}>"{userData?.assistantName || 'the name'}"</span> or type below
          </p>
        </div>

        {/* ── User pill ── */}
        <div style={styles.userPill}>
          <div style={styles.userAvatar}>{userData?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{userData?.name || 'User'}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.2), transparent)', flexShrink: 0 }} />

      {/* ════════════════ RIGHT PANEL ════════════════ */}
      <div style={styles.rightPanel}>

        {/* Header */}
        <div style={styles.chatHeader}>
          <div>
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>Conversation</h2>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 2 }}>{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={styles.clearBtn}>Clear</button>
          )}
        </div>

        {/* Messages */}
        <div style={styles.chatBody}>
          {messages.length === 0 && !liveUserText && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <svg width="18" height="18" fill="none" stroke="#818cf8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No conversation yet</p>
              <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>Say the assistant name or type a message below</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeSlideIn 0.3s ease-out' }}>
              <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 500, marginBottom: 4, color: msg.role === 'user' ? 'rgba(129,140,248,0.6)' : 'rgba(192,132,252,0.6)' }}>
                {msg.role === 'user' ? (userData?.name || 'You') : (userData?.assistantName || 'AI')}
              </span>
              <div style={{
                maxWidth: '88%', padding: '10px 14px', fontSize: 13, lineHeight: 1.6,
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'linear-gradient(135deg,rgba(79,70,229,0.85),rgba(67,56,202,0.6))' : 'linear-gradient(135deg,rgba(88,28,135,0.4),rgba(59,7,100,0.3))',
                border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(168,85,247,0.2)'}`,
                color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'rgba(233,213,255,0.9)',
                boxShadow: msg.role === 'user' ? '0 4px 16px rgba(79,70,229,0.2)' : '0 4px 16px rgba(88,28,135,0.15)',
              }}>
                {msg.role === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c084fc', animation: 'glowPulse 2s ease-in-out infinite' }} />
                    <span style={{ fontSize: 9, color: 'rgba(192,132,252,0.6)', letterSpacing: 2, textTransform: 'uppercase' }}>AI Response</span>
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {liveUserText && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', opacity: 0.6, animation: 'fadeSlideIn 0.3s ease-out' }}>
              <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(129,140,248,0.5)', marginBottom: 4 }}>{userData?.name || 'You'}…</span>
              <div style={{ maxWidth: '88%', padding: '10px 14px', fontSize: 13, lineHeight: 1.6, borderRadius: '18px 18px 4px 18px', background: 'rgba(79,70,229,0.2)', border: '1px dashed rgba(99,102,241,0.3)', color: 'rgba(255,255,255,0.6)' }}>
                {liveUserText}
                <span style={{ display: 'inline-block', width: 2, height: 12, background: '#818cf8', marginLeft: 3, verticalAlign: 'middle', animation: 'glowPulse 1s ease-in-out infinite' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Text Input Bar ── */}
        <form onSubmit={handleTextSubmit} style={styles.inputBar}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Type a command or ask ${userData?.assistantName || 'your assistant'}…`}
            disabled={isProcessing}
            style={{
              ...styles.textInput,
              opacity: isProcessing ? 0.5 : 1,
              cursor: isProcessing ? 'not-allowed' : 'text',
            }}
          />
          <button
            type="submit"
            disabled={isProcessing || !textInput.trim()}
            style={{
              ...styles.sendBtn,
              opacity: (isProcessing || !textInput.trim()) ? 0.4 : 1,
              cursor: (isProcessing || !textInput.trim()) ? 'not-allowed' : 'pointer',
            }}
          >
            {isProcessing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.chatFooter}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: listening ? '#818cf8' : 'rgba(255,255,255,0.15)', animation: listening ? `typingDot 1.4s ease-in-out ${i * 0.2}s infinite` : 'none' }} />
            ))}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
            {isProcessing ? 'Processing…' : aiSpeaking ? `${userData?.assistantName || 'AI'} is speaking` : listening ? 'Microphone active' : 'Waiting for wake word'}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: backendStatus === 'connected' ? '#4ade80' : backendStatus === 'waking' ? '#facc15' : backendStatus === 'offline' ? '#f87171' : 'rgba(255,255,255,0.25)',
              animation: 'glowPulse 2s ease-in-out infinite',
            }} />
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
              {backendStatus === 'connected' ? 'Connected' : backendStatus === 'waking' ? 'Waking server…' : backendStatus === 'offline' ? 'Server unreachable' : 'Connecting…'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pre-compute stars ─── */
const stars = Array.from({ length: 30 }, () => ({
  top:   Math.random() * 100 + '%',
  left:  Math.random() * 100 + '%',
  size:  (Math.random() * 1.5 + 0.5) + 'px',
  dur:   2 + Math.random() * 4,
  delay: Math.random() * 5,
}));

/* ─── Static styles ─── */
const styles = {
  root: {
    width: '100vw', height: '100vh', background: '#020209',
    display: 'flex', overflow: 'hidden', position: 'relative',
    fontFamily: 'Inter, sans-serif',
  },
  star: {
    position: 'absolute', borderRadius: '50%', background: 'white',
    pointerEvents: 'none', opacity: 0.3, animation: 'twinkle ease-in-out infinite',
  },
  blob: { position: 'absolute', width: 350, height: 350, borderRadius: '50%', pointerEvents: 'none' },

  /* Left panel */
  leftPanel: {
    width: '40%', height: '100%', flexShrink: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: '12px 20px',
    minWidth: 0,
  },
  nav: {
    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexShrink: 0,
  },
  navLabel: { fontFamily: 'Orbitron, sans-serif', color: '#818cf8', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' },
  navBtn:   { fontSize: 10, color: 'rgba(255,255,255,0.4)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer' },
  iconBtn: {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer', transition: 'all 0.2s ease', backdropFilter: 'blur(4px)',
  },

  /* Avatar */
  avatarWrap: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute', borderRadius: '50%', border: '1px solid',
    inset: '-18%', pointerEvents: 'none',
  },
  avatarCard: {
    position: 'relative',
    width: 140, height: 190, borderRadius: 20, overflow: 'hidden',
    border: '2px solid', transition: 'all 0.4s ease',
  },

  /* Name */
  assistantName: {
    fontFamily: 'Orbitron, sans-serif', fontSize: 22, fontWeight: 700, margin: 0,
    background: 'linear-gradient(135deg,#a78bfa,#6366f1,#38bdf8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  assistantSub: { color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginTop: 3 },

  /* User pill */
  userPill: { display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' },
  userAvatar: { width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 },

  /* Right panel */
  rightPanel: { flex: 1, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  chatHeader: { padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  clearBtn:   { fontSize: 10, color: 'rgba(255,255,255,0.25)', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: 'pointer' },
  chatBody:   { flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 },

  /* Text input bar */
  inputBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 18px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: 12,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    padding: '10px 14px',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: 38, height: 38,
    borderRadius: 10,
    border: '1px solid rgba(99,102,241,0.4)',
    background: 'linear-gradient(135deg,rgba(79,70,229,0.6),rgba(88,28,135,0.5))',
    color: 'white',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.2s',
  },

  chatFooter: { padding: '9px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },

  /* Empty state */
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center' },
  emptyIcon:  { width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

export default Home;
