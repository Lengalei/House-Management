import mongoose from 'mongoose';

// Existing schemas for transactions and history
const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true }, // Transaction amount
  date: { type: Date, default: Date.now }, // Transaction date
  referenceNumber: { type: String, required: true }, // Reference number for the transaction
});
const waterTansactionSchema = new mongoose.Schema({
  amount: { type: Number }, // Transaction amount
  accumulatedAmount: { type: Number }, // Transaction amount
  date: { type: Date, default: Date.now }, // Transaction date
  referenceNumber: { type: String }, // Reference number for the transaction
  description: { type: String }, // Reference number for the transaction
});

const extraChargesTransactionSchema = new mongoose.Schema({
  amount: { type: Number }, // Transaction amount
  expected: { type: Number }, // Transaction amount
  date: { type: Date, default: Date.now }, // Transaction date
  referenceNumber: { type: String }, // Reference number for the transaction
  description: { type: String }, // Reference number for the transaction
});

const globalTransactionHistorySchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: String, required: true },
  totalRentAmount: { type: Number, required: true }, // Total rent amount for the payment
  totalWaterAmount: { type: Number, required: true }, // Total water amount for the payment
  totalGarbageFee: { type: Number, required: true }, // Total garbage amount for the payment
  totalAmount: { type: Number, required: true }, // Total amount paid for the month
  referenceNumber: { type: String, required: true }, // Reference number for the payment record
  globalDeficit: { type: Number, default: 0 }, // Total global deficit for the month
});

const deficitHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true }, // Amount of deficit
  date: { type: Date, default: Date.now }, // Date of the deficit record
  description: { type: String, required: true }, // Description of the deficit record
});

const globalDeficitHistorySchema = new mongoose.Schema({
  year: { type: Number, required: true },
  month: { type: String, required: true },
  totalDeficitAmount: { type: Number, required: true }, // Total global deficit amount
  description: { type: String, required: true }, // Description of the global deficit record
});

// Schema for excess history
const excessHistorySchema = new mongoose.Schema({
  initialOverpay: { type: Number, required: true }, // Initial overpayment before this excess
  excessAmount: { type: Number, required: true }, // The amount added as excess
  description: { type: String, required: true }, // Descriptive string for the excess record
  date: { type: Date, default: Date.now }, // Date of the excess record
});

const referenceNoHistorySchema = new mongoose.Schema({
  date: { type: Date },
  previousRefNo: { type: String },
  referenceNoUsed: { type: String },
  amount: { type: Number },
  description: { type: String },
});

const paymentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'v2Tenant',
      required: true,
    },
    year: { type: Number, required: true }, // e.g., 2024
    month: { type: String, required: true }, // e.g., "September"
    referenceNumber: { type: String, required: true }, // Reference number for the overall payment record
    overpay: { type: Number, default: 0 }, // Overpayment amount, if any
    rent: {
      amount: { type: Number, default: 0 }, // Rent amount for the month
      paid: { type: Boolean, default: false }, // Whether rent is fully paid
      deficit: { type: Number, default: 0 }, // Amount needed to fully pay rent
      transactions: [transactionSchema], // Array of rent-related transactions
      deficitHistory: [deficitHistorySchema], // Deficit history for rent
    },
    waterBill: {
      amount: { type: Number, default: 0 }, // Water bill for the month
      accumulatedAmount: { type: Number, default: 0 }, // Water bill for the month
      paid: { type: Boolean, default: false }, // Whether water bill is fully paid
      deficit: { type: Number, default: 0 }, // Amount needed to fully pay water bill
      transactions: [waterTansactionSchema], // Array of water-related transactions
      deficitHistory: [deficitHistorySchema], // Deficit history for water bill
    },
    garbageFee: {
      amount: { type: Number, default: 0 }, // Garbage fee for the month
      paid: { type: Boolean, default: false }, // Whether garbage fee is fully paid
      deficit: { type: Number, default: 0 }, // Amount needed to fully pay garbage fee
      transactions: [transactionSchema], // Array of garbage-related transactions
      deficitHistory: [deficitHistorySchema], // Deficit history for garbage fee
    },
    extraCharges: {
      description: { type: String, default: 'None' },
      expected: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      paid: { type: Boolean, default: false },
      deficit: { type: Number, default: 0 },
      transactions: [extraChargesTransactionSchema],
      deficitHistory: [deficitHistorySchema],
    },

    isCleared: { type: Boolean, default: false },
    referenceNoHistory: [referenceNoHistorySchema],
    totalAmountPaid: { type: Number, default: 0 }, // Total amount paid for the month
    globalTransactionHistory: [globalTransactionHistorySchema], // Global transaction history for this payment
    excessHistory: [excessHistorySchema], // History of excess payments
    globalDeficit: { type: Number, default: 0 }, // Total global deficit for the payment
    globalDeficitHistory: [globalDeficitHistorySchema], // Global deficit history
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Payment = mongoose.model('v2Payment', paymentSchema);

export default Payment;
