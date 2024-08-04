import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
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

  console.log('Updated room status:', roomStatus);

  // Check if there are any rooms with data
  const hasData = Object.keys(roomStatus).some(floor =>
    Object.keys(roomStatus[floor]).some(room =>
      roomStatus[floor][room].single >= 0 || roomStatus[floor][room].double >= 0 || roomStatus[floor][room].triple >= 0
    )
  );

  if (!hasData) {
    return (
      <Dialog open={open} onClose={onClose} className="room-matrix-dialog">
        <DialogTitle>Room Matrix</DialogTitle>
        <DialogContent>
          <div className='empty'>No data available</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} className="room-matrix-dialog">
      <DialogTitle>Room Matrix</DialogTitle>
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
      <DialogContent>
        <div className="room-matrix">
          {[...Array(pgDetails.totalFloors)].map((_, floorIndex) => {
            const floor = floorIndex + 1;
            return (
              <div key={floor} className="floor1">
                {[...Object.keys(roomStatus[floor])].map(roomNo => {
                  const room = roomStatus[floor] && roomStatus[floor][roomNo] || { single: -1, double: -1, triple: -1 };
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomMatrixDialog;
