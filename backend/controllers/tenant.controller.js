import mongoose from 'mongoose';
import Tenant from '../models/Tenant.js';
import cron from 'node-cron';
import Payment from '../models/Payment.js';
import House from '../models/houses.js';

// Function to convert floor string to corresponding number
const convertFloorToNumber = (floor) => {
  const floorMap = {
    'Ground Floor': 0,
    'Floor 1': 1,
    'Floor 2': 2,
    'Floor 3': 3,
    'Floor 4': 4,
    'Floor 5': 5,
    'Floor 6': 6,
  };
  return floorMap[floor] || null;
};

// Register Tenant
export const registerTenant = async (req, res) => {
  const {
    name,
    email,
    nationalId,
    phoneNo,
    placementDate,
    houseDeposit,
    waterDeposit,
    houseNo,
    rentPayable,
    emergencyContactNumber,
    emergencyContactName,
    //from popup
    amountPaid,
    paymentDate,
    monthInQuestionPay,
    referenceNumber,
  } = req.body;

  if (
    !name ||
    !email ||
    !nationalId ||
    !phoneNo ||
    !placementDate ||
    !houseDeposit ||
    !waterDeposit ||
    !houseNo ||
    !rentPayable ||
    !emergencyContactNumber ||
    !emergencyContactName ||
    !monthInQuestionPay ||
    !amountPaid ||
    !paymentDate ||
    !referenceNumber
  ) {
    return res.status(400).json({ message: 'Please fill in all the details!' });
  }

  // Convert amounts to numbers
  const rentPayableNum = parseFloat(rentPayable) || 0;
  const houseDepositNum = parseFloat(houseDeposit) || 0;
  const waterDepositNum = parseFloat(waterDeposit) || 0;
  const amountPaidNum = parseFloat(amountPaid) || 0;

  // Calculate total amount
  const totalAmount = rentPayableNum + houseDepositNum + waterDepositNum;

  // Calculate overpay or underpay
  let overPay = 0;
  let underPay = 0;

  if (amountPaidNum > totalAmount) {
    overPay = amountPaidNum - totalAmount;
  } else if (amountPaidNum < totalAmount) {
    underPay = totalAmount - amountPaidNum;
  }

  // Special handling for "Ground Floor"
  let floorNumber;
  let houseName;

  if (houseNo.startsWith('Ground Floor')) {
    floorNumber = 0;
    houseName = houseNo.split(',')[1]?.trim() || '';
  } else {
    const [floorStr, houseNamePart] = houseNo
      .split(',')
      .map((part) => part.trim());
    floorNumber = convertFloorToNumber(floorStr);
    houseName = houseNamePart;
  }

  if (floorNumber === null) {
    return res.status(400).json({ message: 'Invalid floor provided!' });
  }

  try {
    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
      return res.status(400).json({ message: 'Tenant already exists!' });
    }

    const existingTenantInHouse = await Tenant.findOne({ houseNo });
    if (existingTenantInHouse) {
      return res.status(400).json({ message: 'House Already Occupied!' });
    }

    const existingNationalId = await Tenant.findOne({ nationalId });
    if (existingNationalId) {
      return res
        .status(409)
        .json({ message: 'Tenant National ID already exists!' });
    }

    const house = await House.findOneAndUpdate(
      { floor: floorNumber, houseName: houseName },
      { isOccupied: true },
      { new: true }
    );

    if (!house) {
      return res.status(404).json({ message: 'House not found!' });
    }

    // Determine isInGreyList based on amountPaid
    const isInGreyList = amountPaidNum < totalAmount;

    const newTenant = await Tenant.create({
      name,
      email,
      nationalId,
      phoneNo,
      placementDate,
      houseDeposit: houseDepositNum,
      waterDeposit: waterDepositNum,
      houseNo,
      rentPayable: rentPayableNum,
      emergencyContactNumber,
      emergencyContactName,
      amountPaid: amountPaidNum,
      monthInQuestionPay,
      paymentDate,
      referenceNumber,
      isInGreyList,
      overPay,
      underPay,
      paymentHistory: [
        {
          amountAdded: amountPaidNum,
          paymentDate,
          referenceNumber,
        },
      ],
    });

    res.status(201).json({ newTenant, totalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update AmountPaid
export const updateAmountPaid = async (req, res) => {
  const { tenantId } = req.params;
  const { amountPaid, paymentDate, referenceNumber } = req.body;

  if (!amountPaid || !paymentDate || !referenceNumber) {
    return res.status(400).json({
      message: 'Please provide amountPaid, paymentDate, and referenceNumber!',
    });
  }

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found!' });
    }

    // Convert amountPaid to number
    const amountPaidNum = parseFloat(amountPaid) || 0;

    // Calculate the total amount expected
    const totalAmount =
      tenant.rentPayable + tenant.houseDeposit + tenant.waterDeposit;

    // Update the amountPaid and adjust underPay or overPay
    let newAmountPaid = tenant.amountPaid + amountPaidNum;
    let overPay = tenant.overPay;
    let underPay = tenant.underPay;

    if (newAmountPaid > totalAmount) {
      overPay = newAmountPaid - totalAmount;
      underPay = 0; // No underpay when overpay exists
    } else if (newAmountPaid < totalAmount) {
      underPay = totalAmount - newAmountPaid;
      overPay = 0; // No overpay when underpay exists
    } else {
      overPay = 0;
      underPay = 0; // Exact payment
    }

    // Update tenant payment information
    tenant.amountPaid = newAmountPaid;
    tenant.overPay = overPay;
    tenant.underPay = underPay;

    // Determine grey list status
    tenant.isInGreyList = underPay > 0 || newAmountPaid < totalAmount;

    // Add the payment to the payment history
    tenant.paymentHistory.push({
      amountAdded: amountPaidNum,
      paymentDate,
      referenceNumber,
    });

    await tenant.save();

    res
      .status(200)
      .json({ message: 'Amount paid updated successfully!', tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get All Tenants
// Get All Tenants with Payment Details
export const getAllTenants = async (req, res) => {
  try {
    // Fetch all tenants
    const allTenants = await Tenant.find({ isInGreyList: false });

    // For each tenant, fetch payment details
    const tenantsWithPaymentDetails = await Promise.all(
      allTenants.map(async (tenant) => {
        // Get payment details for the tenant
        const payments = await Payment.find({ tenantId: tenant._id });

        // Calculate totalAmount and balance
        const totalAmount = payments.reduce(
          (sum, payment) => sum + payment.totalAmount,
          0
        );
        const balance = payments.reduce(
          (sum, payment) => sum + payment.balance,
          0
        );

        return {
          ...tenant.toObject(),
          totalAmount,
          balance,
        };
      })
    );

    res.status(200).json(tenantsWithPaymentDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//get all grey tenants
export const getGreyTenants = async (req, res) => {
  try {
    const greyTenants = await Tenant.find({ isInGreyList: true });
    if (!greyTenants) {
      return res.status(400).json('No grey Tenants');
    }
    res.status(200).json(greyTenants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Single Tenant
export const getSingleTenant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.status(200).json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Patch Single Tenant
export const updateSingleTenant = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const updatedTenant = await Tenant.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    return res.status(200).json(updatedTenant);
  } catch (err) {
    console.error('Error updating tenant:', err);
    return res
      .status(500)
      .json({ error: 'Server error', message: err.message });
  }
};

// Delete Tenant By ID
// Function to convert floor string to corresponding number

// Delete Tenant By ID
export const deleteTenantById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    // Find the tenant to get houseNo and tenantId
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const { houseNo } = tenant;

    // Determine floor and house name
    let floorNumber;
    let houseName;

    if (houseNo.startsWith('Ground Floor')) {
      floorNumber = 0;
      houseName = houseNo.split(',')[1]?.trim() || '';
    } else {
      const [floorStr, houseNamePart] = houseNo
        .split(',')
        .map((part) => part.trim());
      floorNumber = convertFloorToNumber(floorStr);
      houseName = houseNamePart;
    }

    if (floorNumber === null) {
      return res
        .status(400)
        .json({ message: 'Invalid floor in house number!' });
    }

    // Delete all payment records associated with the tenant
    await Payment.deleteMany({ tenantId: id });

    // Delete the tenant
    await Tenant.findByIdAndDelete(id);

    // Update the house to set isOccupied to false
    const house = await House.findOneAndUpdate(
      { floor: floorNumber, houseName: houseName },
      { isOccupied: false },
      { new: true }
    );

    if (!house) {
      return res.status(404).json({ message: 'House not found!' });
    }

    res.status(200).json({
      message:
        'Tenant and associated payments deleted successfully, house status updated',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Blacklist Tenant By ID
export const blackListTenant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { blackListTenant: true },
      { new: true }
    );
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res
      .status(200)
      .json({ message: 'Tenant blacklisted successfully', tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Whitelist Tenant By ID
export const whiteListTenant = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { whiteListTenant: true, blackListTenant: false },
      { new: true }
    );
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    console.log(tenant);
    res
      .status(200)
      .json({ message: 'Tenant whitelisted successfully', tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//update Tenant Payments
export const updateTenantPayments = async () => {
  try {
    const tenants = await Tenant.find({});
    tenants.forEach(async (tenant) => {
      let newTotalAmount =
        tenant.monthlyRent +
        tenant.waterBill +
        tenant.garbageFee +
        tenant.extraBills;
      if (tenant.balance > 0) {
        newTotalAmount += tenant.balance;
      }
      await Tenant.findByIdAndUpdate(tenant._id, {
        totalAmount: newTotalAmount,
        balance: newTotalAmount - tenant.amountPaid,
      });
    });
  } catch (error) {
    console.error('Error updating tenant payments:', error);
  }
};
cron.schedule('0 0 1 * *', updateTenantPayments); // Runs on the 1st of every month
