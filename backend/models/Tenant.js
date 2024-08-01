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
    rentPayable: {
      type: Number,
      default: 17000,
    },
    waterDeposit: {
      type: Number,
      default: 1200,
    },
    garbageFee: {
      type: Number,
      default: 500,
    },
    houseNo: {
      type: String,
      unique: true,
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
  },
  { timestamps: true }
);

const Tenant = mongoose.model('Tenant', TenantSchema);

export default Tenant;
