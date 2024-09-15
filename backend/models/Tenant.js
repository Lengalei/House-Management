import mongoose from "mongoose";

// Define the PaymentHistory schema
const PaymentHistorySchema = new mongoose.Schema(
  {
    amountAdded: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    referenceNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Define the Tenant schema with the PaymentHistory subdocument
const TenantSchema = new mongoose.Schema(
  {
    // Tenant personal details
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    nationalId: { type: Number, required: true, unique: true },
    phoneNo: { type: Number, required: true },
    placementDate: { type: Date, required: true },
    // Deposits
    houseDeposit: { type: Number, required: true },
    rentPayable: { type: Number, default: 17000 },
    waterDeposit: { type: Number, default: 1200 },
    garbageFee: { type: Number, default: 150 },
    houseNo: { type: String, unique: true, required: true },
    // Emergency contact
    emergencyContactNumber: { type: Number, required: true },
    emergencyContactName: { type: String, required: true },
    // Advanced data
    whiteListTenant: { type: Boolean, default: false },
    blackListTenant: { type: Boolean, default: false },
    // Financial details
    amountPaid: { type: Number, default: 0 },
    paymentDate: { type: Date },
    monthInQuestionPay: { type: String, upperCase:true },
    referenceNumber: { type: String },
    isInGreyList: { type: Boolean, default: true },
    overPay: { type: Number, default: 0 },
    underPay: { type: Number, default: 0 },
    // Payment history
    paymentHistory: [PaymentHistorySchema],
  },
  { timestamps: true }
);

const Tenant = mongoose.model("Tenant", TenantSchema);

export default Tenant;
