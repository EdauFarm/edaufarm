import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// GET: Fetch user's saved addresses
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email }).select('savedAddresses phone name');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      addresses: user.savedAddresses || [],
      userInfo: {
        name: user.name,
        phone: user.phone,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch addresses', details: error.toString() },
      { status: 500 }
    );
  }
}

// POST: Save a new address
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, address, city, county, postalCode, isDefault, label } = body;

    if (!fullName || !phone || !address || !city || !county) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, phone, address, city, county' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If this is default, unset other defaults
    if (isDefault && user.savedAddresses) {
      user.savedAddresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // Add new address
    const newAddress = {
      fullName,
      phone,
      address,
      city,
      county,
      postalCode,
      isDefault: isDefault || false,
      label: label || 'Home',
    };

    if (!user.savedAddresses) {
      user.savedAddresses = [];
    }

    // If first address, make it default
    if (user.savedAddresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.savedAddresses.push(newAddress);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address saved successfully',
      addresses: user.savedAddresses,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to save address', details: error.toString() },
      { status: 500 }
    );
  }
}

// PUT: Update an address or set as default
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { addressId, setAsDefault, ...updates } = body;

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user || !user.savedAddresses) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const addressIndex = user.savedAddresses.findIndex(
      (addr: any) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Set as default
    if (setAsDefault) {
      user.savedAddresses.forEach((addr: any, idx: number) => {
        addr.isDefault = idx === addressIndex;
      });
    }

    // Update address fields
    if (Object.keys(updates).length > 0) {
      Object.assign(user.savedAddresses[addressIndex], updates);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.savedAddresses,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update address', details: error.toString() },
      { status: 500 }
    );
  }
}

// DELETE: Remove an address
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get('addressId');

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });

    if (!user || !user.savedAddresses) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const initialLength = user.savedAddresses.length;
    user.savedAddresses = user.savedAddresses.filter(
      (addr: any) => addr._id.toString() !== addressId
    );

    if (user.savedAddresses.length === initialLength) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If deleted address was default and there are others, set first as default
    const hasDefault = user.savedAddresses.some((addr: any) => addr.isDefault);
    if (!hasDefault && user.savedAddresses.length > 0) {
      user.savedAddresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.savedAddresses,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete address', details: error.toString() },
      { status: 500 }
    );
  }
}
