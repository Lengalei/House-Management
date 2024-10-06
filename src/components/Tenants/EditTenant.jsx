import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { toast, ToastContainer } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
import "react-toastify/dist/ReactToastify.css";
import "./Tenant.scss";

function EditTenant() {
  const { _id } = useParams();
  const navigate = useNavigate();

  // Updated form data structure with houseDetails
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nationalId: "",
    phoneNo: "",
    placementDate: "",
    houseDeposit: "",
    waterDeposit: "",
    houseDetails: {
      houseNo: "", // Nested inside houseDetails
    },
    rentPayable: "",
    amountPaid: "",
    emergencyContactNumber: "",
    emergencyContactName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTenant = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get(
          `/v2/tenants/getSingleTenant/${_id}`
        );
        const { data } = response;
        setFormData(data);
        setError("");
      } catch (error) {
        console.error("Error fetching tenant:", error);
        setError("Error fetching tenant data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for houseDetails.houseNo
    if (name === "houseNo") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        houseDetails: {
          ...prevFormData.houseDetails,
          houseNo: value,
        },
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest.put(
        `/v2/tenants/updateSingleTenantData/${_id}`,
        formData
      );
      if (res.status) {
        toast.success("Tenant details updated successfully!");
        console.log(res.data);
        navigate(`/tenantProfile/${_id}`);
      }
    } catch (err) {
      console.error("Error updating tenant:", err);
      setError("Error updating tenant. Please try again.");
      toast.error("Error updating tenant.");
    } finally {
      setLoading(false);
    }
  };

  // Houses logic
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [isHousePopupVisible, setIsHousePopupVisible] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [houses, setHouses] = useState([]);
  const [organizedData, setOrganizedData] = useState({});

  const floors = [
    { floorNumber: 0, name: "Ground Floor" },
    { floorNumber: 1, name: "First Floor" },
    { floorNumber: 2, name: "Second Floor" },
    { floorNumber: 3, name: "Third Floor" },
    { floorNumber: 4, name: "Fourth Floor" },
    { floorNumber: 5, name: "Fifth Floor" },
    { floorNumber: 6, name: "Sixth Floor" },
    { floorNumber: 7, name: "Seventh Floor" },
  ];

  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get("/houses/getAllHouses");
        const houseData = response.data;
        setHouses(houseData);

        // Organize houses by apartment and floor
        const organizedHouses = houseData.reduce((acc, house) => {
          const apartmentId = house.apartment._id;
          const floor = house.floor;

          if (!acc[apartmentId])
            acc[apartmentId] = { apartment: house.apartment, floors: {} };

          if (!acc[apartmentId].floors[floor])
            acc[apartmentId].floors[floor] = [];
          acc[apartmentId].floors[floor].push(house);

          return acc;
        }, {});

        setOrganizedData(organizedHouses);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching houses:", error);
        toast.error(error.response.data.message || "Error Fetching Houses");
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  const handleApartmentSelection = (apartment) => {
    setSelectedApartment(apartment);
    setSelectedFloor(null);
    setSelectedHouse(null);
  };

  const handleFloorSelection = (floor) => {
    setSelectedFloor(floor);
  };

  const handleHouseSelection = (house) => {
    if (!house.isOccupied) {
      const houseLetter = house.houseName.slice(-1);
      const houseNumber = `${selectedFloor}${houseLetter}`;
      setSelectedHouse(houseNumber);

      // Update houseDetails.houseNo in formData
      setFormData((prevFormData) => ({
        ...prevFormData,
        houseDetails: {
          ...prevFormData.houseDetails,
          houseNo: houseNumber,
        },
      }));
      setIsHousePopupVisible(false);
    }
  };

  return (
    <div className="tenant">
      <div className="registration">
        <h3>Edit Tenant{`'`}s Details</h3>
        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="forminput">
              <label htmlFor="name">
                Name <span>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="forminput">
              <label htmlFor="email">
                Email <span>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="forminput">
              <label htmlFor="nationalId">
                National ID<span>*</span>
              </label>
              <input
                type="number"
                id="nationalId"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
              />
            </div>
            <div className="forminput">
              <label htmlFor="phoneNo">
                Phone No<span>*</span>
              </label>
              <input
                type="number"
                id="phoneNo"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
              />
            </div>
            <div className="forminput">
              <label htmlFor="houseNo">
                House No<span>*</span>
              </label>
              <input
                type="text"
                name="houseNo"
                id="houseNo"
                value={formData?.houseDetails?.houseNo}
                onChange={handleChange}
                readOnly
                onClick={() => setIsHousePopupVisible(true)}
              />
              <div
                className="house-selection"
                onClick={() => setIsHousePopupVisible(true)}
              >
                {selectedHouse ? selectedHouse : "Change House"}
              </div>
            </div>
            <div className="forminput">
              <label htmlFor="emergencyContactName">
                Emergency Contact Name<span>*</span>
              </label>
              <input
                type="text"
                name="emergencyContactName"
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
              />
            </div>
            <div className="forminput">
              <label htmlFor="emergencyContactNumber">
                Emergency Contact Number<span>*</span>
              </label>
              <input
                type="number"
                name="emergencyContactNumber"
                id="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <button className="btn" disabled={loading}>
                {loading ? (
                  <ThreeDots
                    height="20"
                    width="40"
                    radius="9"
                    color="#4fa94d"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClassName=""
                    visible={true}
                  />
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
          {error && <span>{error}</span>}
        </div>
      </div>

      {isHousePopupVisible && (
        <div className="floor-popup">
          <button
            className="closePopup"
            onClick={() => setIsHousePopupVisible(false)}
          >
            ×
          </button>
          <h3>Select an Apartment</h3>
          <div className="apartment-selection">
            {Object?.values(organizedData)?.map(({ apartment }) => (
              <div
                key={apartment?._id}
                className={`apartment-option ${
                  selectedApartment && selectedApartment?._id === apartment._id
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleApartmentSelection(apartment)}
              >
                {apartment.name}
              </div>
            ))}
          </div>
          {selectedApartment && (
            <>
              <h3>Floor Selection</h3>
              <div className="floorAndHouse">
                <div className="floor-selection">
                  {floors.map((floor) => (
                    <div
                      key={floor?.floorNumber}
                      className={`floor-option ${
                        selectedFloor === floor?.floorNumber ? "selected" : ""
                      }`}
                      onClick={() => handleFloorSelection(floor?.floorNumber)}
                    >
                      {floor?.name}
                    </div>
                  ))}
                </div>

                {selectedFloor !== null && (
                  <div className="houseSelectionParent">
                    <h3>House Selection</h3>
                    <div className="house-selection">
                      {organizedData[selectedApartment?._id].floors[
                        selectedFloor
                      ]?.map((house) => (
                        <div
                          key={house?._id}
                          className={`house-option ${
                            selectedHouse ===
                            `${selectedFloor}${house?.houseName.slice(-1)}`
                              ? "selected"
                              : ""
                          } ${house?.isOccupied ? "occupied" : ""}`}
                          onClick={() => handleHouseSelection(house)}
                        >
                          {house?.houseName} {house?.isOccupied && "(Occupied)"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default EditTenant;
