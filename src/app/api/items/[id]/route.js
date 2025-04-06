import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/utils/mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("ecommerce");
    
    const item = await db.collection("items").findOne({ _id: new ObjectId(id) });
    
    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { message: 'Failed to fetch item', error: error.message },
      { status: 500 }
    );
  }
}