"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AddUser() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user', // Default to regular user
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Debug the session
  useEffect(() => {
    console.log("Add User Page - Session:", session);
    console.log("Add User Page - Auth Status:", status);
  }, [session, status]);
  
  // Simplified authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log("Not authenticated, redirecting to signin");
      router.push('/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      console.log("Not admin, redirecting to home");
      router.push('/');
    }
  }, [status, session, router]);
  
  // Don't render content until we know the user is an admin
  if (status === 'loading' || status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return <div className="container mx-auto p-4">Checking authorization...</div>;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log("Submitting form data:", formData);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.message || 'Failed to add user');
      }
      
      const successData = await response.json();
      console.log("Success:", successData);
      
      // Redirect to admin dashboard on success
      router.push('/admin');
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Add New User</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="user">Regular User</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="ml-4 py-2 px-4 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}