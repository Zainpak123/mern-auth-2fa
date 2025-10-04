import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Admin({ token }) {
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/users/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => setMsg(res.data.message))
      .catch(err => {
        setError('Access Denied or Unauthorized');
      });
  }, [token]);

  if (error) return <h1>{error}</h1>;
  return(<>
  <div className="min-h-screen flex items-center justify-center bg-green-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Welcome Admin!</h1>
        <p className="text-gray-700">{msg}</p>
      </div>
    </div></>)
}
export default Admin;
