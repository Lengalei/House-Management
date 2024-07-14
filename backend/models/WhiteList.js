import mongoose from 'mongoose';

const WhiteListSchema = new mongoose.Schema(
  {
    whiteListTenant: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const WhiteListTenant = mongoose.model('WhiteList', WhiteListSchema);

export default WhiteListTenant;
