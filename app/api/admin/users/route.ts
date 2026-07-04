import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { isAdmin } from '@/lib/roleCheck';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await dbConnect();
    const User = (await import('@/models/User')).default;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const verified = searchParams.get('verified');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (verified !== null && verified !== undefined && verified !== 'all') {
      query.isVerified = verified === 'true';
    }

    // Execute query
    const users = await User.find(query)
      .select('-password -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordTokenExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch wallet information for each user
    const Wallet = (await import('@/models/Wallet')).default;
    const usersWithWallets = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id }).select('balance').lean();
        return {
          ...user,
          wallet: wallet ? { balance: (wallet as any).balance } : null,
        };
      })
    );

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users: usersWithWallets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch users', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await dbConnect();
    const User = (await import('@/models/User')).default;
    const Wallet = (await import('@/models/Wallet')).default;

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent admin from modifying their own role
    if (userId === session.user.id && updates.role) {
      return NextResponse.json(
        { error: 'Cannot modify your own role' },
        { status: 403 }
      );
    }

    // Handle wallet balance update separately
    if (updates.walletBalance !== undefined) {
      const walletBalance = parseFloat(updates.walletBalance);
      
      if (isNaN(walletBalance) || walletBalance < 0) {
        return NextResponse.json(
          { error: 'Invalid wallet balance. Must be a positive number.' },
          { status: 400 }
        );
      }

      // Find or create wallet
      let wallet = await Wallet.findOne({ userId });
      
      if (!wallet) {
        wallet = await Wallet.create({
          userId,
          balance: walletBalance,
          transactions: [],
        });
      } else {
        const oldBalance = wallet.balance;
        wallet.balance = walletBalance;
        
        // Add transaction record for admin adjustment
        wallet.transactions.push({
          type: 'deposit',
          amount: walletBalance - oldBalance,
          status: 'completed',
          description: `Admin balance adjustment by ${session.user.email}`,
          completedAt: new Date(),
        });
        
        await wallet.save();
      }
      
      // Remove walletBalance from updates as it's not a User field
      delete updates.walletBalance;
    }

    // Allowed updates for User model
    const allowedUpdates = ['role', 'isVerified', 'name', 'phone', 'address'];
    const filteredUpdates: any = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordTokenExpiry');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update user', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await dbConnect();
    const User = (await import('@/models/User')).default;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 403 }
      );
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete user', message: error.message },
      { status: 500 }
    );
  }
}
