import { useEffect, useState } from 'react';
import './Records.scss';
import apiRequest from '../../lib/apiRequest';
import { Bars } from 'react-loader-spinner'; // Importing the spinner component from react-loader-spinner

const Records = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [years, setYears] = useState({
    water: [],
    rent: [],
    garbage: [],
  });
  const [selectedYear, setSelectedYear] = useState({
    water: null,
    rent: null,
    garbage: null,
  });
  const [records, setRecords] = useState({
    water: {},
    rent: {},
    garbage: {},
  });
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchAllRecords = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        // Fetch rent records
        const rentResponse = await apiRequest.get('/payments/allRents');
        const rentData = rentResponse.data.groupedByYear;

        // Fetch water records
        const waterResponse = await apiRequest.get('/payments/waterRecords');
        const waterData = waterResponse.data.groupedByYear;

        // Fetch garbage records
        const garbageResponse = await apiRequest.get(
          '/payments/garbageRecords'
        );
        const garbageData = garbageResponse.data.groupedByYear;

        // Organize data by year and extract years
        const organizeDataByYear = (data) => {
          const yearsList = [];
          const organizedData = data.reduce((acc, record) => {
            const year = record.year;
            const months = record.months.map((month) => ({
              month: month.month,
              amount: month.totalRent || month.totalAmount,
            }));

            if (!acc[year]) {
              acc[year] = [];
              yearsList.push(year);
            }

            acc[year] = [...acc[year], ...months];
            return acc;
          }, {});

          return { organizedData, yearsList };
        };

        const { organizedData: rentDataByYear, yearsList: rentYears } =
          organizeDataByYear(rentData);
        const { organizedData: waterDataByYear, yearsList: waterYears } =
          organizeDataByYear(waterData);
        const { organizedData: garbageDataByYear, yearsList: garbageYears } =
          organizeDataByYear(garbageData);

        setRecords({
          rent: rentDataByYear,
          water: waterDataByYear,
          garbage: garbageDataByYear,
        });

        setYears({
          rent: rentYears,
          water: waterYears,
          garbage: garbageYears,
        });

        // Initialize selected years
        setSelectedYear({
          rent: rentYears[0] || null,
          water: waterYears[0] || null,
          garbage: garbageYears[0] || null,
        });
      } catch (error) {
        console.error('Failed to fetch records:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchAllRecords();
  }, []);

  const handleCardClick = (recordType) => {
    if (selectedRecord === recordType) {
      setSelectedRecord(null);
    } else {
      setSelectedRecord(recordType);
      setCurrentPage(1); // Reset to the first page on new selection
    }
  };

  const handleYearChange = (recordType, year) => {
    setSelectedYear((prevYears) => ({ ...prevYears, [recordType]: year }));
    setCurrentPage(1); // Reset to the first page when year changes
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KSH',
    }).format(number);
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="loader-container">
          <Bars
            height="80"
            width="80"
            color="#00aaff"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass="loader"
          />
        </div>
      );
    }

    if (!selectedRecord || !selectedYear[selectedRecord]) return null;

    const year = selectedYear[selectedRecord];
    const data = records[selectedRecord][year] || [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalAmount = data.reduce((acc, record) => acc + record.amount, 0);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(data.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={`records-table ${selectedRecord}-themed`}>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((record, index) => (
              <tr key={index}>
                <td>{record.month}</td>
                <td>{formatNumber(record.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          {pageNumbers.map((number) => (
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
          <strong>Total Amount:</strong> {formatNumber(totalAmount)}
        </div>
      </div>
    );
  };

  return (
    <div className="mainRecordPage">
      <div className="records-container">
        <div className="records-cards">
          <div className="record-card" onClick={() => handleCardClick('rent')}>
            <h3>Rent Records</h3>
            <select
              onChange={(e) => handleYearChange('rent', e.target.value)}
              value={selectedYear?.rent}
            >
              {years?.rent.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="record-card" onClick={() => handleCardClick('water')}>
            <h3>Water Records</h3>
            <select
              onChange={(e) => handleYearChange('water', e.target.value)}
              value={selectedYear?.water}
            >
              {years?.water.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div
            className="record-card"
            onClick={() => handleCardClick('garbage')}
          >
            <h3>Garbage Records</h3>
            <select
              onChange={(e) => handleYearChange('garbage', e.target.value)}
              value={selectedYear?.garbage}
            >
              {years?.garbage.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        {renderTable()}
      </div>
    </div>
  );
};

export default Records;
