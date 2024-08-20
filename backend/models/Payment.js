import mongoose from 'mongoose';

const PaymentHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
  },
  referenceNo: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const PaymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    rent: {
      type: Number,
      default: 0,
    },
    waterBill: {
      type: Number,
      default: 0,
    },
    garbageFee: {
      type: Number,
      default: 0,
    },
    extraBills: {
      type: Number,
      default: 0,
    },
    previousBalance: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    referenceNo: {
      type: String,
    },

    balance: {
      type: Number,
      default: 0,
    },
    excessPay: {
      type: Number,
      default: 0,
    },
    previousExcessPay: {
      type: Number,
      default: 0,
    },
    isCleared: {
      type: Boolean,
      default: false,
    },
    paymentHistory: [PaymentHistorySchema],
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
