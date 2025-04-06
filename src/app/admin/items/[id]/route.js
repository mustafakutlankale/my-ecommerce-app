import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import clientPromise from '@/utils/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(request, { params }) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const itemId = params.id;
    if (!itemId || !ObjectId.isValid(itemId)) {
      return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db("ecommerce");
    
    const item = await db.collection("items").findOne({ _id: new ObjectId(itemId) });
    
    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    
    const userIds = item.reviews?.map(review => review.userId) || [];
    
    const result = await db.collection("items").deleteOne({ _id: new ObjectId(itemId) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    
    if (userIds.length > 0) {
      await db.collection("users").updateMany(
        { _id: { $in: userIds.map(id => new ObjectId(id)) } },
        { $pull: { itemsReviewed: itemId } }
      );
    }
    
    return NextResponse.json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error('Error removing item:', error);
    return NextResponse.json(
      { message: 'Failed to remove item', error: error.message },
      { status: 500 }
    );
  }
}