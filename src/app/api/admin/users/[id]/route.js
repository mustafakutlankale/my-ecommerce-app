import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import clientPromise from '@/utils/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = params.id;
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db("ecommerce");
    
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    if (user.role === 'admin') {
      const adminCount = await db.collection("users").countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return NextResponse.json(
          { message: 'Cannot delete the last admin user' },
          { status: 400 }
        );
      }
    }
    
    await db.collection("items").updateMany(
      { "reviews.userId": userId },
      { 
        $pull: { reviews: { userId: userId } },
      }
    );

    const itemsRated = await db.collection("items").find(
        { "reviews.userId": userId }
    ).toArray();
    
    for (const item of itemsRated) {
        const updatedReviews = item.reviews.filter(review => review.userId !== userId);
        
        let totalRating = 0;
        for (const review of updatedReviews) {
        totalRating += review.rating || 0;
        }
        
        const avgRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;
        
        await db.collection("items").updateOne(
        { _id: item._id },
        { 
            $set: { 
            reviews: updatedReviews,
            ratingSum: totalRating,
            reviewerCount: updatedReviews.length,
            avgRating: avgRating
            } 
        }
        );
    }
        
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json(
      { message: 'Failed to remove user', error: error.message },
      { status: 500 }
    );
  }
}