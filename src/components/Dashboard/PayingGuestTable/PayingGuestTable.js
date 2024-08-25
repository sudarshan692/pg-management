import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaExclamationTriangle } from "react-icons/fa";
import LoadingSpinner from "../../shared/LoadingSpinner";
import PaymentStatusDialog from "../PaymentStatusDialog/PaymentStatusDialog";
import "./payingGuestTable.css";
import inProgressImage from '../../../assets/inProgress.png';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CustomNoDataComponent = () => (
  <div style={{ textAlign: 'center', padding: '1vw', fontSize: '0.8vw', backgroundColor: '#162c46', color: 'rgb(211, 227, 253)', width: '100%' }}>There are no records to display.</div>
);
const checkCircleIcon = {
  color: '#059212',
  width: '1.2vw',
  height: '1.2vw',
  marginRight: '0.3vw',
  verticalAlign: 'middle',
  transition: 'transform 0.2s ease',
};
const cancelIcon = {
  color: '#E72929',
  width: '1.2vw',
  height: '1.2vw',
  marginRight: '0.3vw',
  verticalAlign: 'middle',
  transition: 'transform 0.2s ease',
};
const addCircleOutlineIcon = {
  background: 'none',
  border: 'none',
  color: 'orange',
  marginTop: '0.2vw',
  width: '1.2vw',
  height: '1.2vw',
  cursor: 'pointer',
  marginRight: '-0.5vw',
}

const StatusBoxedCell = ({ status }) => {
  let content = null;
  let displayText = "Not Paid";
  if (status === "Done") {
    content = <CheckCircleIcon style={checkCircleIcon}/>;
    displayText = "Done";
  } else if (status === "Partial") {
    content = <img src={inProgressImage} alt="Partial" className="status-image" />;
    displayText = "Partial";
  } else if (status === "Not Paid") {
    content = <CancelIcon style={cancelIcon}/>;
  }
  return (
    <div className="status-box">
      {content}
      <div className="status-text">{displayText}</div>
    </div>
  );
};


const BoxedCell = ({ value, className, color, label, fullDeposit }) => {
  const isZeroDeposit = value === 0;
  const isFullDeposit = fullDeposit;
  let boxColor = color;
  if (isZeroDeposit) {
    boxColor = "red";
  } else if (isFullDeposit) {
    boxColor = "green";
  } else {
    boxColor = "yellow";
  }
  return (
    <div className={`box ${className} ${boxColor}`}>
      {fullDeposit !== undefined && !isZeroDeposit && (
        <div className={`status-label ${fullDeposit ? "done" : "partial"}`}>
          {fullDeposit ? "D" : "P"}
        </div>
      )}
      {isZeroDeposit ? (
        <>
          <div className="status-label np">NP</div>
          <div className="no-deposit">Not Paid</div>
        </>
      ) : (
        <>
          <div className="label">{label}</div>
          {value}
        </>
      )}
    </div>
  );
};

const BoxContainer = ({ floorNo, roomNo, roomType }) => (
  <div className="box-container">
    <BoxedCell
      value={floorNo || "-"}
      className="floor"
      color="floor"
      label="F"
    />
    <BoxedCell value={roomNo || "-"} className="room" color="room" label="R" />
    <BoxedCell
      value={roomType || "-"}
      className="type"
      color="type"
      label="T"
    />
  </div>
);

const depositAmountSort = (rowA, rowB, columnId, sortDirection) => {
  const depositA = rowA.fullDeposit ? 1 : rowA.depositPaid ? 0.5 : 0;
  const depositB = rowB.fullDeposit ? 1 : rowB.depositPaid ? 0.5 : 0;
  return sortDirection === "asc" ? depositA - depositB : depositB - depositA;
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date(0) : date; // Return epoch if invalid
};

const getHighestPayment = (paymentDetails) => {
  if (!paymentDetails || Object.keys(paymentDetails).length === 0) {
    return null;
  }
  const highestIndexId = Object.keys(paymentDetails).sort().pop();
  return paymentDetails[highestIndexId] || null;
};

const sortPaymentDate = (rowA, rowB, sortDirection) => {
  const highestPaymentA = getHighestPayment(rowA.paymentDetails);
  const highestPaymentB = getHighestPayment(rowB.paymentDetails);
  if (!highestPaymentA || !highestPaymentB) {
    return 0;
  }
  const dateA = parseDate(highestPaymentA.paymentDate);
  const dateB = parseDate(highestPaymentB.paymentDate);
  return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
};

const sortPaymentAmount = (rowA, rowB, sortDirection) => {
  const highestPaymentA = getHighestPayment(rowA.paymentDetails);
  const highestPaymentB = getHighestPayment(rowB.paymentDetails);
  if (!highestPaymentA || !highestPaymentB) {
    return 0;
  }
  const amountA = highestPaymentA.paymentAmount || 0;
  const amountB = highestPaymentB.paymentAmount || 0;
  return sortDirection === "asc" ? amountA - amountB : amountB - amountA;
};

const sortPaymentStatus = (rowA, rowB, sortDirection) => {
  const statusOrder = { "Not Paid": 1, "Done": 2, "Partial": 3 }; // Define status order
  const highestPaymentA = getHighestPayment(rowA.paymentDetails);
  const highestPaymentB = getHighestPayment(rowB.paymentDetails);
  if (!highestPaymentA || !highestPaymentB) {
    return 0;
  }
  const statusA = highestPaymentA.paymentStatus || "Not Paid";
  const statusB = highestPaymentB.paymentStatus || "Not Paid";
  const orderA = statusOrder[statusA] || 0;
  const orderB = statusOrder[statusB] || 0;
  return sortDirection === "asc" ? orderA - orderB : orderB - orderA;
};

const getPreviousMonthPaymentStatus = (paymentDetails) => {
  const paymentEntries = Object.keys(paymentDetails).map((key) => ({
    ...paymentDetails[key],
    index: key,
  }));
  if (paymentEntries.length <= 1) {
    return "Not Paid";
  }
  paymentEntries.sort((a, b) => a.index.localeCompare(b.index));
  const previousMonthEntry = paymentEntries[paymentEntries.length - 2];
  const status = previousMonthEntry.paymentStatus || "Not Paid";
  return status === "Partial" || status === "Not Paid" ? status : "Paid";
};

const getCurrentMonthYear = () => {
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentMonth = months[now.getMonth()];
  const currentYear = now.getFullYear();
  return { currentMonth, currentYear };
};

const PayingGuestTable = ({payingGuests, onAddPayment, guestStatuses, onToggleStatus, selectedPGId, onPaymentUpdate, onSnackbarOpen, pgDetails}) => {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = payingGuests.filter((item) => {
    const itemMatches = Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    const paymentDetailsMatches = Object.values(item.paymentDetails || {}).some(
      (detail) => {
        const detailValues = Object.values(detail);
        return detailValues.some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
        );
      }
    );

    return itemMatches || paymentDetailsMatches;
  });

  const handleRowClicked = (row) => {
    setSelectedGuest(row);
  };

  const handleCloseDialog = () => {
    setSelectedGuest(null);
  };

  const columns = [
    {
      name: "Guest ID",
      selector: (row) => row.guestID,
      sortable: true,
    },
    {
      name: "Guest Name",
      selector: (row) => row.guestName || "-",
      sortable: true,
    },
    {
      name: "Floor/Room/Type",
      cell: (row) => (
        <BoxContainer
          floorNo={row.floorNo}
          roomNo={row.roomNo}
          roomType={row.roomType}
        />
      ),
      sortable: true,
    },
    {
      name: "Date Of Admission",
      selector: (row) => formatDate(row.dateOfAdmission),
      sortable: true,
    },
    {
      name: "Deposit Amount",
      cell: (row) => (
        <BoxedCell
          value={row.depositAmount}
          className="deposit"
          color={row.depositAmount === 0 ? "red" : "yellow"}
          fullDeposit={row.fullDeposit}
        />
      ),
      sortable: true,
      sortFunction: depositAmountSort,
    },
    {
      name: "Payment Month",
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        const currentMonth = getCurrentMonthYear().currentMonth;
        return highestPayment ? highestPayment.paymentForMonth : currentMonth;
      },
      sortable: true,
    },
    {
      name: "Payment Year",
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        const currentYear = getCurrentMonthYear().currentYear;
        return highestPayment ? highestPayment.paymentForYear : currentYear;
      },
      sortable: true,
    },
    {
      name: "Payment Date",
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        return highestPayment ? formatDate(highestPayment.paymentDate) : "-";
      },
      sortable: true,
      sortFunction: sortPaymentDate,
    },
    {
      name: "Payment Amount",
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        if (
          highestPayment &&
          highestPayment.paymentAmount &&
          highestPayment.paymentAmount !== "-"
        ) {
          return `₹${highestPayment.paymentAmount}`;
        }
        return "-";
      },
      sortable: true,
      sortFunction: sortPaymentAmount,
    },
    {
      name: "Payment Status",
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        const status = highestPayment
          ? highestPayment.paymentStatus
          : "Not Paid";
        return <StatusBoxedCell status={status} />;
      },
      sortable: true,
      sortFunction: sortPaymentStatus,
    },
    {
      name: "Actions",
      cell: (row) => {
        const isActive = guestStatuses[row.guestID] === "Active";
        return (
          <div className="actions-container">
            <button
              onClick={() => onAddPayment(row)}
              className="add-payment-button"
            >
              <AddCircleOutlineIcon style={addCircleOutlineIcon}/>
            </button>
            <label
              className={`toggle-switch ${isActive ? "" : "inactive-toggle"}`}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() =>
                  onToggleStatus(row.guestID, isActive ? "InActive" : "Active")
                }
              />
              <span className="slider"></span>
            </label>
            <div className="alert">
              {row.paymentDetails &&
                Object.keys(row.paymentDetails).length > 1 &&
                (getPreviousMonthPaymentStatus(row.paymentDetails) ===
                  "Partial" ||
                  getPreviousMonthPaymentStatus(row.paymentDetails) ===
                    "Not Paid") && (
                  <FaExclamationTriangle
                    className="alert-icon"
                    title="Previous month payment status is Partial or Not Paid"
                  />
                )}
            </div>
          </div>
        );
      },
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#3f51b5",
        color: "white",
        minHeight: window.innerWidth < 768 ? "1.75vw" : "2.6vw",
        fontSize: window.innerWidth < 768 ? "0.8vw" : "0.7vw",
        fontWeight: "bold",
        height:"2.6vw",
      },
    },
    rows: {
      style: {
        "&:nth-child(odd)": {
          backgroundColor: "#0d2136",
          minHeight: window.innerWidth < 768 ? "1.75vw" : "2.5vw",
          color: "white",
          fontSize: window.innerWidth < 768 ? "0.8vw" : "0.7vw",
        },
        "&:nth-child(even)": {
          backgroundColor: "#162c46",
          minHeight: window.innerWidth < 768 ? "1.75vw" : "2.5vw",
          color: "white",
          fontSize: window.innerWidth < 768 ? "0.8vw" : "0.7vw",
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: "#3f51b5",
        color: "white",
        display: "flex",
        justifyContent: "center",
        fontSize: window.innerWidth < 768 ? "0.8vw" : "0.8vw",
        minHeight: "0",
        height:"2.6vw",
      },
    },
    button: {
      style: {
        backgroundColor: "#3498db",
        color: "white",
        fontSize: '0.8vw',
      },
    },
  };

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="search-container">
            <input
              className="search-input"
              type="text"
              value={searchText}
              onChange={handleSearch}
              placeholder="Search..."
            />
          </div>
          <div className="table">
            <DataTable
              className="custom-data-table"
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30]}
              highlightOnHover
              pointerOnHover
              sortIcon={<i className="material-icons">arrow_upward</i>}
              defaultSortField="guestID"
              customStyles={customStyles}
              noDataComponent={<CustomNoDataComponent />}
              onRowClicked={handleRowClicked}
            />
          </div>
          {selectedGuest && (
            <PaymentStatusDialog
              guest={selectedGuest}
              isOpen={!!selectedGuest}
              selectedPGId={selectedPGId}
              onPaymentUpdate={onPaymentUpdate}
              onSnackbarOpen={onSnackbarOpen}
              onClose={handleCloseDialog}
              pgDetails={pgDetails}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PayingGuestTable;
