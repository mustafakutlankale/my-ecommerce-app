"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react'; 

export default function Home() {
  const { data: session } = useSession(); 
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('');
  
  // Categories required by assignment
  const categories = ['Vinyls', 'Antique Furniture', 'GPS Sport Watches', 'Running Shoes'];
  
  useEffect(() => {
    // Fetch items based on selected category
    const fetchItems = async () => {
      const url = category ? `/api/items?category=${encodeURIComponent(category)}` : '/api/items';
      const response = await fetch(url);
      const data = await response.json();
      setItems(data.items);
    };
    
    fetchItems();
  }, [category]);
  
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our E-Commerce Store</h1>
      
      {/* Category filter */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Filter by Category:</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded ${category === '' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded ${category === cat ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Authentication links - modified to show different options based on session */}
      <div className="mb-6 text-right">
        {session ? (
          <div className="flex space-x-4 justify-end">
            {/* Profile link for logged-in users */}
            <Link href="/profile" className="text-blue-500 hover:underline">
              My Profile
            </Link>
            {/* Admin dashboard link for admin users */}
            {session.user.role === 'admin' && (
              <Link href="/admin" className="text-green-500 hover:underline">
                Admin Dashboard
              </Link>
            )}
            {/* Sign out button */}
            <button 
              onClick={() => signOut()} 
              className="text-red-500 hover:underline"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/signin" className="text-blue-500 hover:underline">
            Sign in / Register
          </Link>
        )}
      </div>
      
      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item._id} className="border rounded p-4">
            <div className="h-40 relative mb-2">
              <Image 
                src={item.image} 
                alt={item.name}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-gray-600 truncate">{item.description}</p>
            <p className="font-bold">${item.price}</p>
            <div className="flex justify-between mt-2">
              <span>Rating: {item.avgRating ? `${item.avgRating.toFixed(1)} (${item.reviewerCount})` : 'No ratings'}</span>
              <Link href={`/item/${item._id}`} className="text-blue-500 hover:underline">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}