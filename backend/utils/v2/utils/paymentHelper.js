import Payment from '../../../models/v2/models/v2Payment.model.js';
import Tenant from '../../../models/v2/models/v2Tenant.model.js';

export const createPaymentRecord = async (
  tenantId,
  amount,
  depositDate,
  referenceNo
) => {
  try {
    // Ensure depositDate is a Date object
    const dateObject = new Date(depositDate);
    if (isNaN(dateObject.getTime())) {
      throw new Error('Invalid depositDate');
    }

    // Fetch tenant data, including rent and garbage fee from houseDetails
    const tenant = await Tenant.findById(tenantId).populate('houseDetails');
    if (!tenant) throw new Error('Tenant not found');

    const rentAmount = parseFloat(tenant.houseDetails.rent);
    const garbageFeeAmount = parseFloat(tenant.houseDetails.garbageFee);
    const givenWaterBill = 0; // Set this value based on your logic
    const expectedWaterBill = 0; // Set this value based on your logic

    // Initialize water bill-related variables
    let waterBillAmount = 0;
    let excessWaterAmountPaid = 0;
    let deficitWaterAmount = 0;

    // Extract year and month from depositDate
    const year = dateObject.getFullYear();
    const month = dateObject.toLocaleString('default', { month: 'long' });

    // Find or create the payment record for this month
    let payment = await Payment.findOne({ tenant: tenantId, year, month });

    if (!payment) {
      payment = new Payment({
        tenant: tenantId,
        year,
        month,
        referenceNumber: referenceNo,
        rent: { amount: 0, transactions: [], paid: false },
        waterBill: { amount: 0, transactions: [], paid: false },
        garbageFee: { amount: 0, transactions: [], paid: false },
        overpay: 0,
        totalAmountPaid: 0,
        globalTransactionHistory: [],
        excessHistory: [], // Initialize excess history
        globalDeficit: 0, // Initialize global deficit
        globalDeficitHistory: [], // Initialize global deficit history
      });
    }

    // Handle Water Bill
    if (givenWaterBill >= expectedWaterBill) {
      waterBillAmount = expectedWaterBill;
      excessWaterAmountPaid = parseFloat(
        givenWaterBill - expectedWaterBill
      ).toFixed(2);
    } else {
      waterBillAmount = givenWaterBill;
      deficitWaterAmount = parseFloat(
        expectedWaterBill - givenWaterBill
      ).toFixed(2);
    }

    // Update the payment record with the water bill information
    payment.waterBill.amount = waterBillAmount;
    payment.waterBill.transactions.push({
      amount: parseFloat(waterBillAmount.toFixed(2)),
      referenceNumber: referenceNo,
      date: dateObject,
    });

    // Handle excess water payment
    if (excessWaterAmountPaid > 0) {
      payment.overpay = parseFloat(
        (payment.overpay + parseFloat(excessWaterAmountPaid)).toFixed(2)
      );
      payment.excessHistory.push({
        initialOverpay: payment.overpay - parseFloat(excessWaterAmountPaid),
        excessAmount: parseFloat(excessWaterAmountPaid),
        description: `Excess water bill payment of ${excessWaterAmountPaid} added on ${dateObject.toLocaleString()}`,
        date: dateObject,
      });
    }

    // Update water bill deficit if any
    if (deficitWaterAmount > 0) {
      payment.waterBill.deficit = parseFloat(deficitWaterAmount);
      payment.waterBill.deficitHistory.push({
        amount: deficitWaterAmount,
        description: `Deficit in water bill for ${month} ${year}`,
        date: dateObject,
      });
    }

    // Initialize the remaining amount to be distributed
    let remainingAmount = parseFloat(amount);

    // 1. Handle Rent Payment
    const currentRentAmount = parseFloat(payment.rent.amount);
    const rentDue = Math.max(rentAmount - currentRentAmount, 0);
    const rentPayment = Math.min(remainingAmount, rentDue);

    // Update rent transaction and payment record
    payment.rent.transactions.push({
      amount: parseFloat(rentPayment.toFixed(2)),
      referenceNumber: referenceNo,
      date: dateObject,
    });

    payment.rent.amount = parseFloat(
      (currentRentAmount + rentPayment).toFixed(2)
    );
    payment.rent.paid = payment.rent.amount >= rentAmount;

    // Handle rent deficit if any
    const rentDeficit = rentAmount - payment.rent.amount;
    if (rentDeficit > 0) {
      payment.rent.deficit = parseFloat(rentDeficit.toFixed(2));
      payment.rent.deficitHistory.push({
        amount: rentDeficit,
        description: `Deficit in rent payment for ${month} ${year}`,
        date: dateObject,
      });
    }

    // Deduct the rent payment from the remaining amount
    remainingAmount = parseFloat((remainingAmount - rentPayment).toFixed(2));

    // 2. Handle Garbage Fee Payment
    const currentGarbageAmount = parseFloat(payment.garbageFee.amount);
    const garbageDue = Math.max(garbageFeeAmount - currentGarbageAmount, 0);
    const garbagePayment = Math.min(remainingAmount, garbageDue);

    // Update garbage fee transaction and payment record
    payment.garbageFee.transactions.push({
      amount: parseFloat(garbagePayment.toFixed(2)),
      referenceNumber: referenceNo,
      date: dateObject,
    });

    payment.garbageFee.amount = parseFloat(
      (currentGarbageAmount + garbagePayment).toFixed(2)
    );
    payment.garbageFee.paid = payment.garbageFee.amount >= garbageFeeAmount;

    // Handle garbage fee deficit if any
    const garbageDeficit = garbageFeeAmount - payment.garbageFee.amount;
    if (garbageDeficit > 0) {
      payment.garbageFee.deficit = parseFloat(garbageDeficit.toFixed(2));
      payment.garbageFee.deficitHistory.push({
        amount: garbageDeficit,
        description: `Deficit in garbage fee payment for ${month} ${year}`,
        date: dateObject,
      });
    }

    // Deduct the garbage payment from the remaining amount
    remainingAmount = parseFloat((remainingAmount - garbagePayment).toFixed(2));

    // 4. Handle Overpayment
    if (remainingAmount > 0) {
      const initialOverpay = payment.overpay;

      payment.overpay = parseFloat(
        (initialOverpay + remainingAmount).toFixed(2)
      );

      // Add a record to excessHistory
      payment.excessHistory.push({
        initialOverpay,
        excessAmount: remainingAmount,
        description: `Excess payment of ${remainingAmount} added on ${dateObject.toLocaleString()}`,
        date: dateObject,
      });
    }

    // Calculate global deficit
    const waterDeficit = Math.max(
      expectedWaterBill - payment.waterBill.amount,
      0
    );
    const globalDeficit = parseFloat(
      (rentDeficit + garbageDeficit + waterDeficit).toFixed(2)
    );

    // Update global deficit and history
    payment.globalDeficit = globalDeficit;
    if (globalDeficit > 0) {
      payment.globalDeficitHistory.push({
        year,
        month,
        totalDeficitAmount: globalDeficit,
        description: `Global deficit of ${globalDeficit} for ${month} ${year}`,
        date: dateObject,
      });
    }

    // Update the total amount paid for the month
    payment.totalAmountPaid = parseFloat(
      (
        payment.rent.amount +
        payment.waterBill.amount +
        payment.garbageFee.amount
      ).toFixed(2)
    );

    // 5. Create Global Transaction Record
    payment.globalTransactionHistory.push({
      year,
      month,
      totalRentAmount: payment.rent.amount,
      totalWaterAmount: payment.waterBill.amount,
      totalGarbageFee: payment.garbageFee.amount,
      totalAmount: payment.totalAmountPaid,
      referenceNumber: referenceNo,
      globalDeficit: payment.globalDeficit, // Include global deficit
    });

    // Save the payment record
    await payment.save();

    return payment;
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
};
