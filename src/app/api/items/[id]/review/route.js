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
    const reviewText = data.text?.trim();
    
    if (!reviewText) {
      return NextResponse.json(
        { message: 'Review text is required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db("ecommerce");
    
    const item = await db.collection("items").findOne({ _id: new ObjectId(itemId) });
    
    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    
    const existingReviewIndex = item.reviews?.findIndex(review => review.userId === userId);
    const hasExistingReview = existingReviewIndex >= 0;
    
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    const reviewObject = {
      userId: userId,
      username: session.user.username,
      text: reviewText,
      rating: hasExistingReview && item.reviews[existingReviewIndex].rating 
             ? item.reviews[existingReviewIndex].rating 
             : undefined,
      date: new Date()
    };
    
    if (hasExistingReview) {
      await db.collection("items").updateOne(
        { _id: new ObjectId(itemId), "reviews.userId": userId },
        { $set: { "reviews.$": reviewObject } }
      );
    } else {
      await db.collection("items").updateOne(
        { _id: new ObjectId(itemId) },
        { $push: { reviews: reviewObject } }
      );
    }
    
    const userReview = {
      itemId: itemId,
      itemName: item.name,
      text: reviewText,
      date: new Date()
    };
    
    if (user.reviews?.some(rev => rev.itemId === itemId)) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId), "reviews.itemId": itemId },
        { $set: { "reviews.$": userReview } }
      );
    } else {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $push: { reviews: userReview } }
      );
    }
    
    return NextResponse.json({
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { message: 'Failed to submit review', error: error.message },
      { status: 500 }
    );
  }
}