import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema(
  {
    // Tenant personal details
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nationalId: {
      type: Number,
      required: true,
      unique: true,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
    placementDate: {
      type: Date,
      required: true,
    },
    // Deposits
    houseDeposit: {
      type: Number,
      required: true,
    },
    waterDeposit: {
      type: Number,
      required: true,
    },
    rentPayable: {
      type: Number,
      required: true,
    },
    houseNo: {
      type: String,
      required: true,
    },
    // Emergency contact
    emergencyContactNumber: {
      type: Number,
      required: true,
    },
    emergencyContactName: {
      type: String,
      required: true,
    },
    // Advanced data
    whiteListTenant: {
      type: Boolean,
      default: false,
    },
    blackListTenant: {
      type: Boolean,
      default: false,
    },
    // Rent details
    monthlyRent: {
      type: Number,
      default: 0,
    },
    extraBills: {
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
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Tenant = mongoose.model('Tenant', TenantSchema);

export default Tenant;
