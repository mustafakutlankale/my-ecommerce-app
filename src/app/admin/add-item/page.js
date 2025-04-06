"use client";
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AddItem() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/signin');
    }
  });
  
  // Check if user is admin
  if (session?.user?.role !== 'admin') {
    router.push('/');
    return null;
  }
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    seller: '',
    image: '',
    category: '',
    // Optional fields
    batteryLife: '',
    age: '',
    size: '',
    material: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
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
      // Convert price to number
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        // Initialize rating fields
        ratingSum: 0,
        reviewerCount: 0,
        avgRating: 0,
        reviews: []
      };
      
      // Remove empty optional fields
      Object.keys(itemData).forEach(key => {
        if (itemData[key] === '') {
          delete itemData[key];
        }
      });
      
      const response = await fetch('/api/admin/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add item');
      }
      
      // Redirect to admin dashboard on success
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Add New Item</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Required fields */}
        <div>
          <label className="block mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Seller *</label>
          <input
            type="text"
            name="seller"
            value={formData.seller}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Image URL *</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Category</option>
            <option value="Vinyls">Vinyls</option>
            <option value="Antique Furniture">Antique Furniture</option>
            <option value="GPS Sport Watches">GPS Sport Watches</option>
            <option value="Running Shoes">Running Shoes</option>
          </select>
        </div>
        
        {/* Conditional fields based on category */}
        {formData.category === 'GPS Sport Watches' && (
          <div>
            <label className="block mb-1">Battery Life</label>
            <input
              type="text"
              name="batteryLife"
              value={formData.batteryLife}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        
        {(formData.category === 'Antique Furniture' || formData.category === 'Vinyls') && (
          <div>
            <label className="block mb-1">Age (years)</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
        )}
        
        {formData.category === 'Running Shoes' && (
          <div>
            <label className="block mb-1">Size</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        
        {(formData.category === 'Antique Furniture' || formData.category === 'Running Shoes') && (
          <div>
            <label className="block mb-1">Material</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        
        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Item'}
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