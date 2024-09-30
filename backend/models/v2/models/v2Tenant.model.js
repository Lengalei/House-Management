import mongoose from 'mongoose';

const transactionHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  referenceNo: { type: String }, // Optional reference number for the transaction
  previousAmount: { type: Number, required: true }, // The amount before the transaction
});

const excessDeficitHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String }, // Auto-generated description for context
});

const depositHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ['rentDeposit', 'waterDeposit', 'initialRentPayment', 'totalDeposit'],
    required: true,
  },
  referenceNo: { type: String },
});

const houseDetailsSchema = new mongoose.Schema({
  houseNo: { type: String, required: true },
  rent: { type: Number, required: true }, // Monthly rent value
  rentDeposit: { type: Number, required: true }, // Rent deposit value
  waterDeposit: { type: Number, required: true }, // Monthly water bill
  garbageFee: { type: Number, required: true }, // Monthly garbage fee
});

const depositDateHistorySchema = new mongoose.Schema({
  date: { type: Date },
  referenceNoUsed: { type: String },
  amount: { type: Number },
  description: { type: String },
});

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    nationalId: { type: Number, required: true, unique: true },
    phoneNo: { type: Number, required: true },
    placementDate: { type: Date, required: true },
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'apartments',
      required: true,
    },
    houseDetails: {
      type: houseDetailsSchema,
      required: true,
    },
    deposits: {
      rentDeposit: {
        type: Number,
        default: 0,
      },
      rentDepositHistory: [transactionHistorySchema], // Transaction history for rent deposit
      rentDepositExcess: { type: Number, default: 0 }, // Excess amount for rent deposit
      rentDepositExcessHistory: [excessDeficitHistorySchema], // Excess history for rent deposit
      rentDepositDeficit: { type: Number, default: 0 }, // Deficit amount for rent deposit
      rentDepositDeficitHistory: [excessDeficitHistorySchema], // Deficit history for rent deposit

      waterDeposit: {
        type: Number,
        default: 0,
      },
      waterDepositHistory: [transactionHistorySchema], // Transaction history for water deposit
      waterDepositExcess: { type: Number, default: 0 }, // Excess amount for water deposit
      waterDepositExcessHistory: [excessDeficitHistorySchema], // Excess history for water deposit
      waterDepositDeficit: { type: Number, default: 0 }, // Deficit amount for water deposit
      waterDepositDeficitHistory: [excessDeficitHistorySchema], // Deficit history for water deposit

      initialRentPayment: {
        type: Number,
        default: 0,
      },
      initialRentPaymentHistory: [transactionHistorySchema], // Transaction history for initial rent payment
      initialRentPaymentExcess: { type: Number, default: 0 }, // Excess amount for initial rent payment
      initialRentPaymentExcessHistory: [excessDeficitHistorySchema], // Excess history for initial rent payment
      initialRentPaymentDeficit: { type: Number, default: 0 }, // Deficit amount for initial rent payment
      initialRentPaymentDeficitHistory: [excessDeficitHistorySchema], // Deficit history for initial rent payment

      depositDate: { type: Date },
      depositDateHistory: [depositDateHistorySchema],
      referenceNo: { type: String },
      isCleared: { type: Boolean, default: false }, // Deposit clearance status
    },
    excessAmount: { type: Number, default: 0 }, // Current excess amount
    excessHistory: [excessDeficitHistorySchema], // Array to track excess amounts over time
    depositHistory: [depositHistorySchema], // To track deposit payments
    createdAt: { type: Date, default: Date.now },
    // Emergency contact
    emergencyContactNumber: { type: Number, required: true },
    emergencyContactName: { type: String, required: true },
    toBeCleared: { type: Boolean, default: false },
    whiteListTenant: { type: Boolean, default: false },
    blackListTenant: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Tenant = mongoose.model('v2Tenant', tenantSchema);

export default Tenant;
