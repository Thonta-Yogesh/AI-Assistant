import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Customize from './pages/Customize';
import Customize2 from './pages/Customize2';
import Home from './pages/Home';
import { userdataContext } from './Contexts/UserContext';

function App() {
  const { userData, loadingUser } = useContext(userdataContext);

  if (loadingUser) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020209', color: 'white', fontFamily: 'Inter, sans-serif' }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          userData?.assistantImage && userData?.assistantName ? (
            <Home />
          ) : userData ? (
            <Navigate to="/customize" />
          ) : (
            <Navigate to="/signin" />
          )
        }
      />
      <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
      <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
      <Route path="/customize" element={userData ? <Customize /> : <Navigate to="/signup" />} />
      <Route path="/customize2" element={userData ? <Customize2 /> : <Navigate to="/signup" />} />
    </Routes>
  );
}

export default App;
