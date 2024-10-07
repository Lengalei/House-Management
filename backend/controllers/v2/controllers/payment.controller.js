import Tenant from '../../../models/v2/models/v2Tenant.model.js';
import Payment from '../../../models/v2/models/v2Payment.model.js';
import mongoose from 'mongoose';
import { clearDeficitsForPreviousPayments } from '../../../utils/v2/utils/paymentHelper.js';

// Register initial rent payment and create a payment record
export const registerInitialRentPayment = async (req, res) => {
  const { tenantId, rentAmount, referenceNumber, paymentDate } = req.body;

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Record the initial rent payment and mark the tenant as active
    tenant.initialRentPaid = true;
    await tenant.save();

    // Create the first payment record
    const payment = new Payment({
      tenant: tenantId,
      year: paymentDate.getFullYear(),
      month: paymentDate.toLocaleString('default', { month: 'long' }),
      rent: {
        amount: rentAmount,
        paid: true,
        paymentDate: paymentDate,
        referenceNumber: referenceNumber,
      },
      totalAmountPaid: rentAmount,
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all payments for a specific tenant where any of the rent, water bill, or garbage fee is unpaid
export const getUnpaidTenantPayments = async (req, res) => {
  const { tenantId } = req.params; // Get the tenant ID from request parameters

  try {
    // Query to find payments with unpaid rent, water, or garbage fee
    const unpaidPayments = await Payment.find({
      tenant: tenantId,
      $or: [
        { 'rent.paid': false },
        { 'waterBill.paid': false },
        { 'garbageFee.paid': false },
      ],
    }).populate('tenant', 'name email houseDetails');

    // If no payments found, return a message
    if (unpaidPayments.length === 0) {
      return res.status(404).json({
        message: 'No unpaid payments found for this tenant.',
        unpaidPayments,
      });
    }

    // Return the unpaid payments along with tenant details
    res.status(200).json(unpaidPayments);
  } catch (error) {
    console.error('Error fetching unpaid tenant payments:', error); // Add error logging
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Get all payments for a specific tenant where rent, water, and garbage fee are fully paid
export const getFullyPaidTenantPayments = async (req, res) => {
  try {
    const { tenantId } = req.params; // Get the tenant ID from request parameters

    // Query to find payments where rent, water, and garbage fee are all fully paid
    const fullyPaidPayments = await Payment.find({
      tenant: tenantId, // Match the tenant by their ID
      isCleared: true,
    });

    // If no fully paid payments found, return a message
    if (fullyPaidPayments.length === 0) {
      return res.status(404).json({
        message: 'No fully paid payments found for this tenant.',
      });
    }

    // Return the fully paid payments
    return res.status(200).json(fullyPaidPayments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// Update Payment record
export const updatePayment = async (req, res) => {
  const { paymentId } = req.params;
  const {
    tenantId,
    year,
    month,
    paidWaterBill,
    accumulatedWaterBill,
    rentDeficit,
    waterDeficit: sentWaterDeficit,
    garbageDeficit,
    referenceNumber,
    date,
  } = req.body;

  try {
    // 1. Get payment record by tenant ID and month/year
    const payment = await Payment.findOne({
      _id: paymentId,
      tenant: tenantId,
      year,
      month,
    });
    const tenant = await Tenant.findById(tenantId);

    if (!payment || !tenant) {
      return res.status(404).json({ message: 'Payment or tenant not found' });
    }

    let overpay = payment.overpay || 0;
    console.log('overpayAtFirst: ', overpay);

    // Helper function to record excess history
    const recordExcessHistory = (amount, description) => {
      payment.excessHistory.push({
        initialOverpay: overpay,
        excessAmount: amount,
        description,
        date,
      });
    };

    //update the referenceNoHistory array history
    const paymentCount = payment.referenceNoHistory.length;
    payment.referenceNoHistory.push({
      date,
      previousRefNo: payment.referenceNumber,
      referenceNoUsed: referenceNumber,
      amount:
        parseFloat(rentDeficit) ||
        0 + parseFloat(paidWaterBill) ||
        0 + parseFloat(sentWaterDeficit) ||
        0 + parseFloat(garbageDeficit) ||
        0,
      description: `Payment record number of tinkering:#${paymentCount + 1}`,
    });
    payment.referenceNumber = referenceNumber;

    // 2. Process Rent Deficit
    const rentAmount = tenant.houseDetails.rent;
    const rentPaid = payment.rent.amount;
    let rentDeficitAmount = rentAmount - rentPaid;
    // Start by determining if there is a rent deficit
    if (rentDeficitAmount > 0) {
      // Apply the provided amount to clear the deficit
      if (rentDeficit >= rentDeficitAmount) {
        // Full payment of the deficit
        payment.rent.paid = true; // Mark the rent as fully paid
        payment.rent.deficit = 0; // No more deficit
        payment.rent.amount = rentAmount; // Rent amount is fully satisfied
        payment.rent.transactions.push({
          amount: rentDeficitAmount, // Record the full deficit amount paid
          referenceNumber,
          date,
        });
        payment.rent.deficitHistory.push({
          amount: 0,
          description: `Rent deficit of ${rentDeficitAmount} cleared`,
          date,
        });

        // Check if there's any remaining surplus after clearing the rent deficit
        const surplus = rentDeficit - rentDeficitAmount;
        if (surplus > 0) {
          // Add remaining amount to overpay
          overpay += surplus;
          recordExcessHistory(
            surplus,
            `Surplus added to overpay after full rent payment`
          );
        }
      } else {
        // Partial payment of the deficit
        payment.rent.paid = false; // Rent still unpaid (partially)
        payment.rent.deficit -= rentDeficit; // Reduce deficit by the paid amount
        payment.rent.amount += rentDeficit; // Increase rent amount by the paid amount
        payment.rent.transactions.push({
          amount: rentDeficit, // Record the partial amount paid
          referenceNumber,
          date,
        });
        payment.rent.deficitHistory.push({
          amount: rentDeficit, // Remaining deficit after partial payment
          description: `Partial rent deficit payment of ${rentDeficit} made`,
          date,
        });

        // After partial payment, check if there's an overpay and remaining deficit
        rentDeficitAmount = rentAmount - payment.rent.amount; // Recalculate the remaining deficit
        if (rentDeficitAmount > 0 && overpay > 0) {
          // Apply overpay to clear part or all of the remaining deficit
          const rentCover = Math.min(overpay, rentDeficitAmount);
          payment.rent.amount += rentCover; // Add overpay to the rent amount
          payment.rent.deficit -= rentCover; // Reduce the deficit by overpay
          overpay -= rentCover; // Reduce the overpay by the amount used
          payment.rent.transactions.push({
            amount: rentCover, // Record the overpay used to clear deficit
            referenceNumber: 'OVERPAY',
            date,
          });

          payment.excessHistory.push({
            initialOverpay: payment.overpay,
            excessAmount: overpay,
            description: `Overpay applied to cover rent deficit`,
            date,
          });
          payment.rent.deficitHistory.push({
            amount: payment.rent.deficit,
            description: `Rent deficit of ${rentCover} covered by overpay `,
            date,
          });
        }
      }
    } else {
      // No rent deficit, check if there's any overpayment to handle
      if (overpay > 0) {
        payment.excessHistory.push({
          initialOverpay: payment.overpay,
          excessAmount: overpay,
          description: `Overpay added as no rent deficit existed`,
          date,
        });
      }
    }

    //handle special water update
    if (Number(sentWaterDeficit) > 0) {
      // Use sentWaterDeficit to reduce the current deficit
      const coverageAmount = Math.min(
        sentWaterDeficit,
        payment.waterBill.deficit
      ); // Cover only the deficit amount
      // Subtract the covered amount from the deficit
      payment.waterBill.deficit -= coverageAmount;

      // Add the covered amount to waterBill.amount
      payment.waterBill.amount += coverageAmount;

      // Add a deficit history record
      payment.waterBill.deficitHistory.push({
        amount: payment.waterBill.deficit, // Updated deficit amount
        description: `Deficit of ${coverageAmount} covered from water bill`,
        date: date, // Current date
      });

      // Add a transaction record
      payment.waterBill.transactions.push({
        amount: coverageAmount, // The amount applied to the deficit
        referenceNumber: referenceNumber, // Custom reference for covering deficit
        date: date,
      });

      // Check if there is remaining sentWaterDeficit after covering the deficit
      const remainingDeficit = sentWaterDeficit - coverageAmount;
      if (remainingDeficit > 0) {
        // Add the remaining amount to overpay
        payment.overpay += remainingDeficit;

        // Add an excess history record
        payment.excessHistory.push({
          initialOverpay: payment.overpay,
          excessAmount: remainingDeficit,
          description: `Excess amount of ${remainingDeficit} from water bill payment added to overpay`,
          date: date, // Current date
        });
      }

      // Check if the waterBill.amount equals or exceeds accumulatedAmount
      if (payment.waterBill.amount >= payment.waterBill.accumulatedAmount) {
        // Mark the waterBill as fully paid
        payment.waterBill.paid = true;

        // Add a record indicating full payment in deficit history
        payment.waterBill.deficitHistory.push({
          amount: 0,
          description: 'Water bill fully paid after covering deficit',
          date: date,
        });
      }
    } else {
      // 3. Process Water Bill
      const previousWaterBillPaid = payment.waterBill.amount || 0;
      const previousAccumulatedAmount =
        payment.waterBill.accumulatedAmount || 0;
      if (paidWaterBill >= accumulatedWaterBill) {
        payment.waterBill.paid = true;
        payment.waterBill.deficit = 0;
        payment.waterBill.amount = previousWaterBillPaid + accumulatedWaterBill;
        payment.waterBill.accumulatedAmount =
          previousAccumulatedAmount + accumulatedWaterBill;
        payment.waterBill.transactions.push({
          amount: accumulatedWaterBill,
          referenceNumber,
          date,
        });
        payment.waterBill.deficitHistory.push({
          amount: 0,
          description: 'Water bill fully paid',
          date,
        });
        //surplus paid water bill
        let surplusPaidWaterBillAmount =
          parseFloat(paidWaterBill) - parseFloat(accumulatedWaterBill);
        if (surplusPaidWaterBillAmount > 0) {
          // Add remaining amount to overpay
          payment.excessHistory.push({
            initialOverpay: payment.overpay,
            excessAmount: surplusPaidWaterBillAmount,
            description: `Overpay applied to cover rent deficit`,
            date,
          });
          overpay += surplusPaidWaterBillAmount;
        }
      } else {
        const waterDeficit = accumulatedWaterBill - paidWaterBill;
        payment.waterBill.paid = false;
        payment.waterBill.deficit = waterDeficit;
        payment.waterBill.amount += paidWaterBill;
        payment.waterBill.accumulatedAmount =
          previousAccumulatedAmount + accumulatedWaterBill;
        payment.waterBill.transactions.push({
          amount: paidWaterBill,
          referenceNumber,
          date,
        });
        payment.waterBill.deficitHistory.push({
          amount: waterDeficit,
          description: `Partial water bill payment and deficit amount of ${waterDeficit} remained`,
          date,
        });

        if (waterDeficit > 0 && overpay > 0) {
          const waterCover = Math.min(overpay, waterDeficit);
          payment.waterBill.amount += waterCover;
          payment.waterBill.deficit -= waterCover;
          overpay -= waterCover;
          payment.overpay = overpay;
          payment.waterBill.transactions.push({
            amount: waterCover,
            referenceNumber: 'OVERPAY',
            date,
          });

          payment.excessHistory.push({
            initialOverpay: overpay + waterCover,
            excessAmount: overpay,
            description: `overpay amount used to cover for waterBill shortage for ${month} ${year}`,
            date,
          });

          // Check if the water deficit has been fully covered
          if (payment.waterBill.deficit === 0) {
            payment.waterBill.paid = true;
            payment.waterBill.deficitHistory.push({
              amount: 0,
              description: 'Water bill fully paid after overpay adjustment',
              date,
            });
          }
        }
      }
    }

    // 4. Process Garbage Fee
    const garbageFeeAmount = tenant.houseDetails.garbageFee;
    const garbagePaid = payment.garbageFee.amount;
    let garbageDeficitAmount = garbageFeeAmount - garbagePaid;

    // Start by determining if there is a garbage fee deficit
    if (garbageDeficitAmount > 0) {
      // Apply the provided amount to clear the deficit
      if (garbageDeficit >= garbageDeficitAmount) {
        // Full payment of the deficit
        payment.garbageFee.paid = true; // Mark the garbage fee as fully paid
        payment.garbageFee.deficit = 0; // No more deficit
        payment.garbageFee.amount = garbageFeeAmount; // Garbage fee is fully satisfied
        payment.garbageFee.transactions.push({
          amount: garbageDeficitAmount, // Record the full deficit amount paid
          referenceNumber,
          date,
        });
        payment.garbageFee.deficitHistory.push({
          amount: 0,
          description: `Garbage fee deficit of ${garbageDeficitAmount} cleared`,
          date,
        });

        // Check if there's any remaining surplus after clearing the garbage fee deficit
        const surplus = garbageDeficit - garbageDeficitAmount;
        if (surplus > 0) {
          // Add remaining amount to overpay
          overpay += surplus;
          payment.overpay = overpay;
          payment.excessHistory.push({
            initialOverpay: overpay - surplus,
            excessAmount: surplus,
            description: `Surplus added to overpay after full garbage fee payment`,
            date,
          });
        }
      } else {
        // Partial payment of the deficit
        payment.garbageFee.paid = false; // Garbage fee still unpaid (partially)
        payment.garbageFee.deficit -= garbageDeficit; // Reduce deficit by the paid amount
        payment.garbageFee.amount += garbageDeficit; // Increase garbage fee amount by the paid amount
        payment.garbageFee.transactions.push({
          amount: garbageDeficit, // Record the partial amount paid
          referenceNumber,
          date,
        });
        payment.garbageFee.deficitHistory.push({
          amount: garbageDeficit, // Remaining deficit after partial payment
          description: `Partial garbage fee deficit payment of ${garbageDeficit} made`,
          date,
        });

        // After partial payment, check if there's an overpay and remaining deficit
        garbageDeficitAmount = garbageFeeAmount - payment.garbageFee.amount; // Recalculate the remaining deficit
        if (garbageDeficitAmount > 0 && overpay > 0) {
          // Apply overpay to clear part or all of the remaining deficit
          const garbageCover = Math.min(overpay, garbageDeficitAmount);
          payment.garbageFee.amount += garbageCover; // Add overpay to the garbage fee amount
          payment.garbageFee.deficit -= garbageCover; // Reduce the deficit by overpay
          overpay -= garbageCover; // Reduce the overpay by the amount used
          payment.overpay = overpay; // Update the remaining overpay
          payment.garbageFee.transactions.push({
            amount: garbageCover, // Record the overpay used to clear the deficit
            referenceNumber: 'OVERPAY',
            date,
          });

          payment.excessHistory.push({
            initialOverpay: overpay + garbageCover,
            excessAmount: overpay,
            description: `Overpay applied to cover garbage fee deficit`,
            date,
          });

          payment.garbageFee.deficitHistory.push({
            amount: payment.garbageFee.deficit,
            description: `Garbage fee deficit of ${garbageCover} covered by overpay`,
            date,
          });
        }
      }
    } else {
      // No garbage fee deficit, check if there's any overpayment to handle
      if (overpay > 0) {
        payment.excessHistory.push({
          initialOverpay: payment.overpay,
          excessAmount: overpay,
          description: `Overpay added as no garbage fee deficit existed`,
          date,
        });
      }
    }

    payment.overpay = overpay;

    // 5. Update globalDeficit
    const updatedGlobalDeficit =
      payment.rent.deficit +
      payment.waterBill.deficit +
      payment.garbageFee.deficit;
    payment.globalDeficit = updatedGlobalDeficit;

    // Add record to globalDeficitHistory
    payment.globalDeficitHistory.push({
      year,
      month,
      totalDeficitAmount: updatedGlobalDeficit,
      description: 'Updated global deficit after payment adjustments',
    });

    // 6. Add Global Transaction History
    const totalAmount =
      payment.rent.amount +
      payment.waterBill.amount +
      payment.garbageFee.amount;
    payment.globalTransactionHistory.push({
      year,
      month,
      totalRentAmount: payment.rent.amount,
      totalWaterAmount: payment.waterBill.amount,
      totalGarbageFee: payment.garbageFee.amount,
      totalAmount,
      referenceNumber,
      globalDeficit: payment.globalDeficit,
    });

    payment.totalAmountPaid = totalAmount;

    payment.isCleared =
      payment.rent.amount >= tenant.houseDetails.rent &&
      payment.waterBill.amount >= payment.waterBill.accumulatedAmount &&
      payment.garbageFee.amount >= tenant.houseDetails.garbageFee &&
      payment.extraCharges.amount >= payment.extraCharges.expected;
    // Save payment
    await payment.save();

    if (payment.overpay > 0) {
      //find the most recent payment to as to add their overpay value and deduct any deficit that may arise
      const remainigAmount = await clearDeficitsForPreviousPayments(
        tenantId,
        overpay,
        date,
        referenceNumber
      );

      payment.excessHistory.push({
        initialOverpay: payment.overpay,
        excessAmount: remainigAmount,
        description: `Amount remaining after forwading the overpay to other payments`,
        date,
      });

      payment.overpay = remainigAmount;
      await payment.save();
    }

    return res
      .status(200)
      .json({ message: 'Payment updated successfully', payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(500).json({ message: 'Error updating payment' });
  }
};

//monthly payment processing
export const monthlyPayProcessing = async (req, res) => {
  const {
    tenantId,
    newMonthlyAmount,
    referenceNumber: referenceNo,
    newPaymentDate,
    extraCharges: frontendExtraCharges,
    previousMonthExtraCharges,
    month,
    year,
    previousAccumulatedWaterBill: accumulatedWaterBill,
  } = req.body;

  try {
    let amount = newMonthlyAmount;
    const depositDate = new Date(newPaymentDate);
    // Convert month name to previous month
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1) throw new Error('Invalid month name');

    const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;

    // Fetch previous payment record for the tenant
    const previousPayment = await Payment.findOne({
      tenant: tenantId,
      year: prevYear,
      month: months[prevMonth],
    });

    if (!previousPayment) {
      return res.status(404).json({
        message: 'No payment record found for this tenant.',
      });
    }

    let previousMonthExtraChargesExpectedAmount = parseFloat(
      previousMonthExtraCharges?.expectedAmount <= 0
        ? 0
        : previousMonthExtraCharges?.expectedAmount
    );
    let previousMonthDescription = previousMonthExtraCharges.description;

    // Handle previous month water bill with new accumulated amount logic
    if (parseFloat(accumulatedWaterBill) > 0) {
      // Set the accumulatedAmount with the value we get from the frontend
      previousPayment.waterBill.accumulatedAmount =
        parseFloat(accumulatedWaterBill) || 0;

      // Add the accumulated water bill as a transaction
      previousPayment.waterBill.transactions.push({
        amount: 0,
        accumulatedAmount: parseFloat(accumulatedWaterBill) || 0,
        date: depositDate,
        referenceNumber: referenceNo,
        description: 'Accumulated water bill recorded',
      });

      const remainingWaterDeficit = parseFloat(accumulatedWaterBill);
      previousPayment.waterBill.deficit += remainingWaterDeficit;
      // Add a deficit transaction history
      previousPayment.waterBill.deficitHistory.push({
        amount: remainingWaterDeficit,
        date: depositDate,
        description: 'Water bill deficit recorded',
      });

      //update the global record
      previousPayment.globalDeficitHistory.push({
        year: Number(previousPayment.year),
        month: previousPayment.month,
        totalDeficitAmount:
          parseFloat(previousPayment?.globalDeficit || 0) +
          parseFloat(remainingWaterDeficit || 0),
        description: `Just added the water deficit to be cleared by the helper function`,
      });
      previousPayment.globalDeficit =
        parseFloat(previousPayment.globalDeficit) +
        parseFloat(previousPayment.waterBill.deficit);

      previousPayment.globalTransactionHistory.push({
        year: previousPayment.year,
        month: previousPayment.month,
        totalRentAmount: parseFloat(previousPayment.rent.amount),
        totalWaterAmount: parseFloat(previousPayment.waterBill.amount),
        totalGarbageFee: parseFloat(previousPayment.garbageFee.amount),
        totalAmount: parseFloat(previousPayment.totalAmountPaid),
        referenceNumber: referenceNo,
        globalDeficit:
          parseFloat(previousPayment.globalDeficit) +
          parseFloat(remainingWaterDeficit),
      });
      // Water bill not fully paid
      previousPayment.waterBill.paid = false;
    }

    //handle previous month extra charges
    if (previousMonthExtraChargesExpectedAmount > 0) {
      // Set the extraCharges ExpectedAmount with the value we get from the frontend
      previousPayment.extraCharges.expected =
        previousMonthExtraChargesExpectedAmount;
      previousPayment.extraCharges.description = previousMonthDescription;

      // Add the extraCharges expected transaction
      previousPayment.extraCharges.transactions.push({
        amount: 0,
        expected: previousMonthExtraChargesExpectedAmount,
        date: depositDate,
        referenceNumber: referenceNo,
        previousMonthDescription,
      });

      const extraChargesDeficit = previousMonthExtraChargesExpectedAmount;
      previousPayment.extraCharges.deficit += extraChargesDeficit;

      // Add a deficit transaction history
      previousPayment.extraCharges.deficitHistory.push({
        amount: extraChargesDeficit,
        date: depositDate,
        description: 'ExtraCharges bill deficit recorded',
      });

      //update the global record
      previousPayment.globalDeficitHistory.push({
        year: Number(previousPayment.year),
        month: previousPayment.month,
        totalDeficitAmount:
          parseFloat(previousPayment?.globalDeficit || 0) +
          parseFloat(extraChargesDeficit || 0),
        description: `Just added the extraCharges deficit to be cleared by the helper function`,
      });
      previousPayment.globalDeficit =
        parseFloat(previousPayment.globalDeficit) +
        parseFloat(previousPayment.waterBill.deficit);

      previousPayment.globalTransactionHistory.push({
        year: Number(previousPayment.year),
        month: previousPayment.month,
        totalRentAmount: parseFloat(previousPayment.rent.amount),
        totalWaterAmount: parseFloat(previousPayment.waterBill.amount),
        totalGarbageFee: parseFloat(previousPayment.garbageFee.amount),
        totalAmount: parseFloat(previousPayment.totalAmountPaid),
        referenceNumber: referenceNo,
        globalDeficit:
          parseFloat(previousPayment.globalDeficit) +
          parseFloat(extraChargesDeficit),
      });

      // ExtraCharges not fully paid
      previousPayment.extraCharges.paid = false;
    }
    if (
      parseFloat(accumulatedWaterBill) > 0 ||
      previousMonthExtraChargesExpectedAmount > 0
    ) {
      previousPayment.isCleared = false;
    }
    // Save the updated payment record
    await previousPayment.save();
    // console.log('updatePreviousPayment: ', previousPayment);

    //handle previous payment deficits
    const remainingAmount = await clearDeficitsForPreviousPayments(
      tenantId,
      amount,
      depositDate,
      referenceNo,
      month,
      year
    );
    amount = parseFloat(remainingAmount);
    console.log('amountAfterPreviousDeficitHandling: ', amount);

    // Ensure depositDate is a Date objectn
    const dateObject = new Date(depositDate);
    if (isNaN(dateObject.getTime())) {
      throw new Error('Invalid depositDate');
    }

    let extraChargesExpectedAmount = parseFloat(
      frontendExtraCharges?.expectedAmount <= 0
        ? 0
        : frontendExtraCharges?.expectedAmount
    );
    let description = frontendExtraCharges.description;
    let extraChargesPaidAmount =
      parseFloat(frontendExtraCharges.paidAmount) || 0;

    // Add previous month's overpay to the current excess
    let excess = parseFloat(amount);
    // console.log('excessAmountPriorTOCurrentMonthHandling: ', excess);

    // Fetch tenant data
    const tenant = await Tenant.findById(tenantId).populate('houseDetails');
    if (!tenant) throw new Error('Tenant not found');

    const rentAmount = parseFloat(tenant.houseDetails.rent);
    const garbageFeeAmount = parseFloat(tenant.houseDetails.garbageFee);

    // Initialize the payment record
    let payment = await Payment.findOne({ tenant: tenantId, year, month });
    if (!payment) {
      payment = new Payment({
        tenant: tenantId,
        year,
        month,
        rent: {
          amount: 0,
          transactions: [],
          paid: false,
          deficit: 0,
          deficitHistory: [],
        },
        garbageFee: {
          amount: 0,
          transactions: [],
          paid: false,
          deficit: 0,
          deficitHistory: [],
        },
        extraCharges: {
          description: description,
          expected: 0,
          amount: 0,
          deficit: 0,
          transactions: [],
          deficitHistory: [],
          paid: false,
        },
        overpay: 0,
        totalAmountPaid: 0,
        globalTransactionHistory: [],
        excessHistory: [],
        globalDeficit: 0,
        globalDeficitHistory: [],
      });
    }

    const paymentCount = payment.referenceNoHistory.length;
    payment.referenceNoHistory.push({
      date: depositDate,
      previousRefNo: payment.referenceNumber,
      referenceNoUsed: referenceNo,
      amount: excess,
      description: `Payment record number of tinkering:#${
        paymentCount + 1
      } doneIn monthProcessingFunc`,
    });

    payment.referenceNumber = referenceNo; // Set the new reference number used

    // Handle Rent Payment
    const currentRentAmount = parseFloat(payment.rent.amount);
    const rentDue = Math.max(rentAmount - currentRentAmount, 0);
    const rentPayment = Math.min(excess, rentDue);

    payment.rent.transactions.push({
      amount: parseFloat(rentPayment.toFixed(2)),
      referenceNumber: referenceNo,
      date: dateObject,
    });

    payment.rent.amount = parseFloat(
      (currentRentAmount + rentPayment).toFixed(2)
    );
    payment.rent.paid = payment.rent.amount >= rentAmount;

    // Deduct rent payment from excess
    excess = parseFloat(excess) - parseFloat(rentPayment);

    // Handle Rent Deficit
    const rentDeficit = rentAmount - payment.rent.amount;
    if (rentDeficit > 0) {
      payment.rent.deficit = parseFloat(rentDeficit.toFixed(2));
      payment.rent.deficitHistory.push({
        amount: rentDeficit,
        description: `Deficit in rent payment for ${month} ${year}`,
        date: dateObject,
      });
    }

    // Handle Garbage Fee Payment
    const currentGarbageAmount = parseFloat(payment.garbageFee.amount);
    const garbageDue = Math.max(garbageFeeAmount - currentGarbageAmount, 0);
    const garbagePayment = Math.min(excess, garbageDue);

    if (garbagePayment > 0) {
      payment.garbageFee.transactions.push({
        amount: parseFloat(garbagePayment.toFixed(2)),
        referenceNumber: referenceNo,
        date: dateObject,
      });
    }

    payment.garbageFee.amount = parseFloat(
      (currentGarbageAmount + garbagePayment).toFixed(2)
    );
    payment.garbageFee.paid = payment.garbageFee.amount >= garbageFeeAmount;

    // Handle Garbage Deficit
    const garbageDeficit = garbageFeeAmount - payment.garbageFee.amount;
    if (garbageDeficit > 0) {
      payment.garbageFee.deficit = parseFloat(garbageDeficit.toFixed(2));
      payment.garbageFee.deficitHistory.push({
        amount: garbageDeficit,
        description: `Deficit in garbage fee payment for ${month} ${year}`,
        date: dateObject,
      });
    }

    // Deduct garbage payment from excess
    excess = parseFloat(excess) - parseFloat(garbagePayment);

    // Record the excess in overpay and excessHistory field before handling extraCharges
    if (excess > 0) {
      payment.excessHistory.push({
        initialOverpay: payment.overpay,
        excessAmount: parseFloat(excess),
        description: `Excess payment from extra charges for ${month} ${year} prior to handling the extra charges`,
        date: dateObject,
      });
      payment.overpay = parseFloat(payment.overpay) + parseFloat(excess);
    }

    // Handle Extra Charges
    payment.extraCharges.expected = extraChargesExpectedAmount;

    // Record initial extra charges amount
    payment.extraCharges.transactions.push({
      amount: extraChargesPaidAmount || 0,
      expected: extraChargesExpectedAmount || 0,
      referenceNumber: referenceNo,
      date: dateObject,
      description,
    });

    payment.extraCharges.amount = extraChargesPaidAmount;

    // First, cover any deficits in extra charges
    let extraDeficit = extraChargesExpectedAmount - extraChargesPaidAmount;

    // Use excess to cover extra charges deficit
    const deficitCoverage = Math.min(excess, extraDeficit);
    if (deficitCoverage > 0) {
      payment.extraCharges.transactions.push({
        amount: extraChargesPaidAmount,
        referenceNumber: referenceNo,
        date: dateObject,
      });
      payment.extraCharges.amount += parseFloat(deficitCoverage.toFixed(2));
      extraDeficit = parseFloat((extraDeficit - deficitCoverage).toFixed(2));
      excess = parseFloat(excess) - parseFloat(deficitCoverage);

      payment.extraCharges.deficitHistory.push({
        amount: deficitCoverage,
        description: `Covered deficit of extra charges using overpay for ${month} ${year}`,
        date: dateObject,
      });
    }

    // Record the new value of extra charges amount
    if (extraChargesPaidAmount !== payment.extraCharges.amount) {
      payment.extraCharges.transactions.push({
        amount: payment.extraCharges.amount,
        expected: payment.extraCharges.expected,
        referenceNumber: referenceNo,
        date: dateObject,
        description,
      });
    }

    payment.extraCharges.deficit = extraDeficit;

    // If all extra charges are paid and there's no deficit
    if (extraDeficit <= 0) {
      payment.extraCharges.paid = true;
      payment.extraCharges.deficitHistory.push({
        amount: 0,
        description: `Extra Charges Deficit fully covered for by the excess amount for ${month} ${year}`,
        date: dateObject,
      });
      if (excess > 0) {
        payment.excessHistory.push({
          initialOverpay: payment.overpay,
          excessAmount: parseFloat(excess),
          description: `Excess payment from extra charges for ${month} ${year}`,
          date: dateObject,
        });
        payment.overpay = parseFloat(excess.toFixed(2));
      }
    } else {
      // If extra charges are partially paid, record deficit
      payment.extraCharges.deficitHistory.push({
        amount: extraDeficit,
        description: `Remaining deficit of extra charges for ${month} ${year}`,
        date: dateObject,
      });
      payment.excessHistory.push({
        initialOverpay: payment.overpay,
        excessAmount: 0,
        description: `Excess payment from extra charges for ${month} ${year}`,
        date: dateObject,
      });
      payment.overpay = parseFloat(excess.toFixed(2));
    }

    // Update total amount paid
    payment.totalAmountPaid = parseFloat(
      (
        payment.rent.amount +
        payment.garbageFee.amount +
        payment.extraCharges.amount
      ).toFixed(2)
    );

    // Handle Global Deficit (Sum of all Deficits: rent + garbage + extraCharges)
    let globalDeficit =
      parseFloat(rentDeficit) +
      parseFloat(garbageDeficit) +
      parseFloat(extraDeficit.toFixed(2));
    if (globalDeficit > 0) {
      payment.globalDeficit = parseFloat(globalDeficit.toFixed(2));
      payment.globalDeficitHistory.push({
        year,
        month,
        totalDeficitAmount: payment.globalDeficit,
        description: `Global Deficit for the month of ${month} ${year}`,
      });
    }

    // Add global transaction history record
    payment.globalTransactionHistory.push({
      year,
      month,
      totalRentAmount: payment.rent.amount,
      totalWaterAmount: 0,
      totalGarbageFee: payment.garbageFee.amount,
      totalAmount: payment.totalAmountPaid,
      referenceNumber: referenceNo,
      globalDeficit: payment.globalDeficit,
    });

    await payment.save();
    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all payments grouped by tenantIdl
export const getGroupedPaymentsByTenant = async (req, res) => {
  try {
    const groupedPayments = await Payment.aggregate([
      {
        $group: {
          _id: '$tenant', // Group by tenant ID
          totalPayments: { $sum: '$totalAmountPaid' }, // Sum the total payments for each tenant
          payments: { $push: '$$ROOT' }, // Push all payment documents for each tenant
        },
      },
      {
        $lookup: {
          from: 'v2tenants', // Join with the Tenant collection
          localField: '_id', // Match the tenant ID from Payment
          foreignField: '_id', // Match the tenant ID from Tenant
          as: 'tenant', // Store the joined tenant data
        },
      },
      {
        $unwind: '$tenant', // Unwind the tenant array to have a single tenant object
      },
      {
        $project: {
          _id: 1,
          totalPayments: 1,
          payments: {
            _id: 1,
            tenant: 1,
            year: 1,
            month: 1,
            referenceNumber: 1,
            overpay: 1,
            rent: {
              amount: 1,
              paid: 1,
              deficit: 1,
            },
            waterBill: {
              amount: 1,
              accumulatedAmount: 1,
              paid: 1,
              deficit: 1,
            },
            garbageFee: {
              amount: 1,
              paid: 1,
              deficit: 1,
            },
            extraCharges: {
              description: 1,
              expected: 1,
              amount: 1,
              paid: 1,
              deficit: 1,
            },
            totalAmountPaid: 1,
            globalTransactionHistory: 1,
            excessHistory: 1,
            globalDeficit: 1,
            globalDeficitHistory: 1,
            createdAt: 1,
          },
          tenant: {
            _id: 1,
            name: 1, // Project only the required tenant fields
            email: 1,
            phoneNo: 1,
            'houseDetails.houseNo': 1, // Access houseNo from houseDetails
          },
        },
      },
    ]);

    res.status(200).json(groupedPayments); // Return the grouped payments as JSON
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get detailed payments for a specific tenant
export const getPaymentsByTenantId = async (req, res) => {
  const { tenant } = req.params;
  try {
    const payments = await Payment.find({ tenant: tenant })
      .populate({
        path: 'tenant',
        select: 'name email houseDetails.houseNo', // Specify fields to include from the tenant
      })
      .sort({ date: -1 });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all rents paid and group by year and month
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
      const year = payment.year;
      const rent = parseFloat(payment.rent.amount) || 0; // Ensure rent amount is a number

      if (!acc[year]) {
        acc[year] = {
          totalRent: 0,
          months: {},
        };
      }

      // Add the rent to the total for that year
      acc[year].totalRent += rent;

      // Get the month
      const month = payment.month;

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
    console.error('Error fetching total rent for all payments:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller to get all water payment records
export const getAllWaterRecords = async (req, res) => {
  try {
    const waterPayments = await Payment.find({
      'waterBill.amount': { $gt: 0 },
    });

    if (!waterPayments || waterPayments.length === 0) {
      return res.status(400).json({ message: 'No water payments made yet' });
    }

    const groupedByYear = waterPayments.reduce((acc, payment) => {
      const year = payment.year;
      const amount = payment.waterBill.amount || 0;

      if (!acc[year]) {
        acc[year] = {
          totalAmount: 0,
          months: {},
        };
      }

      acc[year].totalAmount += amount;

      const month = payment?.month;

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
    const garbagePayments = await Payment.find({
      'garbageFee.amount': { $gt: 0 },
    });

    if (!garbagePayments || garbagePayments.length === 0) {
      return res.status(400).json({ message: 'No garbage payments made yet' });
    }

    const groupedByYear = garbagePayments.reduce((acc, payment) => {
      const year = payment?.year;
      const amount = payment.garbageFee.amount || 0;

      if (!acc[year]) {
        acc[year] = {
          totalAmount: 0,
          months: {},
        };
      }

      acc[year].totalAmount += amount;

      const month = payment?.month;

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
      const amount = parseFloat(payment.totalAmountPaid);
      if (!isNaN(amount)) {
        return total + amount;
      }
      return total;
    }, 0);
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
    // Fetch the tenant details
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found.' });
    }

    // Check if the tenant has an onEntryOverPay value
    const onEntryOverPay = tenant.overPay > 0 ? tenant.overPay : null;

    // Find payments by tenantId and populate tenant's email, name, and phoneNo
    const payments = await Payment.find({ tenant: tenantId })
      .sort({ date: -1 })
      .populate('tenant', 'email name phoneNo');

    // Calculate total amount paid
    const totalAmountPaid = payments.reduce(
      (total, payment) => total + payment.totalAmountPaid,
      0
    );

    // Create the tenant object with totalAmountPaid included
    let foundTenant = {
      name: tenant.name,
      email: tenant.email,
      phoneNo: tenant.phoneNo,
      houseDetails: tenant.houseDetails,
      totalAmountPaid,
    };

    // Send response with payments, onEntryOverPay, and the tenant object
    res.status(200).json({
      payments,
      onEntryOverPay,
      tenant: foundTenant,
    });
  } catch (err) {
    console.error('Error fetching payments for tenant:', err);
    res.status(500).json({ message: err.message });
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

//given extra amount within a month
export const ExtraAmountGivenInAmonth = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const {
      currentYear,
      nextMonth,
      extraAmountProvided,
      extraAmountReferenceNo,
      extraAmountGivenDate,
    } = req.body;

    // Fetch the payment details using paymentId, year, and month
    let payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Fetch tenant's house details (rent, garbage fee, etc.)
    let tenant = await Tenant.findById(payment.tenant);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    let remainingAmount = parseFloat(extraAmountProvided);

    // ----- Rent Deficit Handling -----
    if (payment.rent.amount < tenant.houseDetails.rent) {
      let rentDeficit = tenant.houseDetails.rent - payment.rent.amount;

      // If there's a rent deficit, clear it using the provided amount
      let amountToClear = Math.min(rentDeficit, remainingAmount);
      payment.rent.amount += amountToClear;
      payment.rent.paid = payment.rent.amount === tenant.houseDetails.rent;

      // Record rent transaction history
      payment.rent.transactions.push({
        amount: amountToClear,
        date: extraAmountGivenDate,
        referenceNumber: extraAmountReferenceNo,
      });

      // Update rent deficit
      if (rentDeficit > 0) {
        rentDeficit -= amountToClear;
        payment.rent.deficit = rentDeficit;
        payment.rent.deficitHistory.push({
          amount: rentDeficit,
          date: extraAmountGivenDate,
          description: `Rent deficit of ${rentDeficit} remains`,
        });
      } else {
        rentDeficit -= amountToClear;
        payment.rent.deficit = 0;
        payment.rent.deficitHistory.push({
          amount: 0,
          date: extraAmountGivenDate,
          description: 'Rent deficit fully cleared',
        });
      }

      remainingAmount -= amountToClear;
    }

    // ------water deficit handling ----
    if (remainingAmount > 0 && payment.waterBill.deficit > 0) {
      let waterBillDeficit =
        payment.waterBill.accumulatedAmount - payment.waterBill.amount;

      // Clear water Deficit  using remaining amount
      let amountToClear = Math.min(waterBillDeficit, remainingAmount);
      payment.waterBill.amount += amountToClear;
      payment.waterBill.paid =
        payment.waterBill.amount >= payment.waterBill.accumulatedAmount;

      // Record waterBill  transaction
      payment.waterBill.transactions.push({
        amount: amountToClear,
        date: extraAmountGivenDate,
        referenceNumber: extraAmountReferenceNo,
      });

      // Update waterBill deficit
      if (waterBillDeficit > 0) {
        waterBillDeficit -= amountToClear;
        payment.waterBill.deficit = waterBillDeficit;
        payment.waterBill.deficitHistory.push({
          amount: waterBillDeficit,
          date: extraAmountGivenDate,
          description: `waterBill deficit of ${waterBillDeficit} remains`,
        });
      } else {
        waterBillDeficit -= amountToClear;
        payment.waterBill.deficit = 0;
        payment.waterBill.deficitHistory.push({
          amount: 0,
          date: extraAmountGivenDate,
          description: 'waterBill fully cleared',
        });
      }

      remainingAmount -= amountToClear;
    }

    // ----- Garbage Fee Deficit Handling -----
    if (
      remainingAmount > 0 &&
      payment.garbageFee.amount < tenant.houseDetails.garbageFee
    ) {
      let garbageDeficit =
        tenant.houseDetails.garbageFee - payment.garbageFee.amount;

      // Clear garbage fee using remaining amount
      let amountToClear = Math.min(garbageDeficit, remainingAmount);
      payment.garbageFee.amount += amountToClear;
      payment.garbageFee.paid =
        payment.garbageFee.amount === tenant.houseDetails.garbageFee;

      // Record garbage fee transaction
      payment.garbageFee.transactions.push({
        amount: amountToClear,
        date: extraAmountGivenDate,
        referenceNumber: extraAmountReferenceNo,
      });

      // Update garbage deficit
      if (garbageDeficit > 0) {
        garbageDeficit -= amountToClear;
        payment.garbageFee.deficit = garbageDeficit;
        payment.garbageFee.deficitHistory.push({
          amount: garbageDeficit,
          date: extraAmountGivenDate,
          description: `Garbage fee deficit of ${garbageDeficit} remains`,
        });
      } else {
        garbageDeficit -= amountToClear;
        payment.garbageFee.deficit = 0;
        payment.garbageFee.deficitHistory.push({
          amount: 0,
          date: extraAmountGivenDate,
          description: 'Garbage fee fully cleared',
        });
      }

      remainingAmount -= amountToClear;
    }

    // ----- Extra Charges Deficit Handling -----
    if (
      remainingAmount > 0 &&
      payment.extraCharges.amount < payment.extraCharges.expected
    ) {
      let extraChargesDeficit =
        payment.extraCharges.expected - payment.extraCharges.amount;

      // Clear extra charges using remaining amount
      let amountToClear = Math.min(extraChargesDeficit, remainingAmount);
      payment.extraCharges.amount += amountToClear;
      payment.extraCharges.paid =
        payment.extraCharges.amount === payment.extraCharges.expected;

      // Record extra charges transaction
      payment.extraCharges.transactions.push({
        amount: amountToClear,
        date: extraAmountGivenDate,
        referenceNumber: extraAmountReferenceNo,
      });

      // Update extra charges deficit
      extraChargesDeficit -= amountToClear;
      payment.extraCharges.deficit = extraChargesDeficit;
      payment.extraCharges.deficitHistory.push({
        amount: extraChargesDeficit,
        date: extraAmountGivenDate,
        description:
          extraChargesDeficit > 0
            ? `Extra charges deficit of ${extraChargesDeficit} remains`
            : 'Extra charges fully cleared',
      });

      remainingAmount -= amountToClear;
    }

    // ----- Handle Overpay -----
    if (remainingAmount > 0) {
      payment.overpay += remainingAmount;
      payment.excessHistory.push({
        initialOverpay: payment.overpay - remainingAmount,
        excessAmount: payment.overpay,
        description: `Excess payment of ${remainingAmount} added`,
        date: extraAmountGivenDate,
      });
    }

    // ----- Global Deficit Update -----
    payment.globalDeficit =
      payment.rent.deficit +
      payment.garbageFee.deficit +
      payment.extraCharges.deficit;
    payment.globalDeficitHistory.push({
      year: currentYear,
      month: nextMonth,
      totalDeficitAmount: payment.globalDeficit,
      description: `Updated global deficit after payment adjustments`,
    });

    // ----- Global Transaction History -----
    payment.globalTransactionHistory.push({
      year: currentYear,
      month: nextMonth,
      totalRentAmount: payment.rent.amount,
      totalWaterAmount: payment.waterBill.amount,
      totalGarbageFee: payment.garbageFee.amount,
      totalAmount:
        payment.rent.amount +
        payment.waterBill.amount +
        payment.garbageFee.amount,
      referenceNumber: extraAmountReferenceNo,
      globalDeficit: payment.globalDeficit,
    });

    //update the referenceNoHistory array history
    const paymentCount = payment.referenceNoHistory.length;
    payment.referenceNoHistory.push({
      date: extraAmountGivenDate,
      previousRefNo: payment.referenceNumber,
      referenceNoUsed: extraAmountReferenceNo,
      amount: parseFloat(extraAmountProvided) || 0,
      description: `Payment record number of tinkering:#${paymentCount + 1}`,
    });
    payment.referenceNumber = extraAmountReferenceNo;

    payment.isCleared =
      payment.rent.paid &&
      payment.waterBill.amount >= payment.waterBill.accumulatedAmount &&
      payment.garbageFee.paid &&
      payment.extraCharges.amount >= payment.extraCharges.expected;
    // Save updated payment
    await payment.save();

    res.status(200).json({ message: 'Payment updated successfully', payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// Controller function to fetch current month's payment details grouped by tenant
//not sure if we are going to use this for now(was for the cron job)
export const getTenantPaymentsForCurrentMonth = async (req, res) => {
  try {
    const currentMonth = new Date().toLocaleString('default', {
      month: 'long',
    }); // Current month name (e.g., September)
    const tenants = await Tenant.find({}); // Fetch all tenants

    // Array to store final tenant payment details
    let tenantPayments = [];

    // Iterate through each tenant
    for (let tenant of tenants) {
      // Find payments made by this tenant for the current month
      const payments = await Payment.find({
        tenant: tenant._id,
        month: currentMonth,
      });

      if (payments.length > 0) {
        // Tenant has made payments for this month
        const paymentRecord = payments[0]; // Assuming one payment per month

        tenantPayments.push({
          tenantName: tenant.name,
          rentPaid: paymentRecord.rent.paid,
          waterBillPaid: paymentRecord.waterBill.paid,
          garbageFeePaid: paymentRecord.garbageFee.paid,
          overpay: paymentRecord.overpay || 0, // Default to 0 if no overpay
          isCleared: true, // Payment found, hence cleared
        });
      } else {
        // No payments for this tenant this month
        tenantPayments.push({
          tenantName: tenant.name,
          rentPaid: false,
          waterBillPaid: false,
          garbageFeePaid: false,
          overpay: 0,
          isCleared: false, // No payment found for this month
        });
      }
    }

    // Send the tenant payments array as the response
    res.status(200).json(tenantPayments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve tenant payments' });
  }
};

//update Payment Deficit
export const updatePaymentDeficit = async (req, res) => {
  const { paymentId } = req.params;
  const {
    updatedRentDeficit,
    updatedWaterDeficit,
    updatedAccumulatedWaterBill,
    updatedGarbageDeficit,
    updatedReferenceNumber,
    updatedExtraCharges,
  } = req.body;

  try {
    if (
      updatedRentDeficit < 0 ||
      updatedWaterDeficit < 0 ||
      updatedAccumulatedWaterBill < 0 ||
      updatedGarbageDeficit < 0 ||
      !updatedReferenceNumber ||
      updatedExtraCharges < 0
    ) {
      return res.status(400).json({
        message:
          'All fields must be filled and deficits should not be negative!',
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(400).json({ message: 'No Such payment found' });
    }

    //update rent deficit value
    if (
      parseFloat(updatedRentDeficit) >= 0 &&
      parseFloat(updatedRentDeficit) != parseFloat(payment.rent.deficit)
    ) {
      payment.rent.deficitHistory.push({
        amount: updatedRentDeficit,
        date: new Date(),
        description: `Updated rent Deficit amount from ${payment.rent.deficit}`,
      });
      payment.rent.deficit = updatedRentDeficit;
    }

    //update water deficit value
    if (
      parseFloat(updatedWaterDeficit) >= 0 &&
      parseFloat(updatedWaterDeficit) != parseFloat(payment.waterBill.deficit)
    ) {
      payment.waterBill.deficitHistory.push({
        amount: updatedWaterDeficit,
        date: new Date(),
        description: `Updated water Deficit amount from ${payment.waterBill.deficit}`,
      });
      payment.waterBill.deficit = updatedWaterDeficit;
    }

    //special water handling
    if (
      parseFloat(updatedAccumulatedWaterBill) >= 0 &&
      parseFloat(updatedAccumulatedWaterBill) !=
        parseFloat(payment.waterBill.accumulatedAmount)
    ) {
      payment.waterBill.transactions.push({
        amount: payment.waterBill.amount,
        accumulatedAmount: updatedAccumulatedWaterBill,
        date: new Date(),
        referenceNumber: updatedReferenceNumber,
        description: `Updated water Accumulated amount from ${payment.waterBill.accumulatedAmount}`,
      });
      payment.waterBill.accumulatedAmount = updatedAccumulatedWaterBill;
      let waterCoverage =
        payment.waterBill.accumulatedAmount - payment.waterBill.amount;

      payment.waterBill.deficitHistory.push({
        amount: waterCoverage,
        date: new Date(),
        description: `Updated water Deficit amount from ${payment.waterBill.deficit}`,
      });
      payment.waterBill.deficit = waterCoverage;
    }

    //update garbage deficit value
    if (
      parseFloat(updatedGarbageDeficit) >= 0 &&
      parseFloat(updatedGarbageDeficit) !=
        parseFloat(payment.garbageFee.deficit)
    ) {
      payment.garbageFee.deficitHistory.push({
        amount: updatedGarbageDeficit,
        date: new Date(),
        description: `Updated Garbage Deficit amount from ${payment.garbageFee.deficit}`,
      });
      payment.garbageFee.deficit = updatedGarbageDeficit;
    }

    //update reference number
    if (
      updatedReferenceNumber &&
      updatedReferenceNumber !== payment.referenceNumber
    ) {
      const paymentCount = payment.referenceNoHistory.length;
      payment.referenceNoHistory.push({
        date: new Date(),
        previousRefNo: payment.referenceNumber,
        referenceNoUsed: updatedReferenceNumber,
        amount:
          parseFloat(updatedRentDeficit) +
          parseFloat(updatedWaterDeficit) +
          parseFloat(updatedAccumulatedWaterBill) +
          parseFloat(updatedGarbageDeficit),
        description: `Reference Number changed. Payment record number of tinkering:#${
          paymentCount + 1
        }`,
      });
      payment.referenceNumber = updatedReferenceNumber;
    }

    //update extra charges deficit
    if (
      parseFloat(updatedExtraCharges) >= 0 &&
      parseFloat(updatedExtraCharges) !=
        parseFloat(payment.extraCharges.deficit)
    ) {
      payment.extraCharges.deficitHistory.push({
        amount: updatedExtraCharges,
        date: new Date(),
        description: `Updated Extra Charges Deficit amount from ${payment.extraCharges.deficit}`,
      });
      payment.extraCharges.deficit = updatedExtraCharges;
    }

    //update the global deficit
    let newTotalDeficit =
      (parseFloat(updatedRentDeficit) || parseFloat(payment.rent.deficit)) +
      (parseFloat(updatedWaterDeficit) ||
        parseFloat(payment.waterBill.deficit)) +
      (parseFloat(updatedGarbageDeficit) ||
        parseFloat(payment.garbageFee.deficit)) +
      (parseFloat(updatedExtraCharges) ||
        parseFloat(payment.extraCharges.deficit));

    payment.globalDeficitHistory.push({
      year: payment.year,
      month: payment.month,
      totalDeficitAmount: newTotalDeficit,
      description: `Global deficit changed from ${payment.globalDeficit} to ${newTotalDeficit}`,
    });
    payment.globalDeficit = newTotalDeficit;

    //add global transactional record
    payment.globalTransactionHistory.push({
      year: payment.year,
      month: payment.month,
      totalRentAmount: payment.rent.amount,
      totalWaterAmount: payment.waterBill.amount,
      totalGarbageFee: payment.garbageFee.amount,
      totalAmount: payment.totalAmountPaid,
      referenceNumber: updatedReferenceNumber,
      globalDeficit: newTotalDeficit,
    });

    await payment.save();
    return res.status(200).json({ payment, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, error });
  }
};
