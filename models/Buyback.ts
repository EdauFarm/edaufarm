import mongoose from 'mongoose';

const BuybackSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  requestedAmount: {
    type: Number,
    required: true,
  },
  approvedAmount: {
    type: Number,
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500,
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: true,
  },
  images: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  adminResponse: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    comments: String,
  },
  creditedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

BuybackSchema.index({ userId: 1, status: 1 });
BuybackSchema.index({ orderId: 1 });

export default mongoose.models.Buyback || mongoose.model('Buyback', BuybackSchema);
