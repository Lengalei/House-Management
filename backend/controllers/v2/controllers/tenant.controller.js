import mongoose from 'mongoose';
import cron from 'node-cron';
import Tenant from '../../../models/v2/models/v2Tenant.model.js';
import { createPaymentRecord } from '../../../utils/v2/utils/paymentHelper.js';
import House from '../../../models/houses.js';
import Payment from '../../../models/v2/models/v2Payment.model.js';
import ScheduledJob from '../../../models/v2/models/ScheduledJob.js';
import Invoice from '../../../models/v2/models/Invoice.js';

// Register Tenant Details
export const createTenant = async (req, res) => {
  const {
    name,
    email,
    nationalId,
    phoneNo,
    placementDate,
    houseNo,
    apartmentId,
    emergencyContactNumber,
    emergencyContactName,
  } = req.body;

  // Check if houseNo is provided
  if (
    !name ||
    !email ||
    !nationalId ||
    !phoneNo ||
    !placementDate ||
    !houseNo ||
    !apartmentId ||
    !emergencyContactNumber ||
    !emergencyContactName
  ) {
    return res.status(400).json({ message: 'All fields required!.' });
  }

  try {
    // Check if the houseNo already exists
    const existingTenant = await Tenant.findOne({
      'houseDetails.houseNo': houseNo,
      apartmentId: apartmentId,
    });
    if (existingTenant) {
      return res.status(400).json({
        message: 'House number is already assigned to another tenant.',
      });
    }

    // Determine house details
    let rent = 0;
    let rentDeposit = 0;
    let waterDeposit = 0;
    let garbageFee = 0;

    if (
      houseNo.endsWith('A') ||
      houseNo.endsWith('B') ||
      houseNo.endsWith('C')
    ) {
      rent = 17000;
      rentDeposit = 17000;
      waterDeposit = 2500;
      garbageFee = 150;
    } else {
      rent = 15000;
      rentDeposit = 15000;
      waterDeposit = 2500;
      garbageFee = 150;
    }

    const existingNationalId = await Tenant.findOne({ nationalId });
    if (existingNationalId) {
      return res
        .status(409)
        .json({ message: 'Tenant National ID already exists!' });
    }

    let houseName = 'House ' + houseNo; // Assuming houseNo is defined and valid
    const match = houseNo.match(/\d+/);
    const floorNumber = match ? match[0] : null; // Extract the numeric part

    const existingTenantInHouse = await House.findOne({
      houseName: houseName,
      floor: floorNumber,
      apartment: apartmentId,
      isOccupied: true,
    });
    if (existingTenantInHouse) {
      return res.status(400).json({ message: 'House Already Occupied!' });
    }

    const house = await House.findOneAndUpdate(
      { floor: floorNumber, houseName, apartment: apartmentId },
      { isOccupied: true },
      { new: true }
    );
    if (!house) {
      return res.status(404).json({ message: 'House not found!' });
    }

    // Create tenant
    const tenant = new Tenant({
      name,
      email,
      nationalId,
      phoneNo,
      placementDate,
      apartmentId,
      houseDetails: {
        houseNo,
        rent,
        rentDeposit,
        waterDeposit,
        garbageFee,
      },
      deposits: {
        rentDeposit: 0,
        waterDeposit: 0,
        initialRentPayment: 0,
        depositDate: null,
        referenceNo: null,
        isCleared: false,
      },
      emergencyContactNumber,
      emergencyContactName,
    });

    // Save tenant
    await tenant.save();
    res.status(201).json(tenant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//add multiple deposit values
export const addDeposits = async (req, res) => {
  try {
    const {
      tenantId,
      rentDeposit,
      waterDeposit,
      initialRentPayment,
      depositDate,
      referenceNo,
    } = req.body;

    // Validate input
    if (!tenantId || !depositDate) {
      return res
        .status(400)
        .json({ message: 'Tenant ID and deposit date are required.' });
    }

    // Find tenant
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found.' });
    }

    // Initialize deposit amounts
    const updatedRentDeposit = parseFloat(rentDeposit) || 0;
    const updatedWaterDeposit = parseFloat(waterDeposit) || 0;
    let remainingInitialRentPayment = parseFloat(initialRentPayment) || 0;

    // Record initial excess if any deposit values exceed the expected values
    const excessRentDepositBefore =
      updatedRentDeposit > tenant.houseDetails.rentDeposit
        ? updatedRentDeposit - tenant.houseDetails.rentDeposit
        : 0;
    const excessWaterDepositBefore =
      updatedWaterDeposit > tenant.houseDetails.waterDeposit
        ? updatedWaterDeposit - tenant.houseDetails.waterDeposit
        : 0;

    if (excessRentDepositBefore > 0) {
      tenant.deposits.rentDepositExcessHistory.push({
        date: depositDate,
        amount: excessRentDepositBefore,
        description: `Excess rent deposit of ${excessRentDepositBefore} recorded before calculations`,
      });
      tenant.deposits.rentDepositExcess += excessRentDepositBefore;
    }

    if (excessWaterDepositBefore > 0) {
      tenant.deposits.waterDepositExcessHistory.push({
        date: depositDate,
        amount: excessWaterDepositBefore,
        description: `Excess water deposit of ${excessWaterDepositBefore} recorded before calculations`,
      });
      tenant.deposits.waterDepositExcess += excessWaterDepositBefore;
    }

    // Update depositDate and referenceNo in main record
    // Get the number of records in depositDateHistory
    const depositCount = tenant.deposits.depositDateHistory.length;
    tenant.deposits.depositDate = depositDate;
    tenant.deposits.depositDateHistory.push({
      date: depositDate,
      referenceNoUsed: referenceNo,
      amount:
        parseFloat(rentDeposit) +
        parseFloat(waterDeposit) +
        parseFloat(initialRentPayment),
      description: `Deposit #${depositCount + 1}: Total amount of ${
        parseFloat(rentDeposit) +
        parseFloat(waterDeposit) +
        parseFloat(initialRentPayment)
      }`,
    });
    tenant.deposits.referenceNo = referenceNo;

    // Record deposits in global deposit history
    if (updatedRentDeposit > 0) {
      tenant.depositHistory.push({
        date: depositDate,
        amount: updatedRentDeposit,
        type: 'rentDeposit',
        referenceNo,
      });

      // Update individual rent deposit history
      tenant.deposits.rentDepositHistory.push({
        date: depositDate,
        amount: updatedRentDeposit,
        referenceNo,
        previousAmount: tenant.deposits.rentDeposit,
      });
      tenant.deposits.rentDeposit += updatedRentDeposit;
    }

    if (updatedWaterDeposit > 0) {
      tenant.depositHistory.push({
        date: depositDate,
        amount: updatedWaterDeposit,
        type: 'waterDeposit',
        referenceNo,
      });

      // Update individual water deposit history
      tenant.deposits.waterDepositHistory.push({
        date: depositDate,
        amount: updatedWaterDeposit,
        referenceNo,
        previousAmount: tenant.deposits.waterDeposit,
      });
      tenant.deposits.waterDeposit += updatedWaterDeposit;
    }

    if (initialRentPayment > 0) {
      tenant.depositHistory.push({
        date: depositDate,
        amount: initialRentPayment,
        type: 'initialRentPayment',
        referenceNo,
      });

      // Update individual initial rent payment history
      tenant.deposits.initialRentPaymentHistory.push({
        date: depositDate,
        amount: initialRentPayment,
        referenceNo,
        previousAmount: tenant.deposits.initialRentPayment,
      });
      tenant.deposits.initialRentPayment += initialRentPayment;
    }

    // Calculate required deposits
    const requiredRentDeposit = parseFloat(tenant.houseDetails.rentDeposit);
    const requiredWaterDeposit = parseFloat(tenant.houseDetails.waterDeposit);

    // Handle underpayment scenarios by using initial rent payment to cover shortfalls
    if (tenant.deposits.rentDeposit < requiredRentDeposit) {
      const rentShortfall = requiredRentDeposit - tenant.deposits.rentDeposit;

      // Record the deficit before attempting to use the initial rent payment
      if (rentShortfall > 0) {
        tenant.deposits.rentDepositDeficit = rentShortfall;
        tenant.deposits.rentDepositDeficitHistory.push({
          date: depositDate,
          amount: rentShortfall,
          description: `Deficit rent deposit of ${rentShortfall} recorded before initialRentPayment cover calculations`,
        });
      }

      if (remainingInitialRentPayment >= rentShortfall) {
        // Cover the shortfall with the initial rent payment
        tenant.deposits.rentDeposit += rentShortfall;
        remainingInitialRentPayment -= rentShortfall;

        tenant.deposits.initialRentPaymentHistory.push({
          date: depositDate,
          amount: -rentShortfall, // Negative to show usage
          referenceNo,
          previousAmount: tenant.deposits.initialRentPayment,
        });

        // After coverage, check if there is any remaining deficit
        tenant.deposits.rentDepositDeficit = 0;
        tenant.deposits.rentDepositDeficitHistory.push({
          date: depositDate,
          amount: 0,
          description: `Deficit rent deposit of ${0} recorded after initialRentPayment cover calculations`,
        });
      } else {
        // Use remaining initial rent payment and still have a deficit
        tenant.deposits.rentDeposit += remainingInitialRentPayment;
        tenant.deposits.initialRentPaymentHistory.push({
          date: depositDate,
          amount: -remainingInitialRentPayment, // Negative to show usage
          referenceNo,
          previousAmount: tenant.deposits.initialRentPayment,
        });

        remainingInitialRentPayment = 0;

        // Calculate remaining shortfall after coverage
        const rentShortfallAfterCoverage =
          requiredRentDeposit - tenant.deposits.rentDeposit;

        if (rentShortfallAfterCoverage > 0) {
          tenant.deposits.rentDepositDeficit = rentShortfallAfterCoverage;
          tenant.deposits.rentDepositDeficitHistory.push({
            date: depositDate,
            amount: rentShortfallAfterCoverage,
            description: `Deficit rent deposit of ${rentShortfallAfterCoverage} recorded after initialRentPayment cover calculations`,
          });
        }
      }
    }

    if (tenant.deposits.waterDeposit < requiredWaterDeposit) {
      const waterShortfall =
        requiredWaterDeposit - tenant.deposits.waterDeposit;

      // Record the deficit before attempting to use the initial rent payment
      if (waterShortfall > 0) {
        tenant.deposits.waterDepositDeficit = waterShortfall;
        tenant.deposits.waterDepositDeficitHistory.push({
          date: depositDate,
          amount: waterShortfall,
          description: `Deficit water deposit of ${waterShortfall} recorded before initialRentPayment cover calculations`,
        });
      }

      if (remainingInitialRentPayment >= waterShortfall) {
        // Cover the shortfall with the initial rent payment
        tenant.deposits.waterDeposit += waterShortfall;
        remainingInitialRentPayment -= waterShortfall;

        tenant.deposits.initialRentPaymentHistory.push({
          date: depositDate,
          amount: -waterShortfall, // Negative to show usage
          referenceNo,
          previousAmount: tenant.deposits.initialRentPayment,
        });

        // After coverage, check if there is any remaining deficit
        tenant.deposits.waterDepositDeficit = 0;
        tenant.deposits.waterDepositDeficitHistory.push({
          date: depositDate,
          amount: 0,
          description: `Deficit water deposit of ${0} recorded after initialRentPayment cover calculations`,
        });
      } else {
        // Use remaining initial rent payment and still have a deficit
        tenant.deposits.waterDeposit += remainingInitialRentPayment;
        tenant.deposits.initialRentPaymentHistory.push({
          date: depositDate,
          amount: -remainingInitialRentPayment, // Negative to show usage
          referenceNo,
          previousAmount: tenant.deposits.initialRentPayment,
        });

        remainingInitialRentPayment = 0;

        // Calculate remaining shortfall after coverage
        const waterShortfallAfterCoverage =
          requiredWaterDeposit - tenant.deposits.waterDeposit;

        if (waterShortfallAfterCoverage > 0) {
          tenant.deposits.waterDepositDeficit = waterShortfallAfterCoverage;
          tenant.deposits.waterDepositDeficitHistory.push({
            date: depositDate,
            amount: waterShortfallAfterCoverage,
            description: `Deficit water deposit of ${waterShortfallAfterCoverage} recorded after initialRentPayment cover calculations`,
          });
        }
      }
    }

    // Calculate excess and deficit deposits
    const excessRentDeposit =
      tenant.deposits.rentDeposit > requiredRentDeposit
        ? tenant.deposits.rentDeposit - requiredRentDeposit
        : 0;

    const excessWaterDeposit =
      tenant.deposits.waterDeposit > requiredWaterDeposit
        ? tenant.deposits.waterDeposit - requiredWaterDeposit
        : 0;

    let totalExcessDeposit = excessRentDeposit + excessWaterDeposit;

    // Record excess from rent deposit
    if (excessRentDeposit > 0) {
      tenant.deposits.rentDepositExcessHistory.push({
        date: depositDate,
        amount: excessRentDeposit,
        description: `Excess rent deposit of ${excessRentDeposit} recorded after rent depo amount allocation`,
      });
      tenant.deposits.rentDepositExcess += excessRentDeposit;
    }

    // Record excess from water deposit
    if (excessWaterDeposit > 0) {
      tenant.deposits.waterDepositExcessHistory.push({
        date: depositDate,
        amount: excessWaterDeposit,
        description: `Excess water deposit of ${excessWaterDeposit} recorded after water depo amount allocation`,
      });
      tenant.deposits.waterDepositExcess += excessWaterDeposit;
    }

    //record combined excess rent ans wate deposits in excess history
    tenant.excessAmount = totalExcessDeposit;
    if (totalExcessDeposit > 0) {
      tenant.excessHistory.push({
        date: depositDate,
        amount: tenant.excessAmount,
        description: `Excess amount of ${tenant.excessAmount} recorded before initial Rent pay calculation and after rent and water depos alocations`,
      });
    }

    // Check if the initial rent payment exactly equals the rent amount
    if (remainingInitialRentPayment === tenant.houseDetails.rent) {
      tenant.deposits.initialRentPayment = remainingInitialRentPayment;
      tenant.deposits.initialRentPaymentHistory.push({
        date: depositDate,
        amount: remainingInitialRentPayment,
        description: `Exact initial rent payment of ${remainingInitialRentPayment} recorded`,
      });

      tenant.deposits.initialRentPaymentDeficit = 0;
      tenant.deposits.initialRentPaymentExcess = 0;

      tenant.deposits.initialRentPaymentDeficitHistory.push({
        date: depositDate,
        amount: 0,
        description: `No deficit as exact rent payment received`,
      });

      tenant.deposits.initialRentPaymentExcessHistory.push({
        date: depositDate,
        amount: 0,
        description: `No excess as exact rent payment received`,
      });
    } else {
      // Original logic for excess and shortfall

      // Calculate excess from initial rent payment
      const excessInitialRent =
        remainingInitialRentPayment > tenant.houseDetails.rent
          ? remainingInitialRentPayment - tenant.houseDetails.rent
          : 0;

      if (excessInitialRent > 0) {
        totalExcessDeposit += excessInitialRent;
        tenant.deposits.initialRentPaymentExcessHistory.push({
          date: depositDate,
          amount: excessInitialRent,
          description: `Excess amount of ${excessInitialRent} from initial rent payment recorded`,
        });
        tenant.deposits.initialRentPaymentExcess += excessInitialRent;
        remainingInitialRentPayment -= excessInitialRent;
      }

      // Handle insufficient initial rent payment
      if (remainingInitialRentPayment < tenant.houseDetails.rent) {
        const rentShortfall =
          tenant.houseDetails.rent - remainingInitialRentPayment;

        // Record the deficit before using the excess deposit
        if (rentShortfall > 0) {
          tenant.deposits.initialRentPaymentDeficit = rentShortfall;
          tenant.deposits.initialRentPaymentDeficitHistory.push({
            date: depositDate,
            amount: rentShortfall,
            description: `InitialRentPay shortfall of ${rentShortfall} recorded before applying excess deposits`,
          });
        }

        if (totalExcessDeposit >= rentShortfall) {
          // Cover the shortfall with excess deposit
          remainingInitialRentPayment += rentShortfall;
          totalExcessDeposit -= rentShortfall;

          tenant.deposits.excessHistory.push({
            date: depositDate,
            amount: -rentShortfall, // Negative to show usage
            description: `Excess deposit of ${rentShortfall} used to cover rent shortfall`,
          });

          // After coverage, check if there is any remaining deficit
          tenant.deposits.initialRentPaymentDeficit = 0;
          tenant.deposits.initialRentPaymentDeficitHistory.push({
            date: depositDate,
            amount: 0,
            description: `Rent shortfall of ${0} recorded after applying excess deposits`,
          });
        } else {
          // Use the remaining excess deposit and still have a shortfall
          remainingInitialRentPayment += totalExcessDeposit;
          tenant.excessAmount = 0;
          tenant.excessHistory.push({
            date: depositDate,
            amount: -totalExcessDeposit, // Negative to show usage
            description: `Excess deposit of ${totalExcessDeposit} used to cover rent shortfall`,
          });

          totalExcessDeposit = 0;

          // Calculate remaining shortfall after applying excess deposit
          const rentShortfallAfterCoverage =
            tenant.houseDetails.rent - remainingInitialRentPayment;

          if (rentShortfallAfterCoverage > 0) {
            tenant.deposits.initialRentPaymentDeficit =
              rentShortfallAfterCoverage;
            tenant.deposits.initialRentPaymentDeficitHistory.push({
              date: depositDate,
              amount: rentShortfallAfterCoverage,
              description: `Rent shortfall of ${rentShortfallAfterCoverage} recorded after applying excess deposits`,
            });
          }
        }
      }
    }

    // Update global excess amount and history
    tenant.excessAmount = totalExcessDeposit;
    if (totalExcessDeposit > 0) {
      tenant.excessHistory.push({
        date: depositDate,
        amount: tenant.excessAmount,
        description: `Excess amount of ${tenant.excessAmount} recorded`,
      });
    }

    const formattedPlacementDate = new Date(tenant.placementDate);

    // Update isCleared status
    tenant.deposits.isCleared =
      tenant.deposits.rentDeposit >= tenant.houseDetails.rentDeposit &&
      tenant.deposits.waterDeposit >= tenant.houseDetails.waterDeposit &&
      tenant.deposits.initialRentPayment >= tenant.houseDetails.rent;

    if (tenant.deposits.isCleared) {
      // Create the payment record
      await createPaymentRecord(
        tenantId,
        remainingInitialRentPayment + totalExcessDeposit,
        formattedPlacementDate,
        referenceNo
      );
    }

    // After creating the payment, set excess to 0 and record it
    tenant.excessHistory.push({
      date: depositDate,
      amount: 0,
      description: `Excess amount of ${totalExcessDeposit} used for payment`,
    });
    tenant.excessAmount = 0;

    // Set initialRentPayment in deposits with the remaining value or the initial value if not used
    tenant.deposits.initialRentPayment = remainingInitialRentPayment;

    await tenant.save();

    res.status(200).json({ message: 'Deposits updated successfully.', tenant });
  } catch (error) {
    console.error('Error adding deposits:', error);
    res.status(500).json({ message: 'Error adding deposits.', error });
  }
};

//add single deposit value
export const addSingleAmountDeposit = async (req, res) => {
  const { tenantId, totalAmount, depositDate, referenceNo } = req.body;

  try {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const {
      rentDeposit: houseRentDeposit,
      waterDeposit: houseWaterDeposit,
      rent: requiredInitialRent,
    } = tenant.houseDetails;

    const totalRequiredDeposit =
      parseFloat(houseRentDeposit) +
      parseFloat(houseWaterDeposit) +
      parseFloat(requiredInitialRent);

    // Initialize amounts
    let remainingAmount = parseFloat(totalAmount);
    let rentDepositAmount = 0;
    let waterDepositAmount = 0;
    let initialRentPayment = 0;
    let excessAmount = 0;

    // Update depositDate and referenceNo in the main record
    // Get the number of records in depositDateHistory
    const depositCount = tenant.deposits.depositDateHistory.length;
    tenant.deposits.depositDate = depositDate;
    tenant.deposits.depositDateHistory.push({
      date: depositDate,
      referenceNoUsed: referenceNo,
      amount: parseFloat(remainingAmount),
      description: `Deposit #${depositCount + 1}: Total amount of ${parseFloat(
        remainingAmount
      )}`,
    });
    tenant.deposits.referenceNo = referenceNo;

    // Allocate to rent deposit first
    if (remainingAmount > 0) {
      rentDepositAmount = Math.min(
        remainingAmount,
        parseFloat(houseRentDeposit)
      );
      remainingAmount -= rentDepositAmount;
    }

    // Record rent deposit transaction and potential deficit
    const rentDepositDeficit = houseRentDeposit - rentDepositAmount;
    if (rentDepositAmount > 0) {
      tenant.deposits.rentDeposit += rentDepositAmount;
      tenant.deposits.rentDepositHistory.push({
        date: depositDate,
        amount: rentDepositAmount,
        referenceNo,
        previousAmount: tenant.deposits.rentDeposit - rentDepositAmount,
      });
      // Add rent deposit to the main depositHistory
      tenant.depositHistory.push({
        date: depositDate,
        amount: rentDepositAmount,
        type: 'rentDeposit',
        referenceNo,
      });
    }
    if (rentDepositDeficit > 0) {
      tenant.deposits.rentDepositDeficit += rentDepositDeficit;
      tenant.deposits.rentDepositDeficitHistory.push({
        date: depositDate,
        amount: rentDepositDeficit,
        description: 'Rent deposit deficit recorded',
      });
    }

    // Allocate to water deposit next
    if (remainingAmount > 0) {
      waterDepositAmount = Math.min(
        remainingAmount,
        parseFloat(houseWaterDeposit)
      );
      remainingAmount -= waterDepositAmount;
    }

    // Record water deposit transaction and potential deficit
    const waterDepositDeficit = houseWaterDeposit - waterDepositAmount;
    if (waterDepositAmount > 0) {
      tenant.deposits.waterDeposit += waterDepositAmount;
      tenant.deposits.waterDepositHistory.push({
        date: depositDate,
        amount: waterDepositAmount,
        referenceNo,
        previousAmount: tenant.deposits.waterDeposit - waterDepositAmount,
      });
      // Add water deposit to the main depositHistory
      tenant.depositHistory.push({
        date: depositDate,
        amount: waterDepositAmount,
        type: 'waterDeposit',
        referenceNo,
      });
    }
    if (waterDepositDeficit > 0) {
      tenant.deposits.waterDepositDeficit += waterDepositDeficit;
      tenant.deposits.waterDepositDeficitHistory.push({
        date: depositDate,
        amount: waterDepositDeficit,
        description: 'Water deposit deficit recorded',
      });
    }

    // Allocate to initial rent payment if deposits are fully satisfied
    if (
      tenant.deposits.rentDeposit >= houseRentDeposit &&
      tenant.deposits.waterDeposit >= houseWaterDeposit
    ) {
      if (remainingAmount > 0) {
        initialRentPayment = Math.min(remainingAmount, requiredInitialRent);
        remainingAmount -= initialRentPayment;

        // Record initial rent payment transaction and potential deficit
        const initialRentPaymentDeficit =
          requiredInitialRent - initialRentPayment;
        if (initialRentPayment > 0) {
          tenant.deposits.initialRentPayment += initialRentPayment;
          tenant.deposits.initialRentPaymentHistory.push({
            date: depositDate,
            amount: initialRentPayment,
            referenceNo,
            previousAmount:
              tenant.deposits.initialRentPayment - initialRentPayment,
          });
          // Add initial rent payment to the main depositHistory
          tenant.depositHistory.push({
            date: depositDate,
            amount: initialRentPayment,
            type: 'initialRentPayment',
            referenceNo,
          });
        }
        if (initialRentPaymentDeficit > 0) {
          tenant.deposits.initialRentPaymentDeficit +=
            initialRentPaymentDeficit;
          tenant.deposits.initialRentPaymentDeficitHistory.push({
            date: depositDate,
            amount: initialRentPaymentDeficit,
            description: 'Initial rent payment deficit recorded',
          });
        }
      }

      // Handle excess amount
      excessAmount = remainingAmount; // This can be 0 or more
      tenant.excessAmount += excessAmount;
      tenant.excessHistory.push({
        date: depositDate,
        amount: excessAmount,
        description: 'Excess recorded before payment creation',
      });

      const formattedPlacementDate = new Date(tenant.placementDate);

      // This section contains the main change
      // Changed logic for checking whether deposits and initial rent are fully satisfied or greater
      if (
        tenant.deposits.rentDeposit >= houseRentDeposit && // Ensure rent deposit is fully paid or more
        tenant.deposits.waterDeposit >= houseWaterDeposit && // Ensure water deposit is fully paid or more
        tenant.deposits.initialRentPayment >= requiredInitialRent // Ensure initial rent payment is fully paid or more
      ) {
        // Create a payment record with the initial rent payment and any excess amount
        await createPaymentRecord(
          tenantId,
          initialRentPayment + excessAmount, // No change here
          formattedPlacementDate, // No change here
          referenceNo // No change here
        );

        // After payment is created, update the excess amount to 0
        tenant.excessAmount = 0;
        tenant.excessHistory.push({
          date: depositDate,
          amount: 0,
          description: 'Excess used up after payment creation',
        });
      }
    } else {
      // Deposits are not satisfied, record the full deficit for initial rent payment
      const fullInitialRentDeficit = requiredInitialRent;

      // Record the deficit
      tenant.deposits.initialRentPaymentDeficit += fullInitialRentDeficit;
      tenant.deposits.initialRentPaymentDeficitHistory.push({
        date: depositDate,
        amount: fullInitialRentDeficit,
        description:
          'Full initial rent payment deficit due to insufficient deposits',
      });
    }

    // Update the clearance status
    const totalPaidDeposit =
      tenant.deposits.rentDeposit +
      tenant.deposits.waterDeposit +
      tenant.deposits.initialRentPayment;
    const shortfall = totalRequiredDeposit - totalPaidDeposit;

    tenant.deposits.isCleared = shortfall <= 0;

    // Record the total deposit transaction
    tenant.depositHistory.push({
      date: depositDate,
      amount: parseFloat(totalAmount),
      type: 'totalDeposit',
      referenceNo,
    });

    // Save the tenant document with updated deposit details
    await tenant.save();
    res.status(200).json({ message: 'Deposits updated successfully.', tenant });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//update the deposit with individual deposits amount
export const updateWithIndividualDepoAmount = async (req, res) => {
  const {
    tenantId,
    totalAmount: paymentAmount,
    paymentDate: depositDate,
    referenceNumber: referenceNo,
  } = req.body;

  try {
    // Validate inputs
    if (!paymentAmount || !depositDate || !referenceNo) {
      return res.status(400).json({ message: 'All fields must be filled!' });
    }
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ message: 'Invalid ID provided!' });
    }

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return res
        .status(404)
        .json({ success: false, message: 'Tenant not found' });
    }

    const { houseDetails, deposits } = tenant;
    let remainingPayment = parseFloat(paymentAmount);

    // Update depositDate and referenceNo in main record
    // Get the number of records in depositDateHistory
    const depositCount = tenant.deposits.depositDateHistory.length;
    tenant.deposits.depositDate = depositDate;
    tenant.deposits.depositDateHistory.push({
      date: depositDate,
      referenceNoUsed: referenceNo,
      amount: parseFloat(remainingPayment),
      description: `Deposit #${depositCount + 1}: Total amount of ${parseFloat(
        remainingPayment
      )}`,
    });
    tenant.deposits.referenceNo = referenceNo;

    // Step 1: Handle Rent Deposit
    if (deposits.rentDepositDeficit > 0) {
      const requiredAmount = Math.min(
        deposits.rentDepositDeficit,
        remainingPayment
      );
      deposits.rentDeposit += parseFloat(requiredAmount);
      deposits.rentDepositDeficit -= parseFloat(requiredAmount);
      remainingPayment -= parseFloat(requiredAmount);

      deposits.rentDepositHistory.push({
        date: depositDate,
        amount: parseFloat(requiredAmount),
        previousAmount: parseFloat(deposits.rentDeposit - requiredAmount),
        referenceNo: referenceNo || '',
      });

      tenant.depositHistory.push({
        date: depositDate,
        amount: parseFloat(requiredAmount),
        type: 'rentDeposit',
        referenceNo: referenceNo || '',
      });

      // Check if rentDeposit is fully satisfied
      if (deposits.rentDeposit < houseDetails.rentDeposit) {
        deposits.rentDepositDeficit =
          parseFloat(houseDetails.rentDeposit) - deposits.rentDeposit;
        deposits.rentDepositDeficitHistory.push({
          date: depositDate,
          amount: parseFloat(deposits.rentDepositDeficit),
          description: 'Remaining rent deposit deficit after partial payment',
        });
      } else {
        deposits.rentDepositDeficit = 0;
        deposits.rentDepositDeficitHistory.push({
          date: depositDate,
          amount: 0,
          description: 'Rent deposit fully satisfied',
        });
      }
    }

    // Step 2: Handle Water Deposit
    if (remainingPayment > 0 && deposits.waterDepositDeficit > 0) {
      const requiredAmount = Math.min(
        deposits.waterDepositDeficit,
        remainingPayment
      );
      deposits.waterDeposit += parseFloat(requiredAmount);
      deposits.waterDepositDeficit -= parseFloat(requiredAmount);
      remainingPayment -= parseFloat(requiredAmount);

      deposits.waterDepositHistory.push({
        date: depositDate,
        amount: parseFloat(requiredAmount),
        previousAmount: parseFloat(deposits.waterDeposit - requiredAmount),
        referenceNo: referenceNo || '',
      });

      tenant.depositHistory.push({
        date: depositDate,
        amount: parseFloat(requiredAmount),
        type: 'waterDeposit',
        referenceNo: referenceNo || '',
      });

      // Check if waterDeposit is fully satisfied
      if (deposits.waterDeposit < houseDetails.waterDeposit) {
        deposits.waterDepositDeficit =
          parseFloat(houseDetails.waterDeposit) - deposits.waterDeposit;
        deposits.waterDepositDeficitHistory.push({
          date: depositDate,
          amount: parseFloat(deposits.waterDepositDeficit),
          description: 'Remaining water deposit deficit after partial payment',
        });
      } else {
        deposits.waterDepositDeficit = 0;
        deposits.waterDepositDeficitHistory.push({
          date: depositDate,
          amount: 0,
          description: 'Water deposit fully satisfied',
        });
      }
    }

    // Step 3: Handle Initial Rent Payment
    if (remainingPayment > 0) {
      // Check if there's a deficit in initialRentPayment
      if (deposits.initialRentPaymentDeficit > 0) {
        const requiredAmount = Math.min(
          deposits.initialRentPaymentDeficit,
          remainingPayment
        );
        deposits.initialRentPayment += parseFloat(requiredAmount);
        deposits.initialRentPaymentDeficit -= parseFloat(requiredAmount);
        remainingPayment -= parseFloat(requiredAmount);

        deposits.initialRentPaymentHistory.push({
          date: depositDate,
          amount: parseFloat(requiredAmount),
          previousAmount: parseFloat(
            deposits.initialRentPayment - requiredAmount
          ),
          referenceNo: referenceNo || '',
        });

        tenant.depositHistory.push({
          date: depositDate,
          amount: parseFloat(requiredAmount),
          type: 'initialRentPayment',
          referenceNo: referenceNo || '',
        });

        // Check if initialRentPayment is fully satisfied
        if (deposits.initialRentPayment < houseDetails.rent) {
          deposits.initialRentPaymentDeficit =
            parseFloat(houseDetails.rent) - deposits.initialRentPayment;
          deposits.initialRentPaymentDeficitHistory.push({
            date: depositDate,
            amount: parseFloat(deposits.initialRentPaymentDeficit),
            description:
              'Remaining initial rent payment deficit after partial payment',
          });
        } else {
          deposits.initialRentPaymentDeficit = 0;
          deposits.initialRentPaymentDeficitHistory.push({
            date: depositDate,
            amount: 0,
            description: 'Initial rent payment fully satisfied',
          });
        }
      } else if (deposits.initialRentPayment < houseDetails.rent) {
        const requiredAmount = Math.min(
          parseFloat(houseDetails.rent) - deposits.initialRentPayment,
          remainingPayment
        );
        deposits.initialRentPayment += parseFloat(requiredAmount);
        remainingPayment -= parseFloat(requiredAmount);

        deposits.initialRentPaymentHistory.push({
          date: depositDate,
          amount: parseFloat(requiredAmount),
          previousAmount: parseFloat(
            deposits.initialRentPayment - requiredAmount
          ),
          referenceNo: referenceNo || '',
        });

        tenant.depositHistory.push({
          date: depositDate,
          amount: parseFloat(requiredAmount),
          type: 'initialRentPayment',
          referenceNo: referenceNo || '',
        });

        // Check if initialRentPayment is fully satisfied after this payment
        if (deposits.initialRentPayment < houseDetails.rent) {
          deposits.initialRentPaymentDeficit =
            parseFloat(houseDetails.rent) - deposits.initialRentPayment;
          deposits.initialRentPaymentDeficitHistory.push({
            date: depositDate,
            amount: parseFloat(deposits.initialRentPaymentDeficit),
            description:
              'Remaining initial rent payment deficit after partial payment',
          });
        } else {
          deposits.initialRentPaymentDeficit = 0;
          deposits.initialRentPaymentDeficitHistory.push({
            date: depositDate,
            amount: 0,
            description: 'Initial rent payment fully satisfied',
          });
        }
      }
    }

    // Step 4: Handle Excess Amount
    if (remainingPayment > 0) {
      tenant.excessAmount += parseFloat(remainingPayment);
      tenant.excessHistory.push({
        date: depositDate,
        amount: parseFloat(remainingPayment),
        description: 'Excess payment after fulfilling all deficits',
      });
      remainingPayment = 0;
    }

    // Calculate total amount for payment record
    const totalAmount =
      parseFloat(deposits.initialRentPayment) + parseFloat(tenant.excessAmount);

    // Step 5: Record the Payment
    console.log('tenantId: ', tenantId);
    console.log('totalAmount: ', totalAmount);
    console.log('depositDate: ', depositDate);
    console.log('referenceNo: ', referenceNo);

    const formattedPlacementDate = new Date(tenant.placementDate);

    // Update isCleared field and add global record of totals
    tenant.deposits.isCleared =
      deposits.rentDeposit >= houseDetails.rentDeposit &&
      deposits.waterDeposit >= houseDetails.waterDeposit &&
      deposits.initialRentPayment >= houseDetails.rent;

    if (tenant.deposits.isCleared) {
      await createPaymentRecord(
        tenantId,
        totalAmount,
        formattedPlacementDate,
        referenceNo
      );
    }

    // Reset the excessAmount after processing payment
    tenant.excessAmount = 0;
    tenant.excessHistory.push({
      date: depositDate,
      amount: 0,
      description:
        'Excess amount recorded after covering deficits and creating payment',
    });

    const totalDepositAmount =
      parseFloat(deposits.rentDeposit) +
      parseFloat(deposits.waterDeposit) +
      parseFloat(deposits.initialRentPayment);

    tenant.depositHistory.push({
      date: depositDate,
      amount: parseFloat(totalDepositAmount),
      type: 'totalDeposit',
      referenceNo: referenceNo || '',
    });

    // Final Step: Save the tenant's updated details
    await tenant.save();

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      tenant,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Error processing payment', error });
  }
};

