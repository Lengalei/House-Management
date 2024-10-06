import Invoice from '../../../models/v2/models/Invoice.js';
import Payment from '../../../models/v2/models/v2Payment.model.js';

// create invoice
export const createInvoice = async (req, res) => {
  const {
    invoiceNumber,
    clientData,
    HouseNo,
    items,
    totalAmount,
    tenantId,
    selectedPayment,
  } = req.body;

  try {
    // Find the associated payment for this invoice
    const payment = await Payment.findOne({
      _id: selectedPayment._id,
      tenant: clientData._id,
      month: selectedPayment.month,
      year: selectedPayment.year,
    });

    if (payment) {
      // Iterate over items to check for extra charges
      for (const item of items) {
        if (item.name === 'Monthly Extra Charges Transaction') {
          // Parse item price as a floating-point number to avoid string concatenation
          const extraChargeAmount = parseFloat(item.price);

          // Ensure that expected and deficit are treated as numbers
          payment.extraCharges.expected =
            parseFloat(payment.extraCharges.expected) + extraChargeAmount;
          payment.extraCharges.deficit =
            parseFloat(payment.extraCharges.deficit) + extraChargeAmount;

          // Create a new transaction for the extra charge
          payment.extraCharges.transactions.push({
            amount: 0, // Nothing paid yet
            expected: extraChargeAmount.toFixed(2), // Two decimal precision
            date: payment.referenceNoHistory[0].date,
            referenceNumber: payment.referenceNumber,
            description: `Extra charge: ${item.description}`,
          });

          // Add to the deficit history
          payment.extraCharges.deficitHistory.push({
            amount: parseFloat(payment.extraCharges.deficit).toFixed(2),
            date: payment.referenceNoHistory[0].date,
            description: `Deficit of ${item.price} from newly added extra charge: ${item.description}`,
          });

          // Update the global deficit by adding the remaining extra charge deficit
          payment.globalDeficit =
            parseFloat(payment.globalDeficit) + extraChargeAmount;

          // Add an entry to the globalDeficitHistory
          payment.globalDeficitHistory.push({
            year: payment.year,
            month: payment.month,
            totalDeficitAmount: extraChargeAmount.toFixed(2),
            description: `Remaining deficit added from extra charge: ${item.description}`,
          });

          let remainingExtraCharge = extraChargeAmount;
          // If there's an overpay, use it to reduce the deficit
          if (parseFloat(payment.overpay) > 0) {
            const overpayAvailable = parseFloat(payment.overpay);

            if (overpayAvailable >= remainingExtraCharge) {
              // Overpay fully covers the extra charge
              payment.extraCharges.amount =
                parseFloat(payment.extraCharges.amount) + remainingExtraCharge;
              payment.extraCharges.deficit =
                parseFloat(payment.extraCharges.deficit) - remainingExtraCharge;
              payment.overpay =
                parseFloat(payment.overpay) - remainingExtraCharge;

              // Log the transaction and overpay use
              payment.extraCharges.transactions.push({
                amount: remainingExtraCharge.toFixed(2),
                expected: extraChargeAmount.toFixed(2),
                date: payment.referenceNoHistory[0].date,
                referenceNumber: payment.referenceNumber,
                description: `Overpay used for extra charge: ${item.description}`,
              });

              payment.excessHistory.push({
                initialOverpay: overpayAvailable.toFixed(2),
                excessAmount: payment.overpay.toFixed(2),
                description: `Amount ${remainingExtraCharge.toFixed(
                  2
                )} used to clear extra charge: ${item.description}`,
                date: payment.referenceNoHistory[0].date,
              });

              remainingExtraCharge = 0; // Fully covered
              // Update the global deficit by adding the remaining extra charge deficit
              payment.globalDeficit =
                parseFloat(payment.globalDeficit) - extraChargeAmount;

              // Add an entry to the globalDeficitHistory
              payment.globalDeficitHistory.push({
                year: payment.year,
                month: payment.month,
                totalDeficitAmount: extraChargeAmount.toFixed(2),
                description: `Remaining deficit added from extra charge: ${item.description}`,
              });
            } else {
              // Overpay partially covers the extra charge
              payment.extraCharges.amount =
                parseFloat(payment.extraCharges.amount) + overpayAvailable;
              payment.extraCharges.deficit =
                parseFloat(payment.extraCharges.deficit) - overpayAvailable;
              payment.overpay = 0; // Used up all overpay

              // Log the transaction and overpay use
              payment.extraCharges.transactions.push({
                amount: overpayAvailable.toFixed(2),
                expected: extraChargeAmount.toFixed(2),
                date: payment.referenceNoHistory[0].date,
                referenceNumber: payment.referenceNumber,
                description: `Partial overpay used for extra charge: ${item.description}`,
              });

              payment.excessHistory.push({
                initialOverpay: overpayAvailable.toFixed(2),
                excessAmount: 0, // All overpay used
                description: `Amount ${overpayAvailable.toFixed(
                  2
                )} used to partially clear extra charge: ${item.description}`,
                date: payment.referenceNoHistory[0].date,
              });

              remainingExtraCharge -= overpayAvailable; // Still some extra charge left
            }

            // If there's still an outstanding ExtraCharge deficit after using overpay, keep it as a deficit
            if (remainingExtraCharge > 0) {
              // Update extraCharges.deficit
              payment.extraCharges.deficit =
                parseFloat(payment.extraCharges.deficit) + remainingExtraCharge;

              // Add to deficitHistory for extra charges
              payment.extraCharges.deficitHistory.push({
                amount: remainingExtraCharge.toFixed(2), // Updated deficit amount
                date: payment.referenceNoHistory[0].date,
                description: `Remaining deficit for extra charge: ${item.description}`,
              });

              // Update the global deficit by adding the remaining extra charge deficit
              payment.globalDeficit =
                parseFloat(payment.globalDeficit) + remainingExtraCharge;

              // Add an entry to the globalDeficitHistory
              payment.globalDeficitHistory.push({
                year: payment.year,
                month: payment.month,
                totalDeficitAmount: remainingExtraCharge.toFixed(2),
                description: `Remaining deficit added from extra charge: ${item.description}`,
              });
            }
          }

          // If there's still an outstanding ExtraCharge, keep it as a deficit
          // After overpay logic
          // if (remainingExtraCharge > 0) {
          //   // Update extraCharges.deficit
          //   payment.extraCharges.deficit =
          //     parseFloat(payment.extraCharges.deficit) +
          //     parseFloat(remainingExtraCharge);

          //   // Add to deficitHistory for extra charges
          //   payment.extraCharges.deficitHistory.push({
          //     amount: remainingExtraCharge.toFixed(2), // Updated deficit amount
          //     date: payment.referenceNoHistory[0].date,
          //     description: `Remaining deficit for extra charge: ${item.description}`,
          //   });

          //   // Update the global deficit by adding the remaining extra charge deficit
          //   payment.globalDeficit =
          //     parseFloat(payment.globalDeficit) + remainingExtraCharge;

          //   // Add an entry to the globalDeficitHistory
          //   payment.globalDeficitHistory.push({
          //     year: payment.year,
          //     month: payment.month,
          //     totalDeficitAmount: remainingExtraCharge.toFixed(2),
          //     description: `Remaining deficit added from extra charge: ${item.description}`,
          //   });
          // }
        }
      }

      // Save the updated payment with extra charges applied
      await payment.save();
    }

    // Create and save the new invoice
    const newInvoice = new Invoice({
      invoiceNumber,
      clientName: clientData.name,
      HouseNo,
      items,
      totalAmount: parseFloat(totalAmount).toFixed(2),
      tenant: tenantId,
      payment: selectedPayment._id,
    });

    const savedInvoice = await newInvoice.save();

    return res.status(201).json({ savedInvoice, payment });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating invoice',
      error: error.message,
    });
  }
};

// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate({
        path: 'tenant',
        select: 'name email houseDetails',
      })
      .populate('payment');

    // Sort invoices by creation date in descending order
    invoices.sort((a, b) => b.createdAt - a.createdAt);

    return res.status(200).json(invoices);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching invoices', error: error.message });
  }
};

// Get a specific invoice by ID
export const getInvoiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await Invoice.findById(id).populate('tenant'); // Populate tenant details if needed
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    return res.status(200).json(invoice);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching invoice', error: error.message });
  }
};

// Update an invoice
export const updateInvoice = async (req, res) => {
  const { id } = req.params;
  const { clientName, HouseNo, items, totalAmount, tenant, payment, isPaid } =
    req.body;

  try {
    const paymentId = payment._id;
    const tenantId = tenant._id;
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        clientName,
        HouseNo,
        items,
        totalAmount,
        tenant: tenantId,
        payment: paymentId,
        isPaid,
      },
      { new: true }
    );

    if (!updatedInvoice)
      return res.status(404).json({ message: 'Invoice not found' });
    return res.status(200).json(updatedInvoice);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error updating invoice', error: error.message });
  }
};

// Delete an invoice
export const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    if (!deletedInvoice)
      return res.status(404).json({ message: 'Invoice not found' });
    return res
      .status(200)
      .json({ message: 'Invoice deleted successfully', deletedInvoice });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Error deleting invoice',
      error: error.message,
    });
  }
};

//delete many invoices
export const deleteManyInvoices = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No invoice IDs provided' });
    }

    const result = await Invoice.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: 'No invoices found for the provided IDs' });
    }

    return res.status(200).json({
      message: `${result.deletedCount} invoice(s) deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Error deleting invoices',
      error: error.message,
    });
  }
};
