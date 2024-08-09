import React from 'react';
import './roomMatrixDialog.css'; // Import the CSS file

const RoomMatrixDialog = ({ open, onClose, pgDetails, payingGuests }) => {
  // Initialize room status with total beds based on pgDetails
  const roomStatus = {};
  
  let roomCounter = 1; // Initialize room number counter

  // Set up initial status for each floor and room
  for (let floor = 1; floor <= pgDetails.totalFloors; floor++) {
    roomStatus[floor] = {};
    for (let room = 1; room <= pgDetails.totalRoomsPerFloor; room++) {
      roomStatus[floor][roomCounter] = {
        single: pgDetails.singleBedsPerRoom,
        double: pgDetails.doubleSharingBedsPerRoom,
        triple: pgDetails.tripleSharingBedsPerRoom
      };
      roomCounter++; // Increment room number for each room
    }
  }

  // Update roomStatus based on payingGuests
  payingGuests.forEach(guest => {
    const { floorNo, roomNo, roomType } = guest;
    const roomTypeMapping = { 'S': 'single', 'D': 'double', 'T': 'triple' };
    const type = roomTypeMapping[roomType];

    if (roomStatus[floorNo] && roomStatus[floorNo][roomNo] && roomStatus[floorNo][roomNo][type] !== undefined) {
      roomStatus[floorNo][roomNo][type] -= 1;
    }
  });

  // Function to calculate total available beds
  const calculateTotalAvailableBeds = (type) => {
    return Object.values(roomStatus).reduce((total, floor) => {
      return total + Object.values(floor).reduce((floorTotal, room) => {
        return floorTotal + (room[type] > 0 ? room[type] : 0);
      }, 0);
    }, 0);
  };

  const totalAvailableSingle = calculateTotalAvailableBeds('single');
  const totalAvailableDouble = calculateTotalAvailableBeds('double');
  const totalAvailableTriple = calculateTotalAvailableBeds('triple');

  // Check if there are any rooms with data
  const hasData = Object.keys(roomStatus).some(floor =>
    Object.keys(roomStatus[floor]).some(room => {
      const { single, double, triple } = roomStatus[floor][room];
      return (single >= 0 || double >= 0 || triple >= 0);
    })
  );

  if (!hasData) {
    return (
      <div className="room-matrix-dialog-overlay" style={{ display: open ? 'flex' : 'none' }}>
        <div className="room-matrix-dialog">
          <div className="dialog-header">
            <div className="dialog-title">Room Matrix</div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className='empty'>No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-matrix-dialog-overlay" style={{ display: open ? 'flex' : 'none' }}>
      <div className="room-matrix-dialog">
        <div className="dialog-header">
          <div className="dialog-title">Room Matrix</div>
          <button className="close-button1" onClick={onClose}>×</button>
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
            <div>Total Available Beds</div>
            <div>Single Beds: {totalAvailableSingle}</div>
            <div>Double Beds: {totalAvailableDouble}</div>
            <div>Triple Beds: {totalAvailableTriple}</div>
          </div>
          <div className="room-matrix">
            {[...Array(pgDetails.totalFloors)].map((_, floorIndex) => {
              const floor = floorIndex + 1;
              return (
                <div key={floor} className="floor1">
                  {[...Object.keys(roomStatus[floor])].map(roomNo => {
                    const room = (roomStatus[floor] && roomStatus[floor][roomNo]) || { single: -1, double: -1, triple: -1 };
                    return (
                      <div key={roomNo} className="room-container">
                        <div className="room-header">F{floor}R{roomNo}</div>
                        <div className="room-content">
                          {room.single !== -1 && (
                            <div className={`room-compartment ${room.single === 0 ? 'filled' : 'available'}`}>
                              {room.single}(S)
                            </div>
                          )}
                          {room.double !== -1 && (
                            <div className={`room-compartment ${room.double === 0 ? 'filled' : 'available'}`}>
                              {room.double}(D)
                            </div>
                          )}
                          {room.triple !== -1 && (
                            <div className={`room-compartment ${room.triple === 0 ? 'filled' : 'available'}`}>
                              {room.triple}(T)
                            </div>
                          )}
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
