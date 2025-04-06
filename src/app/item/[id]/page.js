"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function ItemDetail() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [userRating, setUserRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  
  const [userReview, setUserReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok) throw new Error('Failed to fetch item');
        
        const data = await res.json();
        setItem(data.item);
        
        if (session?.user) {
          const existingReview = data.item.reviews.find(
            review => review.userId === session.user.id
          );
          
          if (existingReview) {
            setUserRating(existingReview.rating || 0);
            setUserReview(existingReview.text || '');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchItem();
    }
  }, [id, session]);
  
  const handleRatingSubmit = async (rating) => {
    if (!session?.user) {
      alert('Please sign in to rate this item');
      return;
    }
    
    setSubmittingRating(true);
    
    try {
      const res = await fetch(`/api/items/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });
      
      if (!res.ok) throw new Error('Failed to submit rating');
      
      const data = await res.json();
      
      setItem(prevItem => ({
        ...prevItem,
        avgRating: data.updatedRating,
        reviewerCount: data.reviewerCount
      }));
      
      setUserRating(rating);
    } catch (err) {
      console.error(err);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!session?.user) {
      alert('Please sign in to review this item');
      return;
    }
    
    if (!userReview.trim()) {
      alert('Please enter a review');
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      const res = await fetch(`/api/items/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userReview }),
      });
      
      if (!res.ok) throw new Error('Failed to submit review');
      
      const data = await res.json();
      
      setItem(prevItem => {
        const filteredReviews = prevItem.reviews.filter(
          review => review.userId !== session.user.id
        );
        
        const newReviews = [
          ...filteredReviews,
          {
            userId: session.user.id,
            username: session.user.username,
            text: userReview,
            date: new Date().toISOString()
          }
        ];
        
        return {
          ...prevItem,
          reviews: newReviews
        };
      });
      
      alert('Review submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  if (loading) return <div className="p-8 text-center">Loading item details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!item) return <div className="p-8 text-center">Item not found</div>;
  
  return (
    <div className="container mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Item Image */}
        <div className="relative h-64 md:h-96">
          <Image 
            src={item.image} 
            alt={item.name}
            fill
            style={{ objectFit: 'contain' }}
            className="rounded"
          />
        </div>
        
        {/* Item Details */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{item.name}</h1>
          <p className="text-lg font-semibold mb-4">${item.price}</p>
          <p className="text-gray-700 mb-4">Seller: {item.seller}</p>
          
          {/* Category-specific attributes */}
          {item.batteryLife && (
            <p className="text-gray-700 mb-2">Battery Life: {item.batteryLife}</p>
          )}
          {item.age !== undefined && (
            <p className="text-gray-700 mb-2">Age: {item.age} years</p>
          )}
          {item.size && (
            <p className="text-gray-700 mb-2">Size: {item.size}</p>
          )}
          {item.material && (
            <p className="text-gray-700 mb-2">Material: {item.material}</p>
          )}
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{item.description}</p>
          </div>
          
          {/* Ratings Section */}
          <div className="mt-6 border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Ratings</h2>
            <p className="mb-2">
              Average Rating: {item.avgRating ? item.avgRating.toFixed(1) : 'No ratings yet'} 
              {item.reviewerCount > 0 && ` (${item.reviewerCount} ratings)`}
            </p>
            
            {/* Rating Input - Only for logged in users */}
            {status === 'authenticated' ? (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Rate this item:</h3>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingSubmit(rating)}
                      disabled={submittingRating}
                      className={`w-8 h-8 rounded-full flex items-center justify-center 
                        ${userRating === rating ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm italic mt-2">
                <Link href="/signin" className="text-blue-500 hover:underline">
                  Sign in
                </Link> to rate this item
              </p>
            )}
          </div>
          
          {/* Reviews Section */}
          <div className="mt-6 border-t pt-4">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            
            {/* Review Input Form - Only for logged in users */}
            {status === 'authenticated' ? (
              <form onSubmit={handleReviewSubmit} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="review" className="block font-medium mb-2">
                    Write a review:
                  </label>
                  <textarea
                    id="review"
                    rows="4"
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Share your thoughts about this item..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview || !userReview.trim()}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <p className="text-sm italic mb-4">
                <Link href="/signin" className="text-blue-500 hover:underline">
                  Sign in
                </Link> to leave a review
              </p>
            )}
            
            {/* Display Reviews */}
            <div className="space-y-4">
              {item.reviews && item.reviews.length > 0 ? (
                item.reviews.map((review, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{review.username}</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{review.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}