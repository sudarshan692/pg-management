import { auth } from '../shared/firebase';

// Function to get the current user's ID
export const getCurrentUserID = () => {
  const user = auth.currentUser;
  if (user) {
    return user.uid;
  } else {
    // Handle no user signed in case (optional)
    return null;
  }
};

