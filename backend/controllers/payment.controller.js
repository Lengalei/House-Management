import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';

// Create a new payment record

// Create a new payment record
export const createPayment = async (req, res) => {
  console.log('paymentReceivedInBackEnd: ', req.body);
  const {
    tenantId,
    date,
    extraBills,
    rent,
    waterBill,
    garbageFee,
    referenceNo,
    amountPaid,
  } = req.body;

  try {
    // Convert string values to numbers
    const extraBillsNum = Number(extraBills) || 0;
    const rentNum = Number(rent) || 0;
    const waterBillNum = Number(waterBill) || 0;
    const garbageFeeNum = Number(garbageFee) || 0;
    const amountPaidNum = Number(amountPaid) || 0;

    if (
      isNaN(extraBillsNum) ||
      isNaN(rentNum) ||
      isNaN(waterBillNum) ||
      isNaN(garbageFeeNum) ||
      isNaN(amountPaidNum)
    ) {
      return res
        .status(400)
        .json({ message: 'Invalid numerical values provided.' });
    }

    // Fetch the tenant details
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found.' });
    }

    // Check if the tenant has an overPay value
    const onEntryOverPay = tenant.overPay || 0;

    // Calculate the total amount expected and adjust based on previous payment
    const previousPayment = await Payment.findOne({ tenantId }).sort({
      createdAt: -1,
    });
    const previousBalance =
      previousPayment && !previousPayment.isCleared
        ? previousPayment.balance
        : 0;
    const previousExcessPay =
      previousPayment && previousPayment.excessPay
        ? previousPayment.excessPay
        : 0;

    // Calculate total amount and balance considering onEntryOverPay
    const totalAmount =
      rentNum + waterBillNum + garbageFeeNum + extraBillsNum + previousBalance;
    const balance =
      totalAmount - (amountPaidNum + previousExcessPay + onEntryOverPay);
    const isCleared = balance <= 0;
    const excessPay = isCleared ? Math.abs(balance) : 0;

    // Create the payment record
    const payment = await Payment.create({
      tenantId,
      date,
      rent: rentNum,
      waterBill: waterBillNum,
      garbageFee: garbageFeeNum,
      extraBills: extraBillsNum,
      previousBalance,
      previousExcessPay,
      totalAmount,
      referenceNo,
      amountPaid: amountPaidNum,
      balance: isCleared ? 0 : balance,
      excessPay,
      isCleared,
    });

    // After considering overPay, set tenant's overPay to 0
    tenant.overPay = 0;
    await tenant.save();

    // Respond with payment details and onEntryOverPay
    res.status(201).json({
      payment,
      onEntryOverPay,
    });
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get total amount of all payments made by all tenants
export const getAllPayments = async (req, res) => {
  try {
    // Fetch all payments
    const payments = await Payment.find();

    // Check if payments exist
    if (!payments || payments.length === 0) {
      return res.status(400).json({ message: 'No payments made yet' });
    }

    // Calculate the total amount
    const totalAmount = payments.reduce((total, payment) => {
      const amount = parseFloat(payment.totalAmount);
      if (!isNaN(amount)) {
        return total + amount;
      }
      return total;
    }, 0);
    // console.log('totalAmount: ', totalAmount);
    // Return the total amount
    res.status(200).json(totalAmount);
  } catch (err) {
    console.error('Error fetching payments for all tenants:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get total amount of all rents from all payments made by all tenants
export const getAllRentsPaid = async (req, res) => {
  try {
    // Fetch all payments
    const payments = await Payment.find();

    // Check if payments exist
    if (!payments || payments.length === 0) {
      return res.status(400).json({ message: 'No payments made yet' });
    }

    // Group payments by year
    const groupedByYear = payments.reduce((acc, payment) => {
      const year = payment.date.getFullYear();
      const rent = parseFloat(payment.rent) || 0;

      if (!acc[year]) {
        acc[year] = {
          totalRent: 0,
          months: {},
        };
      }

      // Add the rent to the total for that year
      acc[year].totalRent += rent;

      // Get the month
      const month = payment.date.toLocaleString('default', { month: 'long' });

      if (!acc[year].months[month]) {
        acc[year].months[month] = 0;
      }

      // Add the rent to the total for that month
      acc[year].months[month] += rent;

      return acc;
    }, {});

    // Convert grouped data into a more structured format for the response
    const response = Object.keys(groupedByYear).map((year) => ({
      year,
      totalRent: groupedByYear[year].totalRent,
      months: Object.keys(groupedByYear[year].months).map((month) => ({
        month,
        totalRent: groupedByYear[year].months[month],
      })),
    }));

    // Return the grouped data
    res.status(200).json({ groupedByYear: response });
  } catch (err) {
    console.error('Error fetching total rent for all payments:', err);
    res.status(500).json({ message: err.message });
  }
};

// Controller to get all water payment records
export const getAllWaterRecords = async (req, res) => {
  try {
    const waterPayments = await Payment.find({ waterBill: { $gt: 0 } });

    if (!waterPayments || waterPayments.length === 0) {
      return res.status(400).json({ message: 'No water payments made yet' });
    }

    const groupedByYear = waterPayments.reduce((acc, payment) => {
      const year = payment.date.getFullYear();
      const amount = payment.waterBill || 0;

      if (!acc[year]) {
        acc[year] = {
          totalAmount: 0,
          months: {},
        };
      }

      acc[year].totalAmount += amount;

      const month = payment.date.toLocaleString('default', { month: 'long' });

      if (!acc[year].months[month]) {
        acc[year].months[month] = 0;
      }

      acc[year].months[month] += amount;

      return acc;
    }, {});

    const response = Object.keys(groupedByYear).map((year) => ({
      year,
      totalAmount: groupedByYear[year].totalAmount,
      months: Object.keys(groupedByYear[year].months).map((month) => ({
        month,
        totalAmount: groupedByYear[year].months[month],
      })),
    }));

    res.status(200).json({ groupedByYear: response });
  } catch (err) {
    console.error('Error fetching water payment records:', err);
    res.status(500).json({ message: err.message });
  }
};

// Controller to get all garbage payment records
export const getAllGarbageRecords = async (req, res) => {
  try {
    const garbagePayments = await Payment.find({ garbageFee: { $gt: 0 } });

    if (!garbagePayments || garbagePayments.length === 0) {
      return res.status(400).json({ message: 'No garbage payments made yet' });
    }

    const groupedByYear = garbagePayments.reduce((acc, payment) => {
      const year = payment.date.getFullYear();
      const amount = payment.garbageFee || 0;

      if (!acc[year]) {
        acc[year] = {
          totalAmount: 0,
          months: {},
        };
      }

      acc[year].totalAmount += amount;

      const month = payment.date.toLocaleString('default', { month: 'long' });

      if (!acc[year].months[month]) {
        acc[year].months[month] = 0;
      }

      acc[year].months[month] += amount;

      return acc;
    }, {});

    const response = Object.keys(groupedByYear).map((year) => ({
      year,
      totalAmount: groupedByYear[year].totalAmount,
      months: Object.keys(groupedByYear[year].months).map((month) => ({
        month,
        totalAmount: groupedByYear[year].months[month],
      })),
    }));

    res.status(200).json({ groupedByYear: response });
  } catch (err) {
    console.error('Error fetching garbage payment records:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get all payments grouped by tenantId
export const getGroupedPaymentsByTenant = async (req, res) => {
  try {
    const payments = await Payment.aggregate([
      {
        $group: {
          _id: '$tenantId',
          totalPayments: { $sum: '$totalAmount' }, // Sum of all payments
          payments: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'tenants',
          localField: '_id',
          foreignField: '_id',
          as: 'tenant',
        },
      },
      { $unwind: '$tenant' },
      {
        $addFields: {
          totalAmountPaid: { $add: ['$totalPayments', '$tenant.amountPaid'] },
        },
      },
      {
        $project: {
          _id: 1,
          totalPayments: 1,
          payments: 1,
          tenant: {
            name: 1,
            phoneNo: 1,
            houseNo: 1,
            amountPaid: 1, // Initial amount from the tenant model
          },
          totalAmountPaid: 1, // The sum of initial amountPaid and totalPayments
        },
      },
    ]);

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get detailed payments for a specific tenant
export const getPaymentsByTenantId = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const payments = await Payment.find({ tenantId })
      .populate('tenantId', 'name email houseNo')
      .sort({ date: -1 });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get payment records for a specific tenant
export const getPaymentsByTenant = async (req, res) => {
  const { tenantId } = req.params;

  try {
    // Fetch the tenant details
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found.' });
    }

    // Check if the tenant has an onEntryOverPay value
    const onEntryOverPay = tenant.overPay > 0 ? tenant.overPay : null;

    // Find payments by tenantId and populate tenant's email, name, and phoneNo
    const payments = await Payment.find({ tenantId })
      .sort({ date: -1 })
      .populate('tenantId', 'email name phoneNo');

    // Send response with payments and onEntryOverPay
    res.status(200).json({
      payments,
      onEntryOverPay,
    });
  } catch (err) {
    console.error('Error fetching payments for tenant:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get a specific payment record by tenantId and date
export const getPaymentByDate = async (req, res) => {
  const { tenantId } = req.params;
  const { date } = req.body; // Assuming date is passed in the body

  try {
    // Ensure the date is in ISO format (YYYY-MM-DD) for accurate searching
    const paymentDate = new Date(date);

    // Find the payment record matching the tenantId and the exact date
    const payment = await Payment.findOne({ tenantId, date: paymentDate });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.status(200).json(payment);
  } catch (err) {
    console.error('Error fetching payment by date:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get a specific previous payment record by tenantId
export const getPreviousPayment = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const payment = await Payment.findOne({ tenantId }).sort({ createdAt: -1 });

    if (!payment)
      return res.status(404).json({ message: 'Payment record not found' });
    console.log('previousPayment: ', payment);
    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to update a payment and create a payment history record
export const updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amountPaid, date, referenceNo } = req.body;

    const amountPaidNum = Number(amountPaid) || 0;
    if (isNaN(amountPaidNum)) {
      return res.status(400).json({ message: 'Invalid amount paid value.' });
    }

    // Find the payment record by ID
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Calculate the new balance
    let newBalance = payment.balance - amountPaidNum;

    // Update the payment record's balance and amount paid
    payment.amountPaid += amountPaidNum;

    let excessPay = payment.excessPay;
    if (newBalance < 0) {
      excessPay += Math.abs(newBalance);
      newBalance = 0;
    }

    payment.balance = newBalance;
    payment.excessPay = excessPay;

    // Check if the payment is fully cleared
    payment.isCleared = newBalance === 0;

    // Add the payment to the payment history
    payment.paymentHistory.push({
      amount: amountPaidNum,
      date,
      referenceNo,
    });

    // Save the updated payment record
    await payment.save();

    res.status(200).json({
      message: 'Payment updated successfully',
      payment,
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a payment record
export const deletePayment = async (req, res) => {
  const { paymentId } = req.params;

  // Validate the paymentId format
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    return res.status(400).json({ message: 'Invalid paymentId format' });
  }

  try {
    // Attempt to find and delete the payment record
    const payment = await Payment.findByIdAndDelete(paymentId);

    // Check if the payment record was found and deleted
    if (!payment) {
      return res.status(404).json({ message: 'No payment found to delete' });
    }

    // Respond with success message
    res.status(200).json({ message: 'Payment record deleted' });
  } catch (err) {
    // Handle any errors that occur
    res.status(500).json({ message: err.message });
  }
};

// Delete all payment records for a specific tenant
export const deletePaymentsByTenant = async (req, res) => {
  const { tenantId } = req.params;

  try {
    await Payment.deleteMany({ tenantId });
    res
      .status(200)
      .json({ message: 'All payment records deleted for the tenant' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
