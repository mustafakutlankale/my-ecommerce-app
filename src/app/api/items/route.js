import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const client = await clientPromise;
    const db = client.db("ecommerce");
    
    let query = {};
    if (category) {
      query = { category: category };
    }
    
    const items = await db.collection("items").find(query).toArray();
    
    console.log(`Returning ${items.length} items`);
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: error.message, items: [] }, { status: 500 });
  }
}