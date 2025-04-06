import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import clientPromise from '@/utils/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const itemId = params.id;
    
    if (!itemId || !ObjectId.isValid(itemId)) {
      return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });
    }
    
    const data = await request.json();
    const rating = parseInt(data.rating);
    
    if (isNaN(rating) || rating < 1 || rating > 10) {
      return NextResponse.json(
        { message: 'Rating must be a number between 1 and 10' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("ecommerce");
    
    const item = await db.collection("items").findOne({ _id: new ObjectId(itemId) });
    
    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    
    const existingRatingIndex = item.reviews?.findIndex(review => review.userId === userId);
    const hasExistingRating = existingRatingIndex >= 0;
    
    let oldRating = 0;
    if (hasExistingRating && item.reviews[existingRatingIndex].rating) {
      oldRating = item.reviews[existingRatingIndex].rating;
    }
    
    let ratingSum = (item.ratingSum || 0) - oldRating + rating;
    let reviewerCount = item.reviewerCount || 0;
    
    if (!hasExistingRating) {
      reviewerCount++;
    }
    
    const avgRating = ratingSum / reviewerCount;
    
    if (hasExistingRating) {
      await db.collection("items").updateOne(
        { _id: new ObjectId(itemId), "reviews.userId": userId },
        { 
          $set: { 
            "reviews.$.rating": rating,
            "reviews.$.date": new Date(),
            ratingSum: ratingSum,
            reviewerCount: reviewerCount,
            avgRating: avgRating
          } 
        }
      );
    } else {
      await db.collection("items").updateOne(
        { _id: new ObjectId(itemId) },
        { 
          $push: { 
            reviews: { 
              userId: userId, 
              username: session.user.username,
              rating: rating,
              date: new Date()
            } 
          },
          $set: {
            ratingSum: ratingSum,
            reviewerCount: reviewerCount,
            avgRating: avgRating
          }
        }
      );
    }
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: { 
          sumRatingsGiven: hasExistingRating ? rating - oldRating : rating,
          totalRatingsGiven: hasExistingRating ? 0 : 1
        }
      }
    );
    
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (user.totalRatingsGiven > 0) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            averageRating: user.sumRatingsGiven / user.totalRatingsGiven
          }
        }
      );
    }
    
    return NextResponse.json({
      message: 'Rating submitted successfully',
      updatedRating: avgRating,
      reviewerCount: reviewerCount
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { message: 'Failed to submit rating', error: error.message },
      { status: 500 }
    );
  }
}