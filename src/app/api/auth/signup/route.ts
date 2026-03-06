// BurnSight Auth: Signup Route
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // In production, this would use Prisma + bcrypt
    // For now, return a mock token for demo purposes
    const mockToken = Buffer.from(JSON.stringify({
      id: `user_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      plan: 'FREE',
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })).toString('base64');

    return NextResponse.json({
      success: true,
      token: mockToken,
      user: {
        id: `user_${Date.now()}`,
        email,
        name: name || email.split('@')[0],
        plan: 'FREE',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
