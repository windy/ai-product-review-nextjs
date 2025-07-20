import { getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  return NextResponse.json({ success: true });
}
