import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import "./Rent.css";
import { useEffect, useState } from "react";
import apiRequest from "../../lib/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import { setTenants } from "../../features/Tenants/TenantsSlice";

const Rent = () => {
  const fallbackTenants = [
    {
      _id: 1,
      name: "John Doe",
      bill: "20000",
      houseNo: "A6",
      balance: "-100",
      status: "cleared",
    },
    {
      _id: 1,
      name: "John Doe",
      bill: "20000",
      houseNo: "A6",
      balance: "2000",
      status: "Not cleared",
    },
    {
      _id: 1,
      name: "John Doe",
      bill: "20000",
      houseNo: "A6",
      balance: "2000",
      status: "Not cleared",
    },
    {
      _id: 1,
      name: "John Doe",
      bill: "20000",
      houseNo: "A6",
      balance: "2000",
      status: "Not cleared",
    },
    {
      _id: 1,
      name: "John Doe",
      bill: "20000",
      houseNo: "A6",
      balance: "2000",
      status: "Notcleared",
    },
    
  ];

  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const tenants = useSelector((store) => store.tenantsData.tenants);

  useEffect(() => {
    const fetchAllTenants = async () => {
      setError("");
      try {
        const res = await apiRequest.get("/tenants/allTenants");
        console.log(res.data);
        if (res.status) {
          if (res?.data?.length == 0) {
            dispatch(setTenants(fallbackTenants));
          } else {
            dispatch(setTenants(res.data));
          }
        } else {
          setError("Failed to fetch tenants. Using fallback data.");
          dispatch(setTenants(fallbackTenants));
        }
      } catch (error) {
        setError("Error fetching tenants. Using fallback data.");
        dispatch(setTenants(fallbackTenants));
      }
    }; 
    fetchAllTenants();
  }, [dispatch]);

  const handleDelete = async (_id) => {
    try {
      const res = await apiRequest.delete(`/tenants/deleteTenant/${_id}`);
      if (res.status === 200) {
        dispatch(setTenants(tenants.filter((tenant) => tenant._id !== _id)));
      } else {
        console.error("Failed to delete tenant");
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="summary2">
      <div className="tenantslist">
        <h2 className="title">Tenants List</h2>
        {error && <span>{error}</span>}
        <div className="table-container">
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Tenant's Name</th>
                <th>House No.</th>
                <th>Total Bill</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants &&
                tenants.map((tenant) => (
                  <tr key={tenant._id}>
                    <td>{tenant.name}</td>
                    <td>{tenant?.houseNo ? tenant.houseNo : ""}</td>
                    <td>{tenant.bill}</td>

                    <td>{tenant.balance || tenant.balance}</td>
                    <td>{tenant.status}</td>

                    <td className="actions">
                      <Link
                        to={`/rentDetails/${tenant._id}`}
                        className="edit-btn"
                      >
                        EDIT
                      </Link>
                      <Link
                        to={`/tenantProfile/${tenant._id}`}
                        className="edit-btn"
                      >
                        More Details
                      </Link>
                      <button
                        onClick={() => handleDelete(tenant._id)}
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
    </div>
  );
};

export default Rent;
