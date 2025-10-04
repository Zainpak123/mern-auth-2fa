import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Home({token}) {
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    console.log("Token received in Home:", token);
    axios.get('http://localhost:5000/users/home', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        setUserEmail(res.data.message);
      })
      .catch(err => {
        setError("Unauthorized. Please log in again.");
      });
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <a href="/login" className="text-blue-600 underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Welcome to the User Page!</h1>
        <p className="text-gray-700">{userEmail}</p>
      </div>
    </div>
  );
}

export default Home;
