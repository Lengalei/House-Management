import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import './Listall.scss';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { useDispatch, useSelector } from 'react-redux';
import { setTenants } from '../../features/Tenants/TenantsSlice';
import { ThreeDots } from 'react-loader-spinner';
import { FaDownload } from 'react-icons/fa6';
import { toast, ToastContainer } from 'react-toastify';
import TenantDataPopup from './v2/TenantDataPopup/TenantDataPopup';
import jsPDF from 'jspdf'; // Import jsPDF

const Listall = () => {
  const fallbackTenants = [
    {
      _id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
    },
    {
      _id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '234-567-8901',
    },
    {
      _id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '345-678-9012',
    },
    {
      _id: 4,
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '456-789-0123',
    },
    {
      _id: 5,
      name: 'Tom White',
      email: 'tom@example.com',
      phone: '567-890-1234',
    },
    {
      _id: 6,
      name: 'Mary Green',
      email: 'mary@example.com',
      phone: '678-901-2345',
    },
    {
      _id: 7,
      name: 'James Black',
      email: 'james@example.com',
      phone: '789-012-3456',
    },
    {
      _id: 8,
      name: 'Patricia Williams',
      email: 'patricia@example.com',
      phone: '890-123-4567',
    },
    {
      _id: 9,
      name: 'Michael Scott',
      email: 'michael@example.com',
      phone: '901-234-5678',
    },
    {
      _id: 10,
      name: 'Linda Martinez',
      email: 'linda@example.com',
      phone: '012-345-6789',
    },
  ];

  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [tenantToDelete, setTenantToDelete] = useState(null); // State for selected tenant
  const dispatch = useDispatch();
  const tenants = useSelector((store) => store.tenantsData.tenants);
  console.log('tenants: ', tenants);

  useEffect(() => {
    const fetchAllTenants = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await apiRequest.get('/v2/tenants/getToBeClearedFalse');
        if (res.status) {
          if (res?.data?.length === 0) {
            dispatch(setTenants(fallbackTenants));
          } else {
            dispatch(setTenants(res.data));
            setError('');
            toast.success('Tenants fetched ');
          }
        } else {
          setError('Failed to fetch tenants. Using fallback data.');
          dispatch(setTenants(fallbackTenants));
        }
      } catch (error) {
        setError('Error fetching tenants. Using fallback data.');
        toast.error(error.response.data.message);
        dispatch(setTenants(fallbackTenants));
      } finally {
        setLoading(false);
      }
    };
    fetchAllTenants();
  }, [dispatch]);

  const handleDelete = async (_id) => {
    setLoading(true);
    try {
      const res = await apiRequest.delete(`/v2/tenants/deleteTenant/${_id}`);
      if (res.status === 200) {
        dispatch(setTenants(tenants.filter((tenant) => tenant._id !== _id)));
        toast.success('Tenant deleted Successfully!');
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response.data.message || 'Error Deleting Tenant!');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (_id) => {
    setTenantToDelete(_id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTenantToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (tenantToDelete) {
      handleDelete(tenantToDelete);
      handleCloseModal();
    }
  };

  const handleTenantClearance = (tenant) => {
    navigate(`/clearTenant/${tenant._id}`, {
      state: { tenant },
    });
  };

  const [tenantPopupDonwload, setTenantPopupDonwload] = useState(false);
  const handleDowloadBtnClicked = () => {
    setTenantPopupDonwload(true);
  };
  const closeDonwloadPopup = () => {
    setTenantPopupDonwload(false);
  };

  const handleDownloadTenant = (tenant) => {
    const doc = new jsPDF();

    // Load the logo image
    const img = new Image();
    img.src = '/houselogo1.png'; // Path to your logo image

    img.onload = function () {
      // Define logo dimensions
      const logoWidth = 50;
      const aspectRatio = img.width / img.height;
      const logoHeight = logoWidth / aspectRatio;

      // Add the logo to the document
      doc.addImage(img, 'PNG', 10, 10, logoWidth, logoHeight);

      // Company Details
      doc.setFontSize(14);
      doc.text('Sleek Abode Apartments', 70, 20);
      doc.setFontSize(10);
      doc.text('Kimbo, Ruiru.', 70, 30);
      doc.text('Contact: your-email@example.com', 70, 35);
      doc.text('Phone: (+254) 88-413-323', 70, 40);

      // Title for the tenant report
      doc.setFontSize(16);
      doc.setFont('times', 'bold');
      doc.text('Tenant Report', 10, 70);

      // Tenant Name and Details
      doc.setFont('times', 'normal');
      doc.text(`Tenant: ${tenant.name}`, 10, 80);
      doc.text(`Email: ${tenant.email}`, 10, 90);
      doc.text(`House No: ${tenant?.houseDetails?.houseNo || 'N/A'}`, 10, 100);
      doc.text(`To Be Cleared: ${tenant.toBeCleared ? 'Yes' : 'No'}`, 10, 110);

      // Date and Time
      const today = new Date();
      const date = `${today.getDate()}/${
        today.getMonth() + 1
      }/${today.getFullYear()}`;
      const time = `${today.getHours()}:${today.getMinutes()}`;
      doc.setFontSize(12);
      doc.text(`Generated on: ${date} at ${time}`, 100, 70); // Right-aligned date

      // Save the document as PDF
      doc.save(`${tenant.name}_Report.pdf`);
    };

    // Error handler for logo loading
    img.onerror = function () {
      alert('Failed to load logo image.');
    };
  };

  return (
    <div className="summary2">
      <div className="tenantslist">
        <h2 className="title">Tenants List</h2>
        <button className="btn" onClick={handleDowloadBtnClicked}>
          <span className="downloadSpan">
            Print Tenants <FaDownload />
          </span>
        </button>
        {error && <span>{error}</span>}
        <div className="table-container">
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>House No</th>
                <th>To Be Cleared</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants &&
                tenants.map((tenant) => (
                  <tr key={tenant._id}>
                    <td>{tenant.name}</td>
                    <td>{tenant.email}</td>
                    <td>
                      {tenant?.houseDetails?.houseNo
                        ? tenant.houseDetails?.houseNo
                        : ''}
                    </td>
                    <td>{tenant.toBeCleared ? 'yes' : 'No'}</td>
                    <td className="actions">
                      <Link
                        to={`/tenantProfile/${tenant._id}`}
                        className="edit-btn"
                      >
                        More Details
                      </Link>
                      <button onClick={() => handleDownloadTenant(tenant)}>
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => {
                          handleTenantClearance(tenant);
                        }}
                        className="edit-btn"
                      >
                        Clear Tenant
                      </button>
                      <button
                        onClick={() => handleOpenModal(tenant._id)}
                        className="delete-btn"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {loading && (
        <div className="loader">
          <ThreeDots
            height="80"
            width="80"
            radius="9"
            color="#4fa94d"
            ariaLabel="three-dots-loading"
            visible={true}
          />
        </div>
      )}
      {showModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this tenant?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {tenantPopupDonwload && (
        <div className="tenantPopupModal">
          <div className="downloadContent">
            <TenantDataPopup
              tenantData={tenants}
              onClose={closeDonwloadPopup}
            />
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Listall;
