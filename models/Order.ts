import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  buybackEligible?: boolean;
  buybackRequested?: boolean;
  buybackRequestedAt?: Date;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  fee?: number; // Service fee (replaces tax in newer orders)
  walletPayment?: number; // Amount paid from wallet
  total: number;
  status: 'pending-payment' | 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  mpesaCode?: string;
  mpesaPhone?: string;
  mpesaReference?: string;
  mpesaVerified?: boolean;
  paidAt?: Date;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    county: string;
    postalCode?: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: {
          type: String,
          required: false,
          default: '/placeholder-product.png',
        },
        variant: String,
        buybackEligible: {
          type: Boolean,
          default: false,
        },
        buybackRequested: {
          type: Boolean,
          default: false,
        },
        buybackRequestedAt: {
          type: Date,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    fee: {
      type: Number,
      default: 0,
    },
    walletPayment: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending-payment', 'pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    mpesaCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    mpesaPhone: {
      type: String,
    },
    mpesaReference: {
      type: String,
    },
    mpesaVerified: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      county: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
      },
    },
    trackingNumber: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ status: 1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
