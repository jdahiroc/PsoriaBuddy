import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

const createMeeting = async (patientUID, dermatologistUID) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error('User not authenticated.');
    return;
  }

  const functions = getFunctions();
  const createMeetingLink = httpsCallable(functions, "createMeeting");

  try {
    const result = await createMeetingLink({ patientUID, dermatologistUID });
    console.log('Meeting URL:', result.data.url);
    return result.data.url;
  } catch (error) {
    console.error('Error creating meeting:', error.message);
    return null;
  }
};

export default createMeeting;
