import Payment from '../models/Payment.js';

// Create a new payment record
export const createPayment = async (req, res) => {
  console.log('paymentRecivedInBackEnd: ', req.body);
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

    // Check if there's an unpaid previous balance or excess pay
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
    console.log('previousExcessPay: ', previousExcessPay);

    // Calculate total amount and balance
    const totalAmount =
      rentNum + waterBillNum + garbageFeeNum + extraBillsNum + previousBalance;
    console.log('totalAmount: ', totalAmount);
    const balance = totalAmount - (amountPaidNum + previousExcessPay);
    console.log('balance: ', balance);
    const isCleared = balance <= 0;
    const excessPay = isCleared ? Math.abs(balance) : 0;

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

    res.status(201).json(payment);
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
    console.log('totalAmount: ', totalAmount);
    // Return the total amount
    res.status(200).json(totalAmount);
  } catch (err) {
    console.error('Error fetching payments for all tenants:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get payment records for a specific tenant
export const getPaymentsByTenant = async (req, res) => {
  const { tenantId } = req.params;

  try {
    // Find payments by tenantId and populate tenant's email, username, and phoneNumber
    const payments = await Payment.find({ tenantId })
      .sort({ date: -1 })
      .populate('tenantId', 'email name phoneNo');
    console.log('paymentsWithTenantDt: ', payments);
    res.status(200).json(payments);
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
    const { amountPaid } = req.body;

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
    payment.paymentHistory.push({ amount: amountPaidNum });

    // Save the updated payment record
    await payment.save();

    res.status(200).json({ message: 'Payment updated successfully', payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a payment record
export const deletePayment = async (req, res) => {
  const { paymentId } = req.params;

  try {
    await Payment.findByIdAndDelete(paymentId);
    res.status(200).json({ message: 'Payment record deleted' });
  } catch (err) {
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