//update the deposit with multiple deposits amounts
// export const updateWithMultipleDeposits = async (req, res) => {};

// Get all tenants with incomplete deposits
export const tenantsWithIncompleteDeposits = async (req, res) => {
  try {
    // Query to find tenants where deposits.isCleared is false
    const tenants = await Tenant.find({ 'deposits.isCleared': false });

    // Return the list of tenants with incomplete deposits
    res.status(200).json({ success: true, tenants });
  } catch (error) {
    // Handle any errors that occur during the query
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Tenants
export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({
      'deposits.isCleared': true,
      toBeCleared: false,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getListAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({
      'deposits.isCleared': true,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all to be cleared Tenants
export const getToBeClearedTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({
      'deposits.isCleared': true,
      toBeCleared: true,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a Tenant by ID
export const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Tenant by ID
export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, ...req.body, {
      new: true,
      runValidators: true,
    });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.status(200).json(tenant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//update Tenant's HouseDetails rent and garbage Fee
export const updateTenantHouseDetails = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const { rentDefault, garbageDefault } = req.body;

    // Validate input
    if (rentDefault === undefined || garbageDefault === undefined) {
      return res.status(400).json({ message: 'All fields must be filled!' });
    }

    // Check if both values are numbers and non-negative
    if (isNaN(rentDefault) || isNaN(garbageDefault)) {
      return res
        .status(400)
        .json({ message: 'Rent and Garbage Fee must be valid numbers!' });
    }

    const rent = parseFloat(rentDefault);
    const garbageFee = parseFloat(garbageDefault);

    if (rent < 0 || garbageFee < 0) {
      return res
        .status(400)
        .json({ message: 'Rent and Garbage Fee must be non-negative values!' });
    }

    // Find tenant
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'No Tenant Found!' });
    }

    // Update tenant details
    tenant.houseDetails.rent = rent;
    tenant.houseDetails.garbageFee = garbageFee;

    await tenant.save();
    res.status(200).json(tenant);
  } catch (error) {
    console.error('Error updating tenant house details:', error); // Add error logging
    res.status(500).json({
      message: 'An error occurred while updating tenant house details.',
    });
  }
};

// Delete a Tenant by ID
export const deleteTenant = async (req, res) => {
  const id = req.params.id;

  // Validate ID
  if (!id) {
    return res.status(400).json({ message: 'No ID provided!' });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID provided!' });
  }

  try {
    // 1. Find the tenant by ID
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found!' });
    }

    // 2. Delete all payment records associated with the tenant
    const deleteResult = await Payment.deleteMany({ tenant: tenant._id });
    const paymentsDeleted = deleteResult.deletedCount; // Number of payments deleted

    // Log the number of deleted payments for tracking
    console.log(
      `${paymentsDeleted} payment(s) deleted for tenant ${tenant._id}`
    );

    // 3. Find the tenant's house by houseName and houseNo from tenant's houseDetails
    const houseNo = tenant.houseDetails.houseNo;
    const apartmentId = tenant.apartmentId;
    console.log('hoiseNo: ', houseNo);
    let houseName = 'House ' + houseNo;
    const house = await House.findOne({
      houseName: houseName,
      apartment: apartmentId,
    });
    if (!house) {
      return res.status(404).json({ message: 'House not found!' });
    }

    //check if there is an invoice related to the tenant:
    const deletedInvoice = await Invoice.deleteMany({ tenant: tenant._id });
    const invoicesDeleted = deletedInvoice.deletedCount;
    console.log(`Deelted Invoices: `, invoicesDeleted);

    // 4. Set the isOccupied flag of the house to false
    house.isOccupied = false;
    await house.save();

    // 5. Delete the tenant
    await tenant.deleteOne();

    // Return success response, including the number of payments deleted
    res.status(200).json({
      message: `Tenant and related records deleted successfully. ${paymentsDeleted} payment(s) deleted.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

//check if tenant has any payment records
export const checkTenantPaymentRecord = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const tenantPayments = await Payment.find({ tenant: tenantId });
    if (!tenantPayments) {
      return res
        .status(404)
        .json({ message: 'No payments for this Tenant', status: false });
    }

    res.status(200).json({ tenantPayments, status: true });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Controller to fetch the most recent payment made by a tenant using tenant ID
export const getMostRecentPaymentByTenantId = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Find the most recent payment for the tenant, sorted by the creation date
    const mostRecentPayment = await Payment.find({ tenant: tenantId })
      .sort({ createdAt: -1 })
      .populate('tenant');

    if (!mostRecentPayment) {
      return res.status(404).json({
        message: 'No payment record found for this tenant.',
      });
    }

    // Return the most recent payment data
    return res.status(200).json({
      message: 'Most recent payment fetched successfully.',
      mostRecentPayment,
    });
  } catch (error) {
    console.error('Error fetching recent payment:', error);
    return res.status(500).json({
      message: 'Server error while fetching the most recent payment.',
      error: error.message,
    });
  }
};

// clear tenant
export const clearTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { date, waterBill, garbageFee, extraCharges } = req.body;

  try {
    // Convert the date to a JavaScript Date object and Extract the month and year
    const parsedDate = new Date(date);
    const month = parsedDate.toLocaleString('default', { month: 'long' });
    const year = parsedDate.getFullYear();

    // Fetch tenant by ID
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Check if there are any previous uncleared payments
    const mostRecentPayment = await Payment.find({
      tenant: tenantId,
      isCleared: false,
    });
    if (mostRecentPayment.length > 0) {
      return res.status(404).json({
        message: 'Complete pending payments to clear Tenant',
        mostRecentPayment,
      });
    }

    // Retrieve tenant's water and rent deposits
    let { waterDeposit, rentDeposit } = tenant.deposits;

    // Check if there is any previous (last) payment overpay value
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
    if (previousPayment) {
      if (parseFloat(previousPayment.overpay) > 0) {
        waterDeposit =
          parseFloat(waterDeposit) + parseFloat(previousPayment.overpay);
        previousPayment.excessHistory.push({
          initialOverpay: previousPayment.overpay,
          excessAmount: 0,
          description: `Excess Amount of ${previousPayment.overpay} added to waterDeposit to be used in clearing Tenant`,
          date,
        });
        previousPayment.overpay = 0;
        await previousPayment.save();
      }
    }

    // Start creating a new payment record
    const payment = new Payment({
      tenant: tenant._id,
      month,
      year,
      rent: {
        amount: 0,
        paid: true,
      },
      waterBill: {
        accumulatedAmount: parseFloat(waterBill) || 0, // Ensure it's a number
        amount: 0,
        paid: false,
        transactions: [],
        deficitHistory: [],
      },
      garbageFee: {
        amount: parseFloat(garbageFee) || 0, // Ensure it's a number
        paid: false,
        transactions: [],
        deficitHistory: [],
      },
      extraCharges: {
        expected: parseFloat(extraCharges) || 0, // Ensure it's a number
        amount: 0,
        paid: false,
        transactions: [],
        deficitHistory: [],
      },
      isCleared: false,
      totalAmountPaid: 0,
    });

    payment.referenceNumber = tenant.deposits.referenceNo;

    // Handle Water Bill first
    let waterBillDeficit = 0;
    let amountUsedForWaterBill = 0;

    // Deduct from the water deposit first for the water bill
    if (parseFloat(waterDeposit) >= parseFloat(waterBill)) {
      payment.waterBill.amount = parseFloat(waterBill); // Fully covered by water deposit
      payment.waterBill.paid = true;
      amountUsedForWaterBill = parseFloat(waterBill);
      tenant.deposits.waterDeposit -= amountUsedForWaterBill; // Ensure the value is a number
    } else {
      // Partial payment from water deposit, the rest will be paid from rent deposit
      payment.waterBill.amount = parseFloat(waterDeposit);
      waterBillDeficit = parseFloat(waterBill) - parseFloat(waterDeposit);
      amountUsedForWaterBill = parseFloat(waterDeposit);
      tenant.deposits.waterDeposit = 0;
      payment.waterBill.deficit = waterBillDeficit;

      // Use rent deposit for the remaining deficit
      if (parseFloat(rentDeposit) >= waterBillDeficit) {
        tenant.deposits.rentDeposit -= waterBillDeficit; // Ensure the value is a number
        payment.waterBill.amount += waterBillDeficit; // Fully covered by rent deposit now
        payment.waterBill.paid = true;
        waterBillDeficit = 0; // No deficit left
      } else {
        // Rent deposit is not enough, record the remaining deficit
        payment.waterBill.amount += parseFloat(rentDeposit);
        waterBillDeficit -= parseFloat(rentDeposit);
        tenant.deposits.rentDeposit = 0;
        payment.waterBill.paid = false;
        // Add deficit record for water bill
        payment.waterBill.deficitHistory.push({
          date,
          amount: waterBillDeficit,
          description: `Water bill deficit for ${month}/${year}`,
        });
      }
    }

    // Record the water bill transaction
    payment.waterBill.transactions.push({
      date,
      accumulatedAmount: parseFloat(waterBill), // Ensure it's a number
      amount: payment.waterBill.amount,
      referenceNumber: tenant.deposits.referenceNo,
      description: `Water bill of ${waterBill} for ${month}/${year} covered partially/fully`,
    });

    // Add the water deposit usage history
    tenant.deposits.waterDepositHistory.push({
      date,
      amount: amountUsedForWaterBill,
      referenceNo: tenant.deposits.referenceNo,
      previousAmount: waterDeposit,
    });

    // If rent deposit was used, record the rent deposit usage
    if (amountUsedForWaterBill < parseFloat(waterBill)) {
      const amountUsedFromRentDeposit =
        parseFloat(waterBill) - amountUsedForWaterBill;
      tenant.deposits.rentDepositHistory.push({
        date,
        amount: amountUsedFromRentDeposit,
        referenceNo: tenant.deposits.referenceNo,
        previousAmount: rentDeposit,
      });
    }

    // Handle Garbage Fee
    let amountUsedForGarbage = 0;

    // First, try using the remaining water deposit for the garbage fee
    if (parseFloat(tenant.deposits.waterDeposit) >= parseFloat(garbageFee)) {
      payment.garbageFee.amount = parseFloat(garbageFee); // Fully covered by water deposit
      amountUsedForGarbage = parseFloat(garbageFee);
      payment.garbageFee.paid = true;
      tenant.deposits.waterDeposit -= amountUsedForGarbage; // Ensure the value is a number
    } else {
      // Use up the remaining water deposit, move to rent deposit if necessary
      amountUsedForGarbage = parseFloat(tenant.deposits.waterDeposit);
      payment.garbageFee.amount = amountUsedForGarbage;
      tenant.deposits.waterDeposit = 0;

      // Use rent deposit for the remaining garbage fee
      let garbageFeeDeficit = parseFloat(garbageFee) - amountUsedForGarbage;
      if (parseFloat(rentDeposit) >= garbageFeeDeficit) {
        tenant.deposits.rentDeposit -= garbageFeeDeficit; // Ensure the value is a number
        payment.garbageFee.amount += garbageFeeDeficit; // Fully covered now
        payment.garbageFee.paid = true;
        garbageFeeDeficit = 0;
      } else {
        // Rent deposit is also insufficient
        payment.garbageFee.amount += parseFloat(rentDeposit);
        garbageFeeDeficit -= parseFloat(rentDeposit);
        tenant.deposits.rentDeposit = 0;
        payment.garbageFee.deficit = garbageFeeDeficit;
        payment.garbageFee.paid = false;

        // Add deficit record for garbage fee
        payment.garbageFee.deficitHistory.push({
          date,
          amount: garbageFeeDeficit,
          description: `Garbage fee deficit of ${garbageFeeDeficit} for ${month}/${year}`,
        });
      }
    }

    // Record garbage fee transaction
    payment.garbageFee.transactions.push({
      date,
      amount: payment.garbageFee.amount,
      referenceNumber: tenant.deposits.referenceNo,
      description: `Garbage fee of ${garbageFee} for ${month}/${year} covered partially/fully`,
    });

    // Add water deposit history for garbage fee usage (if any)
    if (amountUsedForGarbage > 0) {
      tenant.deposits.waterDepositHistory.push({
        date,
        amount: amountUsedForGarbage,
        referenceNo: tenant.deposits.referenceNo,
        previousAmount: waterDeposit,
      });
    }

    // If rent deposit was used for garbage fee, record the rent deposit usage
    if (payment.garbageFee.amount > amountUsedForGarbage) {
      const amountUsedFromRentDepositForGarbage =
        payment.garbageFee.amount - amountUsedForGarbage;
      tenant.deposits.rentDepositHistory.push({
        date,
        amount: amountUsedFromRentDepositForGarbage,
        referenceNo: tenant.deposits.referenceNo,
        previousAmount: rentDeposit,
      });
    }

    // Handle Extra Charges
    let amountUsedForExtraCharges = 0;

    // Try using any remaining water deposit for extra charges
    if (parseFloat(tenant.deposits.waterDeposit) >= parseFloat(extraCharges)) {
      payment.extraCharges.amount = parseFloat(extraCharges); // Fully covered by water deposit
      amountUsedForExtraCharges = parseFloat(extraCharges);
      payment.extraCharges.paid = true;
      tenant.deposits.waterDeposit -= amountUsedForExtraCharges; // Ensure the value is a number
    } else {
      // Use the remaining water deposit first
      amountUsedForExtraCharges = parseFloat(tenant.deposits.waterDeposit);
      payment.extraCharges.amount = amountUsedForExtraCharges;
      tenant.deposits.waterDeposit = 0;

      // Use rent deposit for the remaining extra charges
      let extraChargesDeficit =
        parseFloat(extraCharges) - amountUsedForExtraCharges;
      if (parseFloat(rentDeposit) >= extraChargesDeficit) {
        tenant.deposits.rentDeposit -= extraChargesDeficit; // Ensure the value is a number
        payment.extraCharges.amount += extraChargesDeficit; // Fully covered now
        payment.extraCharges.paid = true;
        extraChargesDeficit = 0;
      } else {
        // Rent deposit is also insufficient
        payment.extraCharges.amount += parseFloat(rentDeposit);
        extraChargesDeficit -= parseFloat(rentDeposit);
        tenant.deposits.rentDeposit = 0;
        payment.extraCharges.paid = false;
        payment.extraCharges.deficit = parseFloat(extraChargesDeficit);

        // Add deficit record for extra charges
        payment.extraCharges.deficitHistory.push({
          date,
          amount: parseFloat(extraChargesDeficit),
          description: `Extra charges deficit of ${extraChargesDeficit} for ${month}/${year}`,
        });
      }
    }

    // Record the transaction for extra charges
    payment.extraCharges.transactions.push({
      date,
      amount: parseFloat(payment.extraCharges.amount),
      expected: payment.extraCharges.expected,
      referenceNumber: tenant.deposits.referenceNo,
      description: `Extra charges of ${extraCharges} for ${month}/${year} covered partially/fully`,
    });

    // If any deposits were used, add them to the history
    if (parseFloat(amountUsedForExtraCharges) > 0) {
      tenant.deposits.waterDepositHistory.push({
        date,
        amount: parseFloat(amountUsedForExtraCharges),
        referenceNo: tenant.deposits.referenceNo,
        previousAmount: waterDeposit,
      });
    }

    // If rent deposit was used for extra charges, record that usage
    if (payment.extraCharges.amount > amountUsedForExtraCharges) {
      const amountUsedFromRentDepositForExtraCharges =
        payment.extraCharges.amount - amountUsedForExtraCharges;
      tenant.deposits.rentDepositHistory.push({
        date,
        amount: parseFloat(amountUsedFromRentDepositForExtraCharges),
        referenceNo: tenant.deposits.referenceNo,
        previousAmount: rentDeposit,
      });
    }

    //calculate global deficit amount
    const globalDeficitpayment =
      parseFloat(waterBill.deficit) ||
      0 + parseFloat(garbageFee.deficit) ||
      0 + parseFloat(extraCharges.deficit) ||
      0;

    if (parseFloat(globalDeficitpayment) > 0) {
      payment.globalDeficit = globalDeficitpayment;
      payment.globalDeficitHistory.push({
        year: payment.year,
        month: payment.month,
        totalDeficitAmount: payment.globalDeficit,
        description: `Global deficit found when clearing Tenant `,
      });
    }

    // Calculate total amount paid
    const globalTotalAmountPaid =
      (parseFloat(payment.waterBill.amount) || 0) +
      (parseFloat(payment.garbageFee.amount) || 0) +
      (parseFloat(payment.extraCharges.amount) || 0);

    console.log('globalTotalAmountPaid: ', globalTotalAmountPaid);
    payment.totalAmountPaid = parseFloat(globalTotalAmountPaid);
    //add global transaction
    payment.globalTransactionHistory.push({
      year: payment.year,
      month: payment.month,
      totalRentAmount: payment.rent.amount,
      totalWaterAmount: payment.waterBill.amount,
      totalGarbageFee: payment.garbageFee.amount,
      totalAmount: parseFloat(globalTotalAmountPaid).toFixed(2),
      referenceNumber: tenant.deposits.referenceNo,
      globalDeficit: payment.globalDeficit,
    });

    //add reference number history
    const paymentCount = previousPayment.referenceNoHistory.length;
    payment.referenceNoHistory.push({
      date,
      previousRefNo: tenant.deposits.referenceNo,
      referenceNoUsed: tenant.deposits.referenceNo,
      amount: payment.totalAmountPaid,
      description: `Payment record number of tinkering:#${
        paymentCount + 1
      } doneIn Clear Tenant`,
    });

    //update the isCleared Boolean value
    payment.isCleared =
      payment.rent.paid &&
      payment.waterBill.paid &&
      payment.garbageFee.paid &&
      payment.extraCharges.paid;

    // Mark the tenant to be cleared
    tenant.toBeCleared = true;

    // Record the payment and update tenant's deposits
    await payment.save();
    await tenant.save();

    // Calculate the scheduled time (48 hours from now)
    const scheduledTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const scheduledHour = scheduledTime.getUTCHours();
    const scheduledMinute = scheduledTime.getUTCMinutes();

    // Save the scheduled job in the database
    await ScheduledJob.findOneAndUpdate(
      { tenantId },
      { scheduledTime, isActive: true },
      { upsert: true } // Create a new record if no match is found
    );

    // Schedule the deletion job using cron
    const job = cron.schedule(
      `${scheduledMinute} ${scheduledHour} * * *`, // Cron expression
      async () => {
        console.log(`Running tenant deletion job for tenant ${tenantId}...`);
        await deleteTenantById(tenantId);
        job.stop(); // Stop the job after executing
      },
      {
        scheduled: true,
        timezone: 'UTC',
      }
    );

    res.status(200).json({
      message: 'Tenant cleared successfully',
      payment,
      tenant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error clearing tenant', error });
  }
};

// Function to check payments and delete a specific tenant
const deleteTenantById = async (tenantId) => {
  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      console.error(`Tenant ${tenantId} not found.`);
      return { success: false, message: `Tenant ${tenantId} not found.` };
    }

    // Check if the tenant has any pending payments
    const pendingPayments = await Payment.find({
      tenantId: tenant._id,
      isCleared: false,
    });

    if (pendingPayments.length > 0) {
      console.error(
        `Tenant ${tenantId} has pending payments:`,
        pendingPayments
      );
      return {
        success: false,
        message: `Tenant ${tenantId} has pending payments.`,
      };
    }

    // 1. Delete all payment records associated with the tenant
    const deleteResult = await Payment.deleteMany({ tenant: tenant._id });
    const paymentsDeleted = deleteResult.deletedCount; // Number of payments deleted

    // Log the number of deleted payments for tracking
    console.log(
      `${paymentsDeleted} payment(s) deleted for tenant ${tenant._id}`
    );

    // 2. Find the tenant's house by houseName and houseNo from tenant's houseDetails
    const houseNo = tenant.houseDetails.houseNo;
    const apartmentId = tenant.apartmentId;
    console.log('houseNo: ', houseNo);
    let houseName = 'House ' + houseNo;
    const house = await House.findOne({
      houseName: houseName,
      apartment: apartmentId,
    });
    if (!house) {
      console.error(`House ${houseName} not found for tenant ${tenantId}.`);
      return { success: false, message: 'House not found!' };
    }

    //check if there is an invoice related to the tenant:
    const deletedInvoice = await Invoice.deleteMany({ tenant: tenant._id });
    const invoicesDeleted = deletedInvoice.deletedCount;
    console.log(`Deelted Invoices: `, invoicesDeleted);

    // 3. Set the isOccupied flag of the house to false
    house.isOccupied = false;
    await house.save();

    // If no pending payments, delete the tenant
    await Tenant.deleteOne({ _id: tenantId });
    console.log(`Tenant ${tenantId} deleted.`);

    // Mark the job as inactive in the database
    await ScheduledJob.findOneAndUpdate({ tenantId }, { isActive: false });

    return {
      success: true,
      message: `Tenant ${tenantId} deleted successfully.`,
    };
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return { success: false, message: 'Error deleting tenant.', error };
  }
};

// Function to restore scheduled jobs on application startup
export const restoreScheduledJobs = async () => {
  const scheduledJobs = await ScheduledJob.find({ isActive: true });

  for (const job of scheduledJobs) {
    const timeDiff = job.scheduledTime - new Date();
    if (timeDiff > 0) {
      const scheduledHour = job.scheduledTime.getUTCHours();
      const scheduledMinute = job.scheduledTime.getUTCMinutes();
      cron.schedule(
        `${scheduledMinute} ${scheduledHour} * * *`,
        async () => {
          console.log(
            `Restoring tenant deletion job for tenant ${job.tenantId}...`
          );
          const result = await deleteTenantById(job.tenantId);
          if (!result.success) {
            console.error(
              `Failed to delete tenant ${job.tenantId}: ${result.message}`
            );
          }
        },
        {
          scheduled: true,
          timezone: 'UTC',
        }
      );
    } else {
      // If the scheduled time has already passed, we should delete the tenant immediately
      const result = await deleteTenantById(job.tenantId);
      if (!result.success) {
        console.error(
          `Failed to delete tenant ${job.tenantId}: ${result.message}`
        );
      }
    }
  }
};

// Call restore function on application startup
restoreScheduledJobs();
