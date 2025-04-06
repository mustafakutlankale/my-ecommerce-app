import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { hash } from 'bcrypt';
import clientPromise from '@/utils/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    console.log("API - Fetching users");
    
    const session = await getServerSession(authOptions);
    
    console.log("API - Session:", session);
    
    if (!session) {
      console.log("API - Not authenticated for user listing");
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      console.log("API - Not authorized to list users, role:", session.user.role);
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db("ecommerce");
    
    const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();
    
    console.log(`API - Successfully fetched ${users.length} users`);
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log("API - Processing add user request");
    
    const session = await getServerSession(authOptions);
    
    console.log("API - Session:", session);
    
    // Check authentication
    if (!session) {
      console.log("API - Not authenticated");
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    // Check authorization
    if (session.user.role !== 'admin') {
      console.log("API - Not authorized, role:", session.user.role);
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }
    
    const userData = await request.json();
    
    if (!userData.username || !userData.password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db('ecommerce');
    
    const existingUser = await db.collection('users').findOne({ username: userData.username });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 400 }
      );
    }
    
    const hashedPassword = await hash(userData.password, 10);
    
    const newUser = {
      username: userData.username,
      password: hashedPassword,
      role: userData.role || 'user',
      averageRating: 0,
      totalRatingsGiven: 0,
      sumRatingsGiven: 0,
      reviews: [],
      createdAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    
    return NextResponse.json({ 
      message: 'User added successfully',
      userId: result.insertedId 
    });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json(
      { message: 'Failed to add user', error: error.message },
      { status: 500 }
    );
  }
}