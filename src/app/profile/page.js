"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect if not logged in
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
    
    // Fetch user data if authenticated
    if (status === 'authenticated') {
      const fetchUserData = async () => {
        try {
          const res = await fetch('/api/user/profile');
          if (!res.ok) throw new Error('Failed to fetch user data');
          
          const data = await res.json();
          setUserData(data.user);
        } catch (err) {
          console.error(err);
          setError('Failed to load user profile');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [status, router]);
  
  if (status === 'loading' || loading) {
    return <div className="container mx-auto p-4 text-center text-white">Loading profile...</div>;
  }
  
  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }
  
  if (!userData) {
    return <div className="container mx-auto p-4 text-center text-white">User data not found</div>;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-white">Your Profile</h1>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">User Information</h2>
        <p className="mb-2 text-white"><span className="font-medium">Username:</span> {userData.username}</p>
        <p className="text-white"><span className="font-medium">Average Rating Given:</span> {userData.averageRating ? userData.averageRating.toFixed(1) : 'No ratings given'}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Your Reviews</h2>
        
        {userData.reviews && userData.reviews.length > 0 ? (
          <div className="space-y-4">
            {userData.reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-700 pb-4">
                <div className="flex justify-between mb-1">
                  <Link href={`/item/${review.itemId}`} className="font-medium text-blue-400 hover:underline">
                    {review.itemName}
                  </Link>
                  <span className="text-gray-400 text-sm">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white">{review.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">You haven&apos;t written any reviews yet</p>
        )}
      </div>
    </div>
  );
}