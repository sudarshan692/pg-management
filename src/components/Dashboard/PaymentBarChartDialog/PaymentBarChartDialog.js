import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; 
import "./paymentBarChartDialog.css";

const PaymentBarChartDialog = ({ isOpen, onClose, payingGuests }) => {
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const calculatePaymentData = () => {
      const payments = [];

      payingGuests.forEach((guest) => {
        const paymentDetails = guest.paymentDetails || [];
        payments.push(...paymentDetails);
      });

      const paymentPerMonth = payments.reduce((acc, payment) => {
        const paymentAmount = parseFloat(payment.paymentAmount);

        if (
          payment.paymentForYear === currentYear &&
          !isNaN(paymentAmount) &&
          paymentAmount >= 0
        ) {
          const monthIndex = new Date(
            Date.parse(payment.paymentForMonth + " 1, 2024")
          ).getMonth();
          acc[monthIndex] = (acc[monthIndex] || 0) + paymentAmount;
        }
        return acc;
      }, {});

      const monthlyData = Array.from({ length: 12 }, (_, month) => ({
        month: month + 1,
        year: currentYear,
        amount: paymentPerMonth[month] || 0,
      }));

      setPaymentData(monthlyData);
      setLoading(false);
    };

    calculatePaymentData();
  }, [payingGuests, currentYear]);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const tickFormatter = (value) => {
    const month = monthNames[value - 1];
    return `${month}-${currentYear}`;
  };

  const yAxisTickFormatter = (value) => {
    return `₹${value.toLocaleString()}`;
  };

  // Inline styles for overlay
  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(138, 134, 134, 0.7)", // Semi-transparent black overlay
    zIndex: 1,
  };

  // Inline styles for dialog container to ensure centering
  const dialogContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    height: "100vh",
  };

  // Style for horizontal scrolling container
  const scrollContainerStyle = {
    overflowX: "auto",
    width: "100%", // Full width of parent container
  };

  // Style for chart to extend beyond the screen width
  const chartStyle = {
    width: "1200px", // Set width larger than the mobile screen to enable scrolling
    height: "450px", // Fixed height
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullScreen
      aria-labelledby="payment-bar-chart-dialog"
      sx={{
        "& .MuiDialog-paper": {
          boxShadow: "none", // Remove default shadow
          backgroundColor: "transparent", // Make the dialog background transparent to see the overlay
        },
      }}
    >
      <div style={dialogContainerStyle}>
        <div style={overlayStyle} /> {/* Overlay applied here */}
        <div className="dialog-content1"> {/* Use CSS class for mobile styles */}
          <DialogTitle
            className="dialog-title"
            id="payment-bar-chart-dialog"
            sx={{ backgroundColor: "#0d1117" }}
          >
            Payment Bar Chart
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              sx={{
                position: "absolute",
                right: 15,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>×</span>
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "calc(100% - 3.2vw)",
              overflow: "hidden",
              backgroundColor: "#0d1117",
            }}
          >
            {loading ? (
              <p>Loading...</p>
            ) : paymentData.length === 0 ? (
              <p>No data available.</p>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {/* Horizontal scrolling container */}
                <div style={scrollContainerStyle}>
                  {/* Set a larger width for the chart to enable scrolling */}
                  <div style={chartStyle}>
                    <ResponsiveContainer width="100%" height="95%">
                      <BarChart
                        data={paymentData}
                        margin={{ top: 40, right: 30, left: 30, bottom: 10 }}
                      >
                        <CartesianGrid stroke="#ccc" strokeDasharray="1 1" />
                        <XAxis
                          dataKey="month"
                          tick={{ angle: 0, textAnchor: "middle", fontSize: 12 }}
                          tickFormatter={tickFormatter}
                        />
                        <YAxis
                          type="number"
                          domain={[0, "dataMax + 10000"]}
                          tickFormatter={yAxisTickFormatter}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const month = monthNames[label - 1]; // Get month name from label
                              const year = currentYear; // Current year
                              const amount = payload[0].value; // Amount from payload

                              return (
                                <div
                                  style={{
                                    backgroundColor: "#162c46",
                                    color: "#fff",
                                    borderRadius: "0.5vw",
                                    padding: "10px",
                                    fontSize: "14px",
                                    textAlign: "center",
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: "0 0 4px 0",
                                      fontWeight: "bold",
                                    }}
                                  >{`${month} ${year}`}</p>
                                  <p
                                    style={{
                                      margin: 0,
                                      color: "rgb(22, 255, 0)",
                                      fontWeight: "bold",
                                    }}
                                  >{`Total Earnings: ₹${amount.toLocaleString()}`}</p>
                                </div>
                              );
                            }

                            return null;
                          }}
                          contentStyle={{
                            backgroundColor: "#162c46",
                            color: "#fff",
                            borderRadius: "0.5vw",
                          }}
                        />

                        <Legend />
                        <Bar dataKey="amount" fill="orange" barSize={20}>
                          <LabelList
                            dataKey="amount"
                            position="top"
                            formatter={(value) => `₹${value.toLocaleString()}`}
                            style={{ fontSize: 12, fill: "#16FF00" }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      minWidth: 40,
                      width: 20, // Reduced width
                      height: 20, // Reduced height
                      backgroundColor: "#ff5722", // Customize color
                      "&:hover": {
                        backgroundColor: "#e64a19",
                      },
                      margin: "0 10px",
                    }}
                    onClick={() => setCurrentYear((prevYear) => prevYear - 1)}
                  >
                    <FaArrowLeft size={20} color="#fff" /> {/* Reduced size */}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      minWidth: 40,
                      width: 20, // Reduced width
                      height: 20, // Reduced height
                      backgroundColor: "#ff5722", // Customize color
                      "&:hover": {
                        backgroundColor: "#e64a19",
                      },
                      margin: "0 10px",
                    }}
                    onClick={() => setCurrentYear((prevYear) => prevYear + 1)}
                  >
                    <FaArrowRight size={20} color="#fff" /> {/* Reduced size */}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </div>
      </div>
    </Dialog>
  );
};

export default PaymentBarChartDialog;
