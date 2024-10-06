import Clearance from '../../../models/v2/models/clearance.model.js';
import Tenant from '../../../models/v2/models/v2Tenant.model.js';
import { clearDeficitsForPreviousPayments } from '../../../utils/v2/utils/paymentHelper.js';

export const getTenantClearData = async (req, res) => {
  const { tenantId } = req.params;
  try {
    // Correct usage of sort
    const clearanceData = await Clearance.find({ tenant: tenantId }).sort({
      createdAt: -1,
    });

    // Check if the array is empty
    if (clearanceData.length < 0) {
      return res
        .status(404)
        .json({ message: 'No clearance tenant data found!' });
    }

    // Send the retrieved data
    res.status(200).json(clearanceData);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Error fetching clearance data' });
  }
};

//delete clearance data
export const deleteClearanceData = async (req, res) => {
  const { id } = req.params;
  try {
    const clearanceDt = await Clearance.findByIdAndDelete(id);
    if (!clearanceDt) {
      return res
        .status(404)
        .json({ message: 'No Such Clearance Dt found to Delete' });
    }
    res.status(200).json(clearanceDt);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Error deleting Clearance data!' });
  }
};

// updateClearanceData
export const updateClearanceData = async (req, res) => {
  const { clearDataId } = req.params;
  const { amount, tenantId, date, receivedMonth, year } = req.body;
  try {
    // Array of month names
    const monthNames = [
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
    // Convert month number to month name
    const month = monthNames[Number(receivedMonth) - 1];
    console.log('month: ', month);

    // Find the clearance data
    const clearance = await Clearance.findById(clearDataId);
    if (!clearance) {
      return res.status(400).json({ message: 'No clearance data found!' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'No Tenant found!' });
    }

    // Clear any deficits left from previous payments
    let remainingAmount = await clearDeficitsForPreviousPayments(
      tenantId,
      parseFloat(amount), // Ensure amount is treated as a float
      date,
      tenant.deposits.referenceNo,
      month,
      year
    );

    console.log('remainingAmount: ', remainingAmount);

    // Calculate original global deficit before updates
    const originalGlobalDeficit =
      parseFloat(clearance.paintingFee.deficit) +
      parseFloat(clearance.miscellaneous.deficit);

    // Step 1: Handle Painting Fee Deficit
    const paintingDeficit =
      parseFloat(clearance.paintingFee.expected) -
      parseFloat(clearance.paintingFee.amount);

    if (paintingDeficit > 0) {
      // Scenario 1: Full Payment for Painting
      if (remainingAmount >= paintingDeficit) {
        clearance.paintingFee.amount += parseFloat(paintingDeficit);
        remainingAmount -= paintingDeficit;
        clearance.paintingFee.deficit = 0;

        // Add transaction history for full payment
        clearance.paintingFee.transactions.push({
          amount: paintingDeficit,
          expected: clearance.paintingFee.expected,
          date,
          referenceNumber: tenant.deposits.referenceNo,
          description: `Full payment clearing painting fee`,
        });

        clearance.paintingFee.deficitHistory.push({
          amount: paintingDeficit,
          date,
          description: `Painting fee deficit fully cleared`,
        });

        // Mark as paid
        clearance.paintingFee.paid = true;
      }
      // Scenario 2: Partial Payment for Painting
      else if (remainingAmount > 0 && remainingAmount < paintingDeficit) {
        let paintingDeduction = remainingAmount;

        // Deduct from painting amount and update deficit
        clearance.paintingFee.amount += parseFloat(paintingDeduction);
        remainingAmount -= paintingDeduction;
        clearance.paintingFee.deficit =
          parseFloat(paintingDeficit) - parseFloat(paintingDeduction);

        // Add partial payment transaction and deficit history
        clearance.paintingFee.transactions.push({
          amount: paintingDeduction,
          expected: clearance.paintingFee.expected,
          date,
          referenceNumber: tenant.deposits.referenceNo,
          description: `Partial payment towards painting fee`,
        });

        clearance.paintingFee.deficitHistory.push({
          amount: paintingDeduction,
          date,
          description: `Partial payment made for painting fee, deficit updated`,
        });
      }
    }

    // Step 2: Handle Miscellaneous Fee Deficit
    const miscDeficit =
      parseFloat(clearance.miscellaneous.expected) -
      parseFloat(clearance.miscellaneous.amount);

    if (miscDeficit > 0) {
      // Scenario 1: Full Payment for Miscellaneous
      if (remainingAmount >= miscDeficit) {
        clearance.miscellaneous.amount += parseFloat(miscDeficit);
        remainingAmount -= miscDeficit;
        clearance.miscellaneous.deficit = 0;

        // Add transaction history for full payment
        clearance.miscellaneous.transactions.push({
          amount: miscDeficit,
          expected: clearance.miscellaneous.expected,
          date,
          referenceNumber: tenant.deposits.referenceNo,
          description: `Full payment clearing miscellaneous fee`,
        });

        clearance.miscellaneous.deficitHistory.push({
          amount: miscDeficit,
          date,
          description: `Miscellaneous fee deficit fully cleared`,
        });

        // Mark as paid
        clearance.miscellaneous.paid = true;
      }
      // Scenario 2: Partial Payment for Miscellaneous
      else if (remainingAmount > 0 && remainingAmount < miscDeficit) {
        let miscDeduction = remainingAmount;

        // Deduct from miscellaneous amount and update deficit
        clearance.miscellaneous.amount += parseFloat(miscDeduction);
        remainingAmount -= miscDeduction;
        clearance.miscellaneous.deficit =
          parseFloat(miscDeficit) - parseFloat(miscDeduction);

        // Add partial payment transaction and deficit history
        clearance.miscellaneous.transactions.push({
          amount: miscDeduction,
          expected: clearance.miscellaneous.expected,
          date,
          referenceNumber: tenant.deposits.referenceNo,
          description: `Partial payment towards miscellaneous fee`,
        });

        clearance.miscellaneous.deficitHistory.push({
          amount: miscDeduction,
          date,
          description: `Partial payment made for miscellaneous fee, deficit updated`,
        });
      }
    }

    // Step 3: Calculate new global deficit based on updated painting and miscellaneous deficits
    const updatedGlobalDeficit =
      parseFloat(clearance.paintingFee.deficit) +
      parseFloat(clearance.miscellaneous.deficit);
    const globalDeficitChange = originalGlobalDeficit - updatedGlobalDeficit;

    // Update the global deficit with the new value
    clearance.globalDeficit = parseFloat(updatedGlobalDeficit);
    clearance.globalTransactions.push({
      amount: globalDeficitChange,
      expected: clearance.globalDeficit,
      date,
      referenceNumber: tenant.deposits.referenceNo,
      description: `Update to global deficit after clearing painting and miscellaneous deficits`,
    });

    clearance.globalDeficitHistory.push({
      amount: globalDeficitChange,
      date,
      description: `Global deficit adjusted by ${globalDeficitChange} after payments`,
    });

    // Step 4: Handle remaining amount as overpay (if any)
    clearance.totalAmountPaid += parseFloat(amount); // Ensure amount is treated as a float
    if (remainingAmount > 0) {
      clearance.overpay += parseFloat(remainingAmount);
      clearance.excessHistory.push({
        initialOverpay: clearance.overpay - remainingAmount,
        excessAmount: remainingAmount,
        description: `Excess payment of ${remainingAmount} added`,
        date,
      });
    }

    clearance.isCleared =
      clearance.paintingFee.paid && clearance.miscellaneous.paid;

    // Save updated clearance data
    await clearance.save();

    res.status(200).json({
      message: 'Clearance data updated successfully',
      remainingAmount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Error updating clearance data!' });
  }
};
