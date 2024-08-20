import { useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import './PaymentDetailsPage.scss';
import {
  FaMoneyBill,
  // FaWater,
  // FaTrash,
  FaReceipt,
  FaFileInvoice,
} from 'react-icons/fa';

const PaymentDetailsPage = () => {
  const location = useLocation();
  const paymentDetails = location.state?.payment || {};
  const onEntryOverPay = location.state?.onEntryOverPay || 0;
  console.log('paymentDetails: ', paymentDetails);

  const generatePDF = (content, fileName) => {
    const opt = {
      margin: 1,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().from(content).set(opt).save();
  };

  const generateReceipt = () => {
    const content = document.getElementById('receipt-content');
    generatePDF(content, 'receipt.pdf');
  };

  const generateInvoice = () => {
    const content = document.getElementById('invoice-content');
    generatePDF(content, 'invoice.pdf');
  };

  return (
    <div className="payment-details-page">
      {paymentDetails ? (
        <>
          <div className="cards-container">
            <div className="left-card">
              <div className="minicard payment-details">
                <h3>
                  <FaMoneyBill /> Payment Details
                </h3>
                <p>
                  Month: {new Date(paymentDetails.date).toLocaleDateString()}
                </p>
                <p>Rent: {paymentDetails.rent}</p>
                <p>Water Bill: {paymentDetails.waterBill}</p>
                <p>Garbage Fee: {paymentDetails.garbageFee}</p>
                <p>Extra Bills: {paymentDetails.extraBills}</p>
                <p>Total Amount: {paymentDetails.totalAmount}</p>
                <hr />
                <p>
                  Amount Paid:{' '}
                  <span className="amountPaid">
                    {paymentDetails.amountPaid}
                  </span>{' '}
                </p>
                {onEntryOverPay ? <p>On Entry Overpay {onEntryOverPay}</p> : ''}

                <p>
                  Previous Excess Pay:{' '}
                  <span className="currentExcessPay">
                    {paymentDetails.previousExcessPay}
                  </span>{' '}
                </p>
                <p>
                  Current Excess Pay:{' '}
                  <span className="currentExcessPay">
                    {paymentDetails.excessPay}
                  </span>{' '}
                </p>
                <p>
                  Previous Balance:{' '}
                  <span className="balance">
                    {' '}
                    {paymentDetails.previousBalance}
                  </span>{' '}
                </p>
                <p>
                  Balance:{' '}
                  <span className="balance">{paymentDetails.balance}</span>
                </p>
              </div>
              <div className="minicard payment-maker">
                <h3>
                  <FaReceipt /> Payment Maker
                </h3>
                <p>Name: {paymentDetails.tenantId.name}</p>
                <hr />
                <p>Email: {paymentDetails.tenantId.email}</p>
              </div>
            </div>
            <div className="right-card">
              <h3>Advanced</h3>
              <div className="button-container">
                <button className="generate-invoice" onClick={generateInvoice}>
                  <FaFileInvoice /> Generate Invoice
                </button>
                <button className="generate-receipt" onClick={generateReceipt}>
                  <FaReceipt /> Generate Receipt
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'none' }}>
            <div id="receipt-content">
              <h1>Receipt</h1>
              <p>Date: {new Date(paymentDetails.date).toLocaleDateString()}</p>
              <p>Rent: {paymentDetails.rent}</p>
              <p>Water Bill: {paymentDetails.waterBill}</p>
              <p>Garbage Fee: {paymentDetails.garbageFee}</p>
              <p>Extra Bills: {paymentDetails.extraBills}</p>
              <p>Total Amount: {paymentDetails.totalAmount}</p>
              <p>Amount Paid: {paymentDetails.amountPaid}</p>
              <p>Previous Excess Pay: {paymentDetails.previousExcessPay}</p>
              <p>Current Excess Pay: {paymentDetails.excessPay}</p>
              <p>Previous Balance: {paymentDetails.previousBalance}</p>
              <p>Balance: {paymentDetails.balance}</p>
              <h2>Payment Maker</h2>
              <p>Name: {paymentDetails.tenantId.name}</p>
              <p>Email: {paymentDetails.tenantId.email}</p>
            </div>
            <div id="invoice-content">
              <h1>Invoice</h1>
              <p>Date: {new Date(paymentDetails.date).toLocaleDateString()}</p>
              <p>Rent: {paymentDetails.rent}</p>
              <p>Water Bill: {paymentDetails.waterBill}</p>
              <p>Garbage Fee: {paymentDetails.garbageFee}</p>
              <p>Extra Bills: {paymentDetails.extraBills}</p>
              <p>Total Amount: {paymentDetails.totalAmount}</p>
              <p>ReferenceNo: {paymentDetails.referenceNo}</p>
              <h2>Payment Maker</h2>
              <p>Name: {paymentDetails.tenantId.name}</p>
              <p>Email: {paymentDetails.tenantId.email}</p>
            </div>
          </div>
        </>
      ) : (
        <p>Loading payment details...</p>
      )}
    </div>
  );
};

export default PaymentDetailsPage;
