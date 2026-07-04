import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'buyback_credit', 'refund', 'purchase'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  mpesaReference: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  mpesaNumber: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^254\d{9}$/.test(v);
      },
      message: 'M-Pesa number must be in format 254XXXXXXXXX',
    },
  },
  mpesaVerified: {
    type: Boolean,
    default: false,
  },
  transactions: [TransactionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
