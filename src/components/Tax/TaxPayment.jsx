import { useState, useEffect } from 'react';
import './TaxPayment.css';
import apiRequest from '../../lib/apiRequest';
import { useNavigate } from 'react-router-dom';

const TaxPayment = () => {
  const [yearsData, setYearsData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [totalYearRent, setTotalYearRent] = useState(0);
  const [date, setDate] = useState('');
  const [monthRent, setMonthRent] = useState(0);
  const [tax, setTax] = useState('0.00');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [formData, setFormData] = useState({
    referenceNo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [monthsPerPage] = useState(4); // Number of months per page
  const [currentMonths, setCurrentMonths] = useState([]);

  const navigate = useNavigate();

  // Fetch the years data on component mount
  useEffect(() => {
    const fetchYearsData = async () => {
      try {
        const response = await apiRequest.get('/payments/allRents');
        if (response.status === 200) {
          setYearsData(response.data.groupedByYear || []);
        } else {
          console.error('Failed to fetch years data');
        }
      } catch (error) {
        console.error('Error fetching years data:', error);
      }
    };

    fetchYearsData();
  }, []);

  useEffect(() => {
    // Update current months based on pagination
    if (selectedYear) {
      const yearData = yearsData.find((data) => data.year === selectedYear);
      if (yearData) {
        const indexOfLastMonth = currentPage * monthsPerPage;
        const indexOfFirstMonth = indexOfLastMonth - monthsPerPage;
        setCurrentMonths(
          yearData.months.slice(indexOfFirstMonth, indexOfLastMonth)
        );
        setTotalYearRent(yearData.totalRent);
      }
    }
  }, [selectedYear, currentPage, monthsPerPage, yearsData]);

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setCurrentPage(1); // Reset pagination to first page
    setDate('');
    setMonthRent(0);
    setTax('0.00');
    setSelectedMonth('');
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    // Parse the selected date using JavaScript's Date object
    const dateObj = new Date(selectedDate);
    const monthName = dateObj.toLocaleString('default', { month: 'long' });
    const year = dateObj.getFullYear();

    setSelectedMonth(monthName);

    if (year === parseInt(selectedYear)) {
      const yearData = yearsData.find((data) => data.year === selectedYear);
      if (yearData) {
        const monthData = yearData.months.find((m) => m.month === monthName);
        if (monthData) {
          setMonthRent(monthData.totalRent);
          setTax((monthData.totalRent * 0.075).toFixed(2));
        } else {
          setMonthRent(0);
          setTax('0.00');
        }
      }
    }
  };

  const handleReferenceNoChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      referenceNo: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest.post('/kra/', {
        date,
        month: selectedMonth,
        rent: monthRent,
        tax,
        referenceNo: formData.referenceNo,
      });

      if (response.status === 201) {
        navigate('/taxPaymentHistory');
      } else {
        console.error('Failed to submit data');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  // Pagination handlers
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(
    (yearsData.find((data) => data.year === selectedYear)?.months.length || 0) /
      monthsPerPage
  );

  return (
    <div className="tax-payment-container">
      <div className="left-card">
        <h2>Select Year</h2>
        <select value={selectedYear || ''} onChange={handleYearChange}>
          <option value="" disabled>
            Select Year
          </option>
          {yearsData.map((year) => (
            <option key={year.year} value={year.year}>
              {year.year}
            </option>
          ))}
        </select>
        {selectedYear && (
          <>
            <div className="month-cards">
              {currentMonths.map((month) => (
                <div key={month.month} className="month-card">
                  <h3>{month.month}</h3>
                  <p>Total Rent: ${month.totalRent.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={index + 1 === currentPage ? 'active' : ''}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <p className="year-total">
              Total Rent for {selectedYear}: ${totalYearRent.toFixed(2)}
            </p>
          </>
        )}
      </div>

      <div className={`right-card ${!selectedYear ? 'disabled' : ''}`}>
        <h2 className="month-heading">
          KRA Payment Details for {selectedYear || '...'}
        </h2>
        <form onSubmit={handleSubmit}>
          {selectedYear && (
            <div className="input-group">
              <label>Select Date:</label>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                min={`${selectedYear}-01-01`}
                max={`${selectedYear}-12-31`}
                required
              />
            </div>
          )}
          {selectedMonth && (
            <div className="input-group">
              <label>
                Selected Month:{' '}
                <span className="selected-month">{selectedMonth}</span>
              </label>
            </div>
          )}
          <div className="input-group">
            <label>
              Total Rent for the Selected Month:{' '}
              <span className="rental-value">
                {monthRent.toFixed(2) || '0.00'}
              </span>
            </label>
          </div>
          <div className="input-group">
            <label>Tax Paid (7.5%):</label>
            <input
              type="text"
              value={tax}
              readOnly
              placeholder="Tax will be calculated automatically"
            />
          </div>
          <div className="input-group">
            <label>Ref NO Used:</label>
            <input
              type="text"
              value={formData.referenceNo}
              onChange={handleReferenceNoChange}
              placeholder="Enter Reference Number"
              required
              disabled={!selectedYear || !date}
            />
          </div>
          <button
            type="submit"
            className="btn"
            disabled={!selectedYear || !date}
          >
            Add KRA Record
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaxPayment;
