import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  expected: {
    type: Number,
  },
  date: {
    type: Date,
    required: true,
  },
  referenceNumber: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

// Schema for excess history
const excessHistorySchema = new mongoose.Schema({
  initialOverpay: { type: Number, required: true }, // Initial overpayment before this excess
  excessAmount: { type: Number, required: true }, // The amount added as excess
  description: { type: String, required: true }, // Descriptive string for the excess record
  date: { type: Date, default: Date.now }, // Date of the excess record
});

// Define the schema for the clearance record
const clearanceSchema = new Schema(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    exitingDate: {
      type: Date,
      default: Date.now,
    },
    referenceNumber: {
      type: String,
      required: true,
    },
    referenceNoHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        referenceNumber: {
          type: String,
          required: true,
        },
        previousReferenceNumber: String,
      },
    ],
    paintingFee: {
      expected: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      paid: { type: Boolean, default: false },
      transactions: [transactionSchema],
      deficit: { type: Number, default: 0 },
      deficitHistory: [
        {
          amount: { type: Number },
          date: { type: Date },
          description: { type: String },
        },
      ],
    },
    miscellaneous: {
      expected: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      paid: { type: Boolean, default: false },
      transactions: [transactionSchema],
      deficit: { type: Number, default: 0 },
      deficitHistory: [
        {
          amount: { type: Number },
          date: { type: Date },
          description: { type: String },
        },
      ],
    },
    isCleared: {
      type: Boolean,
      default: false,
    },
    totalAmountPaid: {
      type: Number,
      default: 0,
    },
    globalDeficit: {
      type: Number,
      default: 0,
    },
    globalDeficitHistory: [
      {
        amount: { type: Number },
        date: { type: Date },
        description: { type: String },
      },
    ],
    globalTransactions: [transactionSchema],
    globalAmountPaid: {
      type: Number,
      default: 0,
    },
    overpay: {
      type: Number,
      default: 0,
    },
    excessHistory: [excessHistorySchema],
  },
  { timestamps: true }
);

// Export the model using ES module syntax
const Clearance = model('Clearance', clearanceSchema);
export default Clearance;
