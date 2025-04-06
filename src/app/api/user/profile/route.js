import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import clientPromise from '@/utils/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db("ecommerce");
    
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user profile', error: error.message },
      { status: 500 }
    );
  }
}