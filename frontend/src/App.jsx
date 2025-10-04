import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Admin from './components/Admin';
import SuperAdmin from './components/SuperAdmin';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword'; 
import ResetPassword from './components/ResetPassword';    

function App() {
  const [loggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path='/superadmin' element={<SuperAdmin token={token} />} />
        <Route path='/admin' element={<Admin token={token} />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/verify-email' element={<VerifyEmail setIsLoggedIn={setIsLoggedIn} setToken={setToken} />} />
        <Route path='/login' element={<Login setIsLoggedIn={setIsLoggedIn} setToken={setToken} />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />  {/* ✅ Add Forgot Password Route */}
        <Route path='/reset-password' element={<ResetPassword />} />     {/* ✅ Add Reset Password Route */}
        <Route path='/' element={loggedIn ? <Home token={token} /> : <Login setIsLoggedIn={setIsLoggedIn} setToken={setToken} />} />
      </Routes>
    </Router>
  );
}

export default App;
