import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import apiRequest from '../../../lib/apiRequest';
// import "./DoughnutChart.css";

const DoughnutChart = () => {
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState('2024');
  const [totalPaid, setTotalPaid] = useState(15000);

  const totalUnpaid = 5000;

  useEffect(() => {
    //fetchAllPayments
    const fetchAllPayments = async () => {
      const response = await apiRequest.get('/v2/payments/getAllPayments');
      if (response.status) {
        // console.log('allPayments: ', response.data);
        setTotalPaid(response.data);
      }
    };
    fetchAllPayments();
  }, []);

  const data = {
    labels: ['Paid', 'Unpaid'],
    datasets: [
      {
        data: [totalPaid, totalUnpaid],
        backgroundColor: ['#f39c12', '#e74c3c'],
        hoverBackgroundColor: ['#f1c40f', '#c0392b'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false, // Allow custom height and width
  };

  return (
    <div className="chart-container">
      <h2 className="chart-title">
        Payment Overview - {month} {year}
      </h2>

      <div className="chart-interpretation">
        <div className="legend-item">
          <span className="color-box yellow"></span> Paid
        </div>
        <div className="legend-item">
          <span className="color-box red"></span> Unpaid
        </div>
      </div>

      <div className="chart-wrapper">
        <Doughnut data={data} options={options} width={200} height={200} />

        <input type="date" placeholder="Date" className="chartdate" />
      </div>

      <div className="totals-container">
        <div className="total-box">
          <h4>Total Paid</h4>
          <p>Ksh {totalPaid}</p>
        </div>
        <div className="total-box">
          <h4>Total Unpaid</h4>
          <p>Ksh {totalUnpaid}</p>
        </div>
        <div className="total-box">
          <h4>Total Amount</h4>
          <p>Ksh {totalPaid + totalUnpaid}</p>
        </div>
      </div>

      {/* <div className="month-year-selection">
        <label>Month:</label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option>August</option>
          <option>September</option>
          <option>October</option>
        </select>

        <label>Year:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option>2024</option>
          <option>2023</option>
        </select>
      </div> */}
    </div>
  );
};

export default DoughnutChart;
