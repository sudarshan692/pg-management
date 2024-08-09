import React from "react";
import "./roomMatrixDialog.css"; // Import the CSS file

const RoomMatrixDialog = ({ open, onClose, pgDetails, payingGuests }) => {
  // Initialize room status with total beds and empty guests array
  const roomStatus = {};

  let roomCounter = 1; // Initialize room number counter

  // Set up initial status for each floor and room
  for (let floor = 1; floor <= pgDetails.totalFloors; floor++) {
    roomStatus[floor] = {};
    for (let room = 1; room <= pgDetails.totalRoomsPerFloor; room++) {
      roomStatus[floor][roomCounter] = {
        single: { count: pgDetails.singleBedsPerRoom, guests: [] },
        double: { count: pgDetails.doubleSharingBedsPerRoom, guests: [] },
        triple: { count: pgDetails.tripleSharingBedsPerRoom, guests: [] },
      };
      roomCounter++; // Increment room number for each room
    }
  }

  // Update roomStatus based on payingGuests
  payingGuests.forEach((guest) => {
    const { floorNo, roomNo, roomType, guestID } = guest;
    const roomTypeMapping = { S: "single", D: "double", T: "triple" };
    const type = roomTypeMapping[roomType];

    if (
      roomStatus[floorNo] &&
      roomStatus[floorNo][roomNo] &&
      roomStatus[floorNo][roomNo][type] !== undefined
    ) {
      roomStatus[floorNo][roomNo][type].count -= 1;
      roomStatus[floorNo][roomNo][type].guests.push(guestID);
    }
  });

  // Function to calculate total available beds
  const calculateTotalAvailableBeds = (type) => {
    return Object.values(roomStatus).reduce((total, floor) => {
      return (
        total +
        Object.values(floor).reduce((floorTotal, room) => {
          return floorTotal + (room[type].count > 0 ? room[type].count : 0);
        }, 0)
      );
    }, 0);
  };

  const totalAvailableSingle = calculateTotalAvailableBeds("single");
  const totalAvailableDouble = calculateTotalAvailableBeds("double");
  const totalAvailableTriple = calculateTotalAvailableBeds("triple");

  // Check if there are any rooms with data
  const hasData = Object.keys(roomStatus).some((floor) =>
    Object.keys(roomStatus[floor]).some((room) => {
      const { single, double, triple } = roomStatus[floor][room];
      return single.count >= 0 || double.count >= 0 || triple.count >= 0;
    })
  );

  if (!hasData) {
    return (
      <div
        className="room-matrix-dialog-overlay"
        style={{ display: open ? "flex" : "none" }}
      >
        <div className="room-matrix-dialog">
          <div className="dialog-header">
            <div className="dialog-title">Room Matrix</div>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="empty">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="room-matrix-dialog-overlay"
      style={{ display: open ? "flex" : "none" }}
    >
      <div className="room-matrix-dialog">
        <div className="dialog-header">
          <div className="dialog-title">Room Matrix</div>
          <button className="close-button1" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="legend">
          <div className="legend-item">
            <div className="color-box available"></div>
            <span>Available Beds</span>
          </div>
          <div className="legend-item">
            <div className="color-box filled"></div>
            <span>Full Beds</span>
          </div>
        </div>
        <div className="dialog-content">
          <div className="totals">
            <div className="total-beds-heading">Total Available Beds</div>
            <div>
              <span className="total-beds">Single Beds</span> <span className="value">{totalAvailableSingle}</span>
            </div>
            <div>
              <span className="total-beds">Double Beds</span> <span className="value">{totalAvailableDouble}</span>
            </div>
            <div>
              <span className="total-beds">Triple Beds</span> <span className="value">{totalAvailableTriple}</span>
            </div>
          </div>

          <div className="room-matrix">
            {[...Array(pgDetails.totalFloors)].map((_, floorIndex) => {
              const floor = floorIndex + 1;
              return (
                <div key={floor} className="floor1">
                  {[...Object.keys(roomStatus[floor])].map((roomNo) => {
                    const room = roomStatus[floor][roomNo] || {
                      single: { count: -1, guests: [] },
                      double: { count: -1, guests: [] },
                      triple: { count: -1, guests: [] },
                    };
                    return (
                      <div key={roomNo} className="room-container">
                        <div className="room-header">
                          F{floor}R{roomNo}
                        </div>
                        <div className="room-content">
                          {room.single.count !== -1 && (
                            <div
                              className={`room-compartment ${
                                room.single.count === 0 ? "filled" : "available"
                              }`}
                            >
                              {room.single.count}(S)
                            </div>
                          )}
                          <div className="guest-ids">
                            {room.single.guests.map((id) => (
                              <div key={`S-${id}`} className="guest-id">G{id}</div>
                            ))}
                          </div>
                          {room.double.count !== -1 && (
                            <div
                              className={`room-compartment ${
                                room.double.count === 0 ? "filled" : "available"
                              }`}
                            >
                              {room.double.count}(D)
                            </div>
                          )}
                          <div className="guest-ids">
                            {room.double.guests.map((id) => (
                              <div key={`D-${id}`} className="guest-id">G{id}</div>
                            ))}
                          </div>
                          {room.triple.count !== -1 && (
                            <div
                              className={`room-compartment ${
                                room.triple.count === 0 ? "filled" : "available"
                              }`}
                            >
                              {room.triple.count}(T)
                            </div>
                          )}
                          <div className="guest-ids">
                            {room.triple.guests.map((id) => (
                              <div key={`T-${id}`} className="guest-id">G{id}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomMatrixDialog;
