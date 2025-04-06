"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('items');
  
  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, session, router]);
  
  if (status === 'loading' || status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return <div className="p-8">Loading or authenticating...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Navigation tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`py-2 px-4 ${activeTab === 'items' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          Manage Items
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'items' ? (
        <div>
          <h2 className="text-2xl mb-4">Item Management</h2>
          <div className="mb-4">
            <Link href="/admin/add-item" className="bg-green-500 text-white py-2 px-4 rounded">
              Add New Item
            </Link>
          </div>
          <ItemList />
        </div>
      ) : (
        <div>
          <h2 className="text-2xl mb-4">User Management</h2>
          <div className="mb-4">
            <Link href="/admin/add-user" className="bg-green-500 text-white py-2 px-4 rounded">
              Add New User
            </Link>
          </div>
          <UserList />
        </div>
      )}
    </div>
  );
}

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/items');
        const data = await res.json();
        setItems(data.items);
      } catch (err) {
        setError('Failed to load items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);
  
  const handleRemoveItem = async (itemId) => {
    if (!confirm('Are you sure you want to remove this item? This will also delete all associated ratings and reviews.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete item');
      }
      
      // Remove item from state
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };
  
  if (loading) return <div>Loading items...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-800">
            <th className="py-2 px-4 text-left text-white font-bold">Name</th>
            <th className="py-2 px-4 text-left text-white font-bold">Category</th>
            <th className="py-2 px-4 text-left text-white font-bold">Price</th>
            <th className="py-2 px-4 text-left text-white font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map(item => (
              <tr key={item._id} className="border-b border-gray-700">
                <td className="py-2 px-4 text-white">{item.name}</td>
                <td className="py-2 px-4 text-white">{item.category}</td>
                <td className="py-2 px-4 text-white">${item.price}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-4 text-center text-white">No items found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function UserList() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Fetching users data from API");
        const res = await fetch('/api/admin/users', {
          credentials: 'include' // Important for sending cookies
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.message || 'Failed to load users');
        }
        
        const data = await res.json();
        console.log("Users data received:", data);
        
        if (data && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("Invalid data structure:", data);
          throw new Error('Invalid data structure returned from API');
        }
      } catch (err) {
        console.error("User fetch error:", err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [session]);
  
  const handleRemoveUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to remove user ${username}?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      // Remove user from state
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err.message || 'Failed to delete user');
    }
  };
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-800">
            <th className="py-2 px-4 text-left text-white font-bold">Username</th>
            <th className="py-2 px-4 text-left text-white font-bold">Role</th>
            <th className="py-2 px-4 text-left text-white font-bold">Reviews</th>
            <th className="py-2 px-4 text-left text-white font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user._id} className="border-b border-gray-700">
                <td className="py-2 px-4 text-white">{user.username}</td>
                <td className="py-2 px-4 text-white">{user.role}</td>
                <td className="py-2 px-4 text-white">{user.reviews ? user.reviews.length : 0}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleRemoveUser(user._id, user.username)}
                    className="bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600"
                    disabled={user.role === 'admin' && session?.user?.username === user.username}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-4 text-center text-white">No users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}