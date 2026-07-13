import React, { createContext, useCallback, useEffect, useState } from 'react';
import axios from 'axios';


export const userdataContext = createContext();

function UserContext({ children }) {
  const serverUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5005' 
    : process.env.REACT_APP_BACKEND_URL || 'https://ai-assistant-backend-lgjh.onrender.com';

  const [userData, setUserdata] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

     const[frontendImage,setFrontendImage]=useState(null)
     const[backendImage,setbackendImage]=useState(null)
     const[SelectedImage,SetselectedImage]=useState(null)

  const handleCurrentUser = useCallback(async () => {
    try {
      const results = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserdata(results.data);
    } catch (error) {
      console.log('Not logged in:', error.message);
      setUserdata(null);
    } finally {
      setLoadingUser(false);
    }
  }, [serverUrl]);

  const getGeminiResponse = useCallback(async (command, assistantName, userName) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        {
          command,
          assistantName: assistantName || 'Assistant',
          userName: userName || 'User',
        },
        { withCredentials: true }
      );
      return result.data;
    } catch (error) {
      console.error('Gemini request failed:', error);
      return { type: 'general', userInput: command, response: 'Sorry, I could not connect to the server. Please try again.' };
    }
  }, [serverUrl]);

  useEffect(() => {
    handleCurrentUser();
  }, [handleCurrentUser]);

  // Context value shared across app
  const value = {
    serverUrl,
    userData,
    setUserdata,
    loadingUser,
    backendImage,setbackendImage,
    frontendImage,setFrontendImage,
    SelectedImage,SetselectedImage,
    getGeminiResponse

  };

  return (
    <userdataContext.Provider value={value}>
      {loadingUser ? (
        <div className="w-full h-screen flex justify-center items-center text-white text-xl">
          Loading...
        </div>
      ) : (
        children
      )}
    </userdataContext.Provider>
  );
}

export default UserContext;
