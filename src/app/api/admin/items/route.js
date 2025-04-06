import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/utils/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const itemData = await request.json();
    
    const requiredFields = ['name', 'description', 'price', 'seller', 'image', 'category'];
    for (const field of requiredFields) {
      if (!itemData[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db("ecommerce");
    
    const result = await db.collection("items").insertOne(itemData);
    
    return NextResponse.json({ 
      message: 'Item added successfully',
      itemId: result.insertedId 
    });
  } catch (error) {
    console.error('Error adding item:', error);
    return NextResponse.json(
      { message: 'Failed to add item', error: error.message },
      { status: 500 }
    );
  }
}