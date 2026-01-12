import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '../../../../../auth';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  username: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['DRIVER', 'WORKSHOP', 'OPERATIONS', 'ADMIN']),
  phone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const accessLevel = request.cookies.get('accessLevel')?.value;
    
    // Check if user is admin (either through NextAuth or access cookie)
    const isAdmin = (session?.user?.role === 'ADMIN') || (accessLevel === 'admin');
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password field
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const accessLevel = request.cookies.get('accessLevel')?.value;
    
    // Check if user is admin (either through NextAuth or access cookie)
    const isAdmin = (session?.user?.role === 'ADMIN') || (accessLevel === 'admin');
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        username: validated.username || null,
        password: hashedPassword,
        role: validated.role,
        phone: validated.phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}