import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const user = await getUser();
    const sessionCookie = (await cookies()).get('session');
    
    return NextResponse.json({
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      } : null,
      hasSessionCookie: !!sessionCookie,
      sessionValue: sessionCookie ? 'exists' : 'none'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      user: null,
      hasSessionCookie: false
    });
  }
}