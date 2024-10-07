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
        referenceNoHistory: [],
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

    //update the referenceNoHistory array history
    const paymentCount = payment.referenceNoHistory.length;
    payment.referenceNoHistory.push({
      date: depositDate,
      previousRefNo: payment.referenceNumber,
      referenceNoUsed: referenceNo,
      amount,
      description: `Payment record number of tinkering:#${paymentCount + 1}`,
    });
    payment.referenceNumber = referenceNo;

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
    payment.waterBill.accumulatedAmount = expectedWaterBill;
    payment.waterBill.transactions.push({
      amount: parseFloat(waterBillAmount.toFixed(2)),
      accumulatedAmount: parseFloat(expectedWaterBill.toFixed(2)),
      referenceNumber: referenceNo,
      date: dateObject,
      description: `Initial water transaction`,
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

export const handlePreviousPaymentUpdate = async (
  tenantId,
  paymentId,
  rentDeficit,
  sentWaterDeficit,
  garbageDeficit,
  referenceNumber,
  date,
  accumulatedWaterBill,
  paidWaterBill,
  // previousOtherChargesDeficit,
  month,
  year
) => {
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
      throw new Error('Payment or tenant not found');
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

    // 2. Process Rent Deficit
    const rentAmount = tenant.houseDetails.rent;
    const rentPaid = payment.rent.amount;
    let rentDeficitAmount = rentAmount - rentPaid;

    if (rentDeficit >= rentDeficitAmount) {
      payment.rent.paid = true;
      payment.rent.deficit = 0;
      payment.rent.amount = rentAmount;
      payment.rent.transactions.push({
        amount: rentDeficitAmount,
        referenceNumber,
        date,
      });
      payment.rent.deficitHistory.push({
        amount: 0,
        description: `Rent deficit of ${rentDeficitAmount} cleared`,
        date,
      });
    } else {
      payment.rent.paid = false;
      payment.rent.deficit -= rentDeficit;
      payment.rent.amount += rentDeficit;
      payment.rent.transactions.push({
        amount: rentDeficit,
        referenceNumber,
        date,
      });
      payment.rent.deficitHistory.push({
        amount: rentDeficit,
        description:
          'Partial rent deficit payment and deficit of ${rentDeficit} remained ',
        date,
      });

      rentDeficitAmount = rentAmount - payment.rent.amount;
      if (rentDeficitAmount > 0 && overpay > 0) {
        const rentCover = Math.min(overpay, rentDeficitAmount);
        payment.rent.amount += rentCover;
        payment.rent.deficit -= rentCover;
        overpay -= rentCover;
        payment.rent.transactions.push({
          amount: rentCover,
          referenceNumber: 'OVERPAY',
          date,
        });
        recordExcessHistory(rentCover, `Overpay applied to cover rent deficit`);
      }

      // Check if the rent deficit has been fully covered
      if (payment.rent.deficit === 0) {
        payment.rent.paid = true;
        payment.rent.deficitHistory.push({
          amount: 0,
          description: 'Rent fully paid after overpay adjustment',
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
            description: `Excess payment from extra charges for ${month} ${year}`,
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

    if (garbageDeficit >= garbageDeficitAmount) {
      payment.garbageFee.paid = true;
      payment.garbageFee.deficit = 0;
      payment.garbageFee.amount = garbageFeeAmount;
      payment.garbageFee.transactions.push({
        amount: garbageDeficitAmount,
        referenceNumber,
        date,
      });
      payment.garbageFee.deficitHistory.push({
        amount: 0,
        description: 'Garbage fee deficit cleared',
        date,
      });
    } else {
      payment.garbageFee.paid = false;
      payment.garbageFee.deficit -= garbageDeficit;
      payment.garbageFee.amount += garbageDeficit;
      payment.garbageFee.transactions.push({
        amount: garbageDeficit,
        referenceNumber,
        date,
      });
      payment.garbageFee.deficitHistory.push({
        amount: garbageDeficit,
        description: `Partial garbage fee deficit payment and deficit of ${garbageDeficit} remained`,
        date,
      });

      garbageDeficitAmount = garbageFeeAmount - payment.garbageFee.amount;
      if (garbageDeficitAmount > 0 && overpay > 0) {
        const garbageCover = Math.min(overpay, garbageDeficitAmount);
        payment.garbageFee.amount += garbageCover;
        payment.garbageFee.deficit -= garbageCover;
        overpay -= garbageCover;
        payment.overpay = overpay;
        payment.garbageFee.transactions.push({
          amount: garbageCover,
          referenceNumber: 'OVERPAY',
          date,
        });
        payment.excessHistory.push({
          initialOverpay: overpay + garbageCover,
          excessAmount: overpay,
          description: `Overpay amount of ${garbageCover} applied to cover garbage deficit ${month} ${year}`,
          date,
        });
      }

      // Check if the garbage deficit has been fully covered
      if (payment.garbageFee.deficit === 0) {
        payment.garbageFee.paid = true;
        payment.garbageFee.deficitHistory.push({
          amount: 0,
          description: 'Garbage fee fully paid after overpay adjustment',
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

    // Save payment
    await payment.save();

    return payment;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

export const clearDeficitsForPreviousPayments = async (
  tenantId,
  amount,
  depositDate,
  referenceNo,
  month,
  year
) => {
  try {
    console.log('ReceivedMonth: ', month);
    // Convert month name to previous month and adjust year if necessary
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

    // Find the month index and ensure it's valid
    const monthIndex = months.indexOf(month);
    if (monthIndex === -1) throw new Error('Invalid month name');

    // Calculate the previous month and adjust the year if needed
    const prevMonth = months[(monthIndex + 11) % 12];
    const prevYear = monthIndex === 0 ? year - 1 : year;

    // Ensure amount is a valid number
    if (isNaN(amount) || amount === null || amount === undefined) {
      throw new Error(
        'Invalid amount passed to clearDeficitsForPreviousPayments'
      );
    }
    amount = parseFloat(amount); // Ensure amount is a number

    // Fetch all previous payments for the tenant where isCleared is false, starting from the oldest
    const previousPayments = await Payment.find({
      tenant: tenantId,
      isCleared: false,
    }).sort({ createdAt: 1 });

    if (previousPayments?.length > 0) {
      for (const previousPayment of previousPayments) {
        let usedAmount = 0; // Keep track of how much of the amount is used for this payment

        // Check for overpay in this previous payment
        if (previousPayment.overpay && previousPayment.overpay > 0) {
          const overpayAmount = parseFloat(previousPayment.overpay);
          amount = parseFloat(amount) + parseFloat(overpayAmount); // Add the overpay to the current amount

          // Reset the overpay to 0 and record the transaction in excessHistory
          previousPayment.excessHistory.push({
            initialOverpay: previousPayment.overpay,
            excessAmount: 0,
            date: depositDate,
            description: `Used overpay of ${overpayAmount} to cover deficits`,
          });
          previousPayment.overpay = 0;
        }

        if (amount <= 0) break; // If no more amount is available, break the loop

        // Clear rent deficit (either fully or partially)
        if (
          previousPayment?.rent &&
          previousPayment?.rent?.deficit > 0 &&
          amount > 0
        ) {
          // console.log(
          //   `Rent deficit to be covered: ${previousPayment?.rent?.deficit}, by Amount: ${amount}`
          // );
          const rentCoverage = Math.min(previousPayment?.rent?.deficit, amount);
          previousPayment.rent.amount += rentCoverage;
          previousPayment.rent.deficit -= rentCoverage;
          amount -= rentCoverage;
          usedAmount += rentCoverage;
          // console.log(
          //   `Covered rent deficit: ${rentCoverage}, Remaining Amount: ${amount}`
          // );

          // Record the rent transaction
          previousPayment.rent.transactions.push({
            amount: rentCoverage,
            date: depositDate,
            referenceNumber: referenceNo,
          });

          // Record deficit change in rent history
          previousPayment.rent.deficitHistory.push({
            amount: -rentCoverage,
            date: depositDate,
            description: `Covered rent deficit of ${rentCoverage} and remaining rent deficit is ${previousPayment.rent.deficit}`,
          });

          if (previousPayment.rent.deficit <= 0) {
            previousPayment.rent.paid = true;
          }
        }

        // Clear water bill deficit (either fully or partially)
        if (
          previousPayment?.waterBill &&
          previousPayment?.waterBill?.deficit > 0 &&
          previousPayment?.waterBill?.amount !=
            previousPayment?.waterBill?.accumulatedAmount &&
          amount > 0
        ) {
          // console.log(
          //   `Water deficit to be covered: ${previousPayment?.waterBill?.deficit}, by Amount: ${amount}`
          // );
          const waterCoverage = Math.min(
            previousPayment.waterBill.deficit,
            amount
          );
          previousPayment.waterBill.amount += waterCoverage;
          previousPayment.waterBill.deficit -= waterCoverage;
          amount -= waterCoverage;
          usedAmount += waterCoverage;
          // console.log(
          //   `Covered water deficit: ${waterCoverage}, Remaining Amount: ${amount}`
          // );

          // Record the water bill transaction
          previousPayment.waterBill.transactions.push({
            amount: waterCoverage,
            accumulatedAmount: previousPayment.waterBill.accumulatedAmount,
            date: depositDate,
            referenceNumber: referenceNo,
          });

          previousPayment.waterBill.deficitHistory.push({
            amount: -waterCoverage,
            date: depositDate,
            description: `Covered water bill deficit of ${waterCoverage} and remaining waterBill deficit is ${previousPayment.waterBill.deficit}`,
          });

          if (
            previousPayment.waterBill.amount >=
            previousPayment.waterBill.accumulatedAmount
          ) {
            previousPayment.waterBill.paid = true;
          }
        }

        // Clear garbage fee deficit
        if (
          previousPayment.garbageFee &&
          previousPayment.garbageFee.deficit > 0 &&
          amount > 0
        ) {
          // console.log(
          //   `garbage deficit to be covered: ${previousPayment?.garbageFee?.deficit}, by Amount: ${amount}`
          // );
          const garbageCoverage = Math.min(
            previousPayment.garbageFee.deficit,
            amount
          );
          previousPayment.garbageFee.amount += garbageCoverage;
          previousPayment.garbageFee.deficit -= garbageCoverage;
          amount -= garbageCoverage;
          usedAmount += garbageCoverage;
          // console.log(
          //   `Covered garbage deficit: ${garbageCoverage}, Remaining Amount: ${amount}`
          // );

          previousPayment.garbageFee.transactions.push({
            amount: garbageCoverage,
            date: depositDate,
            referenceNumber: referenceNo,
          });

          previousPayment.garbageFee.deficitHistory.push({
            amount: -garbageCoverage,
            date: depositDate,
            description: `Covered garbage fee deficit of ${garbageCoverage} and remaining garbageFee deficit is ${previousPayment.garbageFee.deficit}`,
          });

          if (previousPayment.garbageFee.deficit <= 0) {
            previousPayment.garbageFee.paid = true;
          }
        }

        // Clear extra charges deficit
        if (
          previousPayment.extraCharges &&
          previousPayment.extraCharges.deficit > 0 &&
          amount > 0
        ) {
          // console.log(
          //   `extraCharges deficit to be covered: ${previousPayment?.extraCharges?.deficit}, by Amount: ${amount}`
          // );
          const extraChargesCoverage = Math.min(
            previousPayment.extraCharges.deficit,
            amount
          );
          previousPayment.extraCharges.amount += extraChargesCoverage;
          previousPayment.extraCharges.deficit -= extraChargesCoverage;
          amount -= extraChargesCoverage;
          usedAmount += extraChargesCoverage;
          // console.log(
          //   `Covered garbage deficit: ${extraChargesCoverage}, Remaining Amount: ${amount}`
          // );

          previousPayment.extraCharges.transactions.push({
            amount: extraChargesCoverage,
            expected: previousPayment.extraCharges.expected,
            date: depositDate,
            referenceNumber: referenceNo,
            description: previousPayment.extraCharges.description,
          });

          previousPayment.extraCharges.deficitHistory.push({
            amount: -extraChargesCoverage,
            date: depositDate,
            description: `Covered extra charges deficit of ${extraChargesCoverage} and remaining extraCharges deficit is ${previousPayment.extraCharges.deficit}`,
          });

          if (
            previousPayment.extraCharges.amount >=
            previousPayment.extraCharges.expected
          ) {
            previousPayment.extraCharges.paid = true;
          }
        }

        // Calculate the total global deficit after handling all charges
        const rentDeficit = parseFloat(previousPayment.rent.deficit || 0);
        const waterBillDeficit = parseFloat(
          previousPayment.waterBill.deficit || 0
        );
        const garbageDeficit = parseFloat(
          previousPayment.garbageFee.deficit || 0
        );
        const extraDeficit = parseFloat(
          previousPayment.extraCharges.deficit || 0
        );

        const globalDeficit =
          parseFloat(rentDeficit) +
          parseFloat(waterBillDeficit) +
          parseFloat(garbageDeficit) +
          parseFloat(extraDeficit);

        previousPayment.globalDeficit = parseFloat(globalDeficit);
        previousPayment.globalDeficitHistory.push({
          year: previousPayment.year,
          month: previousPayment.month,
          totalDeficitAmount: previousPayment.globalDeficit,
          description: `Global Deficit for the month of ${previousPayment.month} ${previousPayment.year}`,
        });

        // Add to global transaction history
        previousPayment.globalTransactionHistory.push({
          year: previousPayment.year,
          month: previousPayment.month,
          totalRentAmount: previousPayment.rent.amount,
          totalWaterAmount: previousPayment.waterBill.amount || 0,
          totalGarbageFee: previousPayment.garbageFee.amount,
          totalAmount: (
            previousPayment.rent.amount +
            previousPayment.waterBill.amount +
            previousPayment.garbageFee.amount +
            previousPayment.extraCharges.amount
          ).toFixed(2),
          referenceNumber: referenceNo,
          globalDeficit: previousPayment.globalDeficit || 0,
        });

        previousPayment.totalAmountPaid = (
          parseFloat(previousPayment.rent.amount || 0) +
          parseFloat(previousPayment.waterBill.amount || 0) +
          parseFloat(previousPayment.garbageFee.amount || 0) +
          parseFloat(previousPayment.extraCharges.amount || 0)
        ).toFixed(2);

        if (
          previousPayment.rent.paid &&
          previousPayment.waterBill.paid &&
          previousPayment.garbageFee.paid &&
          previousPayment.extraCharges.expected ===
            previousPayment.extraCharges.amount
        ) {
          previousPayment.isCleared = true;
        }

        const paymentCount = previousPayment.referenceNoHistory.length;
        previousPayment.referenceNoHistory.push({
          date: depositDate,
          previousRefNo: previousPayment.referenceNumber,
          referenceNoUsed: referenceNo,
          amount: usedAmount.toFixed(2),
          description: `Payment record number of tinkering:#${
            paymentCount + 1
          } doneIn helperFunc`,
        });

        previousPayment.referenceNumber = referenceNo;
        // console.log('amountRemainingAfterCycleUse: ', amount);
        // console.log('paymentCoveredInCyclePriorToSave: ', previousPayment);
        await previousPayment.save();
      }
    } else {
      // Fetch previous payment record for the tenant and see if there is a valid overpay amount
      const mostRecentPayments = await Payment.find({
        tenant: tenantId,
        isCleared: true,
      }).sort({ createdAt: -1 });
      // console.log('mostRecentPayment: ', mostRecentPayments);

      for (const mostRecentPayment of mostRecentPayments) {
        // Check for overpay in this previous payment
        if (mostRecentPayment.overpay && mostRecentPayment.overpay > 0) {
          const overpayAmount = parseFloat(mostRecentPayment.overpay);
          amount = parseFloat(amount) + parseFloat(overpayAmount); // Add the overpay to the current amount

          // Reset the overpay to 0 and record the transaction in excessHistory
          mostRecentPayment.excessHistory.push({
            initialOverpay: mostRecentPayment.overpay,
            excessAmount: 0,
            date: depositDate,
            description: `Used overpay of ${overpayAmount} transfered to amount to create new payment`,
          });
          mostRecentPayment.overpay = 0;

          await mostRecentPayment.save();
        }

        // if (
        //   mostRecentPayment &&
        //   mostRecentPayment?.overpay &&
        //   mostRecentPayment?.overpay > 0
        // ) {
        //   const overpayAmount = parseFloat(mostRecentPayment.overpay);
        //   amount = parseFloat(amount) + parseFloat(overpayAmount); // Add the overpay to the current amount

        //   // Reset the overpay to 0 and record the transaction in excessHistory
        //   mostRecentPayment?.excessHistory.push({
        //     initialOverpay: mostRecentPayment.overpay,
        //     excessAmount: 0,
        //     date: depositDate,
        //     description: `Overpay of ${overpayAmount} transfered from last payment to the new payment`,
        //   });
        //   mostRecentPayment.overpay = 0;
        //   await mostRecentPayment.save();
        // }
      }
    }
    return parseFloat(amount).toFixed(2);
  } catch (error) {
    throw new Error(`Error clearing deficits: ${error.message}`);
  }
};
