import React, { useState, useEffect } from "react";
import {Dialog, DialogTitle, DialogContent, IconButton, Button} from "@mui/material";
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer} from "recharts";
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

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const tickFormatter = (value) => {
    const month = monthNames[value - 1];
    return `${month}-${currentYear}`;
  };

  const yAxisTickFormatter = (value) => {
    return `₹${value.toLocaleString()}`;
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(138, 134, 134, 0.7)",
    zIndex: 1,
  };

  const dialogContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    height: "100vh",
  };

  const scrollContainerStyle = {
    overflowX: "auto",
    width: "100%",
  };

  const chartStyle = {
    width: "1200px",
    height: "450px",
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullScreen
      aria-labelledby="payment-bar-chart-dialog"
      sx={{
        "& .MuiDialog-paper": {
          boxShadow: "none",
          backgroundColor: "transparent",
        },
      }}
    >
      <div style={dialogContainerStyle}>
        <div style={overlayStyle} />
        <div className="dialog-content1">
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
                <div style={scrollContainerStyle}>
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
                              const month = monthNames[label - 1]; 
                              const year = currentYear; 
                              const amount = payload[0].value;

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
                      width: 20,
                      height: 20, 
                      backgroundColor: "#ff5722",
                      "&:hover": {
                        backgroundColor: "#e64a19",
                      },
                      margin: "0 10px",
                    }}
                    onClick={() => setCurrentYear((prevYear) => prevYear - 1)}
                  >
                    <FaArrowLeft size={20} color="#fff" /> 
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      minWidth: 40,
                      width: 20, 
                      height: 20, 
                      backgroundColor: "#ff5722",
                      "&:hover": {
                        backgroundColor: "#e64a19",
                      },
                      margin: "0 10px",
                    }}
                    onClick={() => setCurrentYear((prevYear) => prevYear + 1)}
                  >
                    <FaArrowRight size={20} color="#fff" />
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
