import { useState } from 'react';
import './Records.scss';

const Records = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [years, setYears] = useState({
    water: new Date().getFullYear(),
    rent: new Date().getFullYear(),
    garbage: new Date().getFullYear(),
  });

  const records = {
    water: {
      2024: [
        { month: 'January', amountPaid: 50 },
        { month: 'February', amountPaid: 45 },
        { month: 'March', amountPaid: 60 },
        { month: 'April', amountPaid: 55 },
        { month: 'May', amountPaid: 70 },
        { month: 'June', amountPaid: 65 },
        // ...other months
      ],
      2023: [
        { month: 'January', amountPaid: 50 },
        { month: 'February', amountPaid: 45 },
        { month: 'March', amountPaid: 60 },
        { month: 'April', amountPaid: 55 },
        { month: 'May', amountPaid: 70 },
        { month: 'June', amountPaid: 65 },
        // ...other months
      ],
      // ...other years
    },
    rent: {
      2024: [
        { month: 'January', amountPaid: 50 },
        { month: 'February', amountPaid: 45 },
        { month: 'March', amountPaid: 60 },
        { month: 'April', amountPaid: 55 },
        { month: 'May', amountPaid: 70 },
        { month: 'June', amountPaid: 65 },
        // ...other months
      ],
      2023: [
        { month: 'January', amountPaid: 50 },
        { month: 'February', amountPaid: 45 },
        { month: 'March', amountPaid: 60 },
        { month: 'April', amountPaid: 55 },
        { month: 'May', amountPaid: 70 },
        { month: 'June', amountPaid: 65 },
        // ...other months
      ],
      // ...other years
    },
    garbage: {
      2024: [
        { month: 'January', amountPaid: 50 },
        { month: 'February', amountPaid: 45 },
        { month: 'March', amountPaid: 60 },
        { month: 'April', amountPaid: 55 },
        { month: 'May', amountPaid: 70 },
        { month: 'June', amountPaid: 65 },
        // ...other months
      ],
      2023: [
        { month: 'January', amountPaid: 50 },
        { month: 'February', amountPaid: 45 },
        { month: 'March', amountPaid: 60 },
        { month: 'April', amountPaid: 55 },
        { month: 'May', amountPaid: 70 },
        { month: 'June', amountPaid: 65 },
        // ...other months
      ],
      // ...other years
    },
  };

  const handleCardClick = (recordType) => {
    if (selectedRecord === recordType) {
      setSelectedRecord(null);
    } else {
      setSelectedRecord(recordType);
      setCurrentPage(1); // Reset to the first page on new selection
    }
  };

  const handleYearChange = (recordType, year) => {
    setYears((prevYears) => ({ ...prevYears, [recordType]: year }));
    setCurrentPage(1); // Reset to the first page when year changes
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderTable = () => {
    if (!selectedRecord) return null;

    const year = years[selectedRecord];
    const data = records[selectedRecord][year];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = data?.slice(indexOfFirstItem, indexOfLastItem);
    const totalAmount = data?.reduce(
      (acc, record) => acc + record.amountPaid,
      0
    );

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(data?.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={`records-table ${selectedRecord}-themed`}>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            {currentData?.map((record, index) => (
              <tr key={index}>
                <td>{record.month}</td>
                <td>${record.amountPaid}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          {pageNumbers?.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={currentPage === number ? 'active' : ''}
            >
              {number}
            </button>
          ))}
        </div>
        <div className="total-amount">
          <strong>Total Amount:</strong> ${totalAmount}
        </div>
      </div>
    );
  };

  return (
    <div className="records-container">
      <div className="records-cards">
        <div className="record-card" onClick={() => handleCardClick('rent')}>
          <h3>Rent Records</h3>
          <select
            onChange={(e) => handleYearChange('rent', e.target.value)}
            value={years?.rent}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
        <div className="record-card" onClick={() => handleCardClick('water')}>
          <h3>Water Records</h3>
          <select
            onChange={(e) => handleYearChange('water', e.target.value)}
            value={years?.water}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>

        <div className="record-card" onClick={() => handleCardClick('garbage')}>
          <h3>Garbage Records</h3>
          <select
            onChange={(e) => handleYearChange('garbage', e.target.value)}
            value={years?.garbage}
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>
      {renderTable()}
    </div>
  );
};

export default Records;
