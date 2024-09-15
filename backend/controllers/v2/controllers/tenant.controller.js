import mongoose from 'mongoose';
import Tenant from '../../../models/v2/models/v2Tenant.model.js';
import { createPaymentRecord } from '../../../utils/v2/utils/paymentHelper.js';
import House from '../../../models/houses.js';
import Payment from '../../../models/v2/models/v2Payment.model.js';

// Register Tenant Details
export const createTenant = async (req, res) => {
  const {
    name,
    email,
    nationalId,
    phoneNo,
    placementDate,
    houseNo,
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
    !emergencyContactNumber ||
    !emergencyContactName
  ) {
    return res.status(400).json({ message: 'All fields required!.' });
  }

  try {
    // Check if the houseNo already exists
    const existingTenant = await Tenant.findOne({
      'houseDetails.houseNo': houseNo,
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

    let houseName = 'House' + ' ' + houseNo;
    const floorNumber = houseNo.match(/\d+/)[0]; // Extract the numeric part
    const house = await House.findOneAndUpdate(
      { floor: floorNumber, houseName },
      { isOccupied: true },
      { new: true }
    );

    console.log('house:', house);
    console.log('houseNo:', houseNo);
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

//add multiple depist values
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
    tenant.deposits.depositDate = depositDate;
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

    // Create the payment record
    await createPaymentRecord(
      tenantId,
      remainingInitialRentPayment + totalExcessDeposit,
      formattedPlacementDate,
      referenceNo
    );

    // After creating the payment, set excess to 0 and record it
    tenant.excessHistory.push({
      date: depositDate,
      amount: 0,
      description: `Excess amount of ${totalExcessDeposit} used for payment`,
    });
    tenant.excessAmount = 0;

    // Set initialRentPayment in deposits with the remaining value or the initial value if not used
    tenant.deposits.initialRentPayment = remainingInitialRentPayment;

    // Update isCleared status
    tenant.deposits.isCleared =
      tenant.deposits.rentDeposit >= tenant.houseDetails.rentDeposit &&
      tenant.deposits.waterDeposit >= tenant.houseDetails.waterDeposit;

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
    tenant.deposits.depositDate = depositDate;
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
      // Create a payment record with the initial rent payment and any excess amount
      await createPaymentRecord(
        tenantId,
        initialRentPayment + excessAmount,
        formattedPlacementDate,
        referenceNo
      );

      // After payment is created, update the excess amount to 0
      tenant.excessAmount = 0;
      tenant.excessHistory.push({
        date: depositDate,
        amount: 0,
        description: 'Excess used up after payment creation',
      });
    }

    // Update the clearance status
    const totalPaidDeposit =
      tenant.deposits.rentDeposit + tenant.deposits.waterDeposit;
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

    await createPaymentRecord(
      tenantId,
      totalAmount,
      formattedPlacementDate,
      referenceNo
    );

    // Reset the excessAmount after processing payment
    tenant.excessAmount = 0;
    tenant.excessHistory.push({
      date: depositDate,
      amount: 0,
      description:
        'Excess amount recorded after covering deficits and creating payment',
    });

    // Update isCleared field and add global record of totals
    tenant.deposits.isCleared =
      deposits.rentDeposit >= houseDetails.rentDeposit &&
      deposits.waterDeposit >= houseDetails.waterDeposit;

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
    const tenants = await Tenant.find().sort({ createdAt: -1 });
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
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.status(200).json(tenant);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    console.log('hoiseNo: ', houseNo);
    let houseName = 'House ' + houseNo;
    const house = await House.findOne({ houseName: houseName });
    if (!house) {
      return res.status(404).json({ message: 'House not found!' });
    }

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
