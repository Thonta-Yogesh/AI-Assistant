import React, { createContext, useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export const userdataContext = createContext();

function UserContext({ children }) {
  const serverUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5005'
      : process.env.REACT_APP_BACKEND_URL || 'https://ai-assistant-backend-lgjh.onrender.com';

  const [userData, setUserdata]         = useState(null);
  const [loadingUser, setLoadingUser]   = useState(true);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage]   = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [backendStatus, setBackendStatus] = useState('connecting');

  // ── Fetch the currently authenticated user on mount ──
  const handleCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
        headers,
      });
      setUserdata(result.data);
    } catch (error) {
      console.log('Not logged in:', error.message);
      setUserdata(null);
    } finally {
      setLoadingUser(false);
    }
  }, [serverUrl]);

  // ── Sync JWT token to localStorage and axios defaults ──
  useEffect(() => {
    const localToken = localStorage.getItem('token');
    const tokenToUse = userData?.token || localToken;

    if (userData && tokenToUse) {
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenToUse}`;
    } else if (userData === null && !loadingUser) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [userData, loadingUser]);

  // ── Send a command to Gemini via the backend ──
  const getGeminiResponse = useCallback(
    async (command, assistantName, userName, lang = 'en-IN', chatHistory = []) => {
      try {
        const result = await axios.post(
          `${serverUrl}/api/user/asktoassistant`,
          {
            command,
            assistantName: assistantName || 'Assistant',
            userName: userName || 'User',
            lang,
            chatHistory: chatHistory.slice(-10), // limit history to last 10 turns
          },
          { withCredentials: true }
        );
        return result.data;
      } catch (error) {
        console.error('Gemini request failed:', error);
        return {
          type: 'general',
          userInput: command,
          response: 'Sorry, I could not connect to the server. Please try again.',
        };
      }
    },
    [serverUrl]
  );

  useEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  // ── Poll backend health every 15 seconds ──
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await axios.get(`${serverUrl}/`);
        setBackendStatus('connected');
      } catch {
        setBackendStatus('offline');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  const value = {
    serverUrl,
    userData,
    setUserdata,
    loadingUser,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
    backendStatus,
  };

  return (
    <userdataContext.Provider value={value}>
      {children}
    </userdataContext.Provider>
  );
}

export default UserContext;
