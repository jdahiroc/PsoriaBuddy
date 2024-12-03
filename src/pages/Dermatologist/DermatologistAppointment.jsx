// Styles
import "../../css/dermatologistappointment.css";
// Assets
import profile from "../../assets/background/Profile.png";
import AcceptIcon from "../../assets/background/Accept.png";
import CancelIcon from "../../assets/background/Close.png";
// Sidebar
import Sidebar from "../../pages/Sidebar/DSidebar";
// Ant Design Components
import { Space, Table, Modal, Divider, message, Skeleton, Select } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
// MUI Design Components
import TextField from "@mui/material/TextField";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
// React Hooks
import { useState, useEffect } from "react";
// Firebase Config
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";
// Firebase Functions
import { getFunctions, httpsCallable } from "firebase/functions";
// EmailJS
import emailjs from "emailjs-com";

//  Livekit
import axios from "axios";

const DermatologistAppointment = () => {
  // State variables
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [open, setOpen] = useState(false);
  // Initialize the table components
  const { Column, ColumnGroup } = Table;
  // Confirm Modal from Ant Design
  const { confirm } = Modal;
  const [confirmLoading, setConfirmLoading] = useState(false);
  // Appointment Data fetch from Firestore
  const [appointments, setAppointments] = useState([]);

  // Form Data for Appointment Confirmation
  const [formData, setFormData] = useState({
    patientName: "",
    appointmentTime: dayjs(),
    appointmentDate: dayjs(),
    serviceType: "online",
    patientEmail: "",
    meetingLink: "",
  });

  // Handle Delete Confirmation
  const showDeleteConfirm = (appointmentId) => {
    confirm({
      title: "Do you want to decline the request?",
      icon: <ExclamationCircleFilled />,
      content:
        "This request will be declined and permanently removed from the list. Are you sure you want to continue?",
      async onOk() {
        try {
          // Delete the appointment from Firestore
          await deleteDoc(doc(db, "appointments", appointmentId));

          // Update the appointments state to immediately reflect the deletion
          setAppointments((prevAppointments) =>
            prevAppointments.filter(
              (appointment) => appointment.key !== appointmentId
            )
          );

          message.success("Appointment removed successfully.");
        } catch (error) {
          console.error("Error declining the appointment:", error);
          message.error("Failed to decline the appointment.");
        }
      },
      onCancel() {
        message.info("Decline action cancelled.");
      },
    });
  };

  // Accept Confirmation Functions
  const [acceptConfirm, setAcceptConfirm] = useState(false);
  const showConfirmModal = (record) => {
    setFormData((prev) => ({
      ...prev,
      key: record.key,
      patientName: `${record.patientFirstName} ${record.patientLastName}`,
      patientEmail: record.patientEmail,
      serviceType: record.service,
      appointmentDate: record.appointmentDate
        ? dayjs(record.appointmentDate)
        : null,
      appointmentTime: record.appointmentTime
        ? dayjs(record.appointmentTime)
        : null,
    }));
    setAcceptConfirm(true);
  };

  //  Identify the PASI Score Severity
  const getPasiSeverity = (score) => {
    if (score <= 5) {
      return "None to Mild Psoriasis";
    } else if (score <= 10) {
      return "Moderate Psoriasis";
    } else {
      return "Severe Psoriasis";
    }
  };

  // Function to Open My Experiences
  // Show Patients My Experiences
  const showExperience = async (appointmentId) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Fetch the appointment
      const appointmentDoc = await getDoc(
        doc(db, "appointments", appointmentId)
      );

      if (!appointmentDoc.exists()) {
        message.error("Appointment not found.");
        return;
      }

      const appointmentData = appointmentDoc.data();

      // Ensure only the assigned dermatologist can view the appointment
      if (appointmentData.dermatologistUID !== currentUser.uid) {
        message.error("You are not authorized to view this experience.");
        return;
      }

      // Extract the experience data from the appointment
      const experienceData = appointmentData.experience;

      if (!experienceData) {
        message.error("Experience data is missing from the appointment.");
        return;
      }

      setSelectedExperience(experienceData);
      setOpen(true);
    } catch (error) {
      message.error("Failed to fetch experience details.");
    }
  };

  // ---------------------- Create Meeting Link ---------------------- //
  // ---------------------- Temporary using Axios ---------------------- //

  // Handles Create Meeting Link
  const handleCreateMeetingLink = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        message.error("You must be logged in to generate a meeting link.");
        return;
      }

      // Retrieve Firebase ID token
      const idToken = await user.getIdToken();

      // Send request to the backend to generate the meeting link
      const response = await axios.post(
        `https://psoria-buddy.vercel.app/api/generate-meeting-link`,
        { roomName: `session-${Date.now()}` },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data && response.data.meetingLink) {
        setFormData((prev) => ({
          ...prev,
          meetingLink: response.data.meetingLink,
        }));
        console.log("Generated Meeting Link:", response.data.meetingLink);
        message.success("Meeting link generated successfully!");
      } else {
        throw new Error("Invalid response from the server");
      }
    } catch (error) {
      console.error("Error generating meeting link:", error.message);
      message.error("Failed to generate meeting link.");
    }
  };

  // ---------------------- END of Creating Meeting Link ---------------------- //

  //  Handles onOk Appointment Confirmation
  const handleAppointmentConfirmation = async () => {
    if (
      !formData.patientName ||
      !formData.appointmentDate ||
      !formData.appointmentTime
    ) {
      message.error("Please fill in all required fields before confirming.");
      return;
    }
    //  Display loading
    setConfirmLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        message.error("User not authenticated.");
        setConfirmLoading(false);
        return;
      }

      await addDoc(collection(db, `users/${currentUser.uid}/scheduled`), {
        ...formData,
        meetingLink:
          formData.serviceType === "Video-Meet" ? formData.meetingLink : null,
        appointmentTime: formData.appointmentTime
          ? formData.appointmentTime.toDate()
          : null,
        appointmentDate: formData.appointmentDate
          ? formData.appointmentDate.toDate()
          : null,
        createdAt: new Date(),
      });

      // Delete the approved booking request from appointments
      await deleteDoc(doc(db, "appointments", formData.key));

      // Update the appointments state to immediately reflect the deletion
      setAppointments((prevAppointments) =>
        prevAppointments.filter(
          (appointment) => appointment.key !== formData.key
        )
      );

      //  Notification Popup when Appointment is saved
      message.success("Appointment saved successfully.");

      //  Initialize the EmailJS variables
      const emailjs_serviceid = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const emailjs_templateid = import.meta.env
        .VITE_EMAILJS_APPOINTMENT_TEMPLATE_ID;
      const emailjs_publickey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      //  Forms Data
      const emailContent = {
        patientName: formData.patientName || "No Name Provided",
        appointmentDate: formData.appointmentDate
          ? formData.appointmentDate.format("YYYY-MM-DD")
          : "No Date Provided",
        appointmentTime: formData.appointmentTime
          ? formData.appointmentTime.format("HH:mm A")
          : "No Time Provided",
        serviceType: formData.serviceType || "No Service Type Provided",
        patientEmail: formData.patientEmail || "No Email Provided",
        to_email: formData.patientEmail || "No Email Provided",
        meetingLink:
          formData.serviceType === "Video-Meet"
            ? formData.meetingLink || "Meeting link not generated"
            : "No meeting link",
      };

      // Send email notification via EmailJS
      await emailjs.send(
        emailjs_serviceid,
        emailjs_templateid,
        emailContent,
        emailjs_publickey
      );

      // Notification Popup when Email is sent to the Patient
      message.success("Patient notified via email.");
      // Hide the Accept Confirmation Modal
      setAcceptConfirm(false);
    } catch (error) {
      console.error("Error saving appointment or sending notification:", error);
      message.error("Failed to save appointment or notify the user.");
    } finally {
      setConfirmLoading(false);
    }
  };

  //  Get List of Appointments booked by patients from Firestore
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      message.error("No authenticated user found.");
      return;
    }

    const dermatologistUID = currentUser.uid;
    const appointmentsRef = collection(db, "appointments");
    const q = query(
      appointmentsRef,
      where("dermatologistUID", "==", dermatologistUID)
    );

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedAppointments = querySnapshot.docs.map((doc) => ({
          key: doc.id,
          ...doc.data(),
        }));

        setAppointments(fetchedAppointments);
        setLoading(false); // Stop the loader after data is fetched
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        message.error("Failed to fetch appointments.");
        setLoading(false); // Stop the loader on error
      }
    );

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* Accept Confirmation */}
      <Modal
        title={
          <p
            style={{
              color: "#393939",
              fontSize: 27,
              fontFamily: "Inter, san-serif",
              fontWeight: 700,
            }}
          >
            Apppointment Confirmation
          </p>
        }
        open={acceptConfirm}
        onOk={handleAppointmentConfirmation}
        confirmLoading={confirmLoading}
        onCancel={() => setAcceptConfirm(false)}
      >
        <div className="dermatologist-accept-confirm-container">
          <div className="dermatologist-firstsection-content">
            {formData.serviceType === "Video-Meet" && (
              <div className="dermatologist-meetinglink-input">
                <TextField
                  id="meetinglink"
                  label="Meeting Link"
                  variant="outlined"
                  value={formData.meetingLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meetingLink: e.target.value,
                    }))
                  }
                  inputProps={{
                    style: {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                    title: formData.meetingLink,
                  }}
                />
                {/* Generate only one link */}
                <button
                  onClick={handleCreateMeetingLink}
                  disabled={isGeneratingLink || formData.meetingLink}
                >
                  {isGeneratingLink
                    ? "Creating..."
                    : formData.meetingLink
                    ? "Link Generated"
                    : "Create Meet Link"}
                </button>

                {/* Add Copy Link Button when */}
                {formData.meetingLink && (
                  <div className="copy-meetinglink-container">
                    <button
                      onClick={() => {
                        navigator.clipboard
                          .writeText(formData.meetingLink)
                          .then(() => {
                            message.success(
                              "Meeting link copied to clipboard!"
                            );
                          });
                      }}
                      disabled={!formData.meetingLink}
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="dermatologist-appointmentTime-input">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Appointment Time"
                  value={formData.appointmentTime}
                  onChange={(newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      appointmentTime: newValue ? dayjs(newValue) : null,
                    }));
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
          <div className="dermatologist-secondsection-content">
            <div className="dermatologist-patientName-input">
              <TextField
                id="patientName"
                label="Patient Name"
                variant="outlined"
                value={formData.patientName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    patientName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="dermatologist-appointmentDate-input">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Appointment Date"
                  value={formData.appointmentDate}
                  onChange={(newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      appointmentDate: newValue ? dayjs(newValue) : null,
                    }));
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
          <div className="dermatologist-servicetype-container">
            <Select
              defaultValue="Select Service"
              onChange={(value) =>
                setFormData({ ...formData, serviceType: value })
              }
              options={[
                {
                  value: "Select Service",
                  label: <span>Select Service</span>,
                },
                { value: "Video-Meet", label: <span>Video Meet</span> },
                { value: "On-site", label: <span>On-site</span> },
              ]}
              style={{
                width: 212,
                height: 50,
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
              }}
            />
          </div>
        </div>
      </Modal>

      {/* View Details */}
      <Modal
        centered
        title={
          <p
            style={{
              color: "#FFFFFF",
              fontSize: 27,
              fontFamily: "Inter, san-serif",
              fontWeight: 700,
            }}
          >
            {selectedExperience ? selectedExperience.title : ""}
          </p>
        }
        open={open}
        onCancel={() => setOpen(false)}
        width={1000}
        className="experience-modal-open"
        footer={null}
      >
        {loading ? (
          <div className="loading-container">
            <Skeleton />
          </div>
        ) : (
          <div className="preview-myexperience-container">
            <div className="preview-myexperience-contents">
              {/* Left Section Contents */}
              <div className="preview-myexperience-leftsection">
                {/* TYPES OF PSORIASIS */}
                <div className="preview-typesofpsoriasis-container">
                  <div className="preview-typesofpsoriasis-label">
                    <h3>Type of Psoriasis</h3>
                  </div>
                  <div className="preview-typesofpsoriasis-input">
                    <input
                      type="text"
                      value={
                        selectedExperience
                          ? selectedExperience.typesOfPsoriasis
                          : ""
                      }
                      disabled
                    />
                  </div>
                </div>
                {/* TIME AND DATE OCCURED */}
                <div className="preview-timedate-container">
                  <div className="preview-timeoccured-content">
                    {/* Time Occured */}
                    <div className="preview-timeoccured">
                      <div className="preview-timeoccured-label">
                        <h3>Time Symptom Occur</h3>
                      </div>
                      <div className="preview-timeoccured-input">
                        <input
                          type="text"
                          value={
                            selectedExperience
                              ? selectedExperience.timeSymptomOccur
                              : ""
                          }
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  {/* Date Occured */}
                  <div className="preview-dateoccured-content">
                    <div className="preview-dateoccured-label">
                      <h3>Date Symptom Occur</h3>
                    </div>
                    <div className="preview-dateoccured-input">
                      <input
                        type="text"
                        value={
                          selectedExperience
                            ? selectedExperience.dateSymptomOccur
                            : ""
                        }
                        disabled
                      />
                    </div>
                  </div>
                </div>
                {/* LOCATION */}
                <div className="preview-location-container">
                  <div className="preview-location-label">
                    <h3>Location</h3>
                    <div className="preview-location-description">
                      <p>(What part on the body were affected?)</p>
                    </div>
                  </div>
                  <div className="preview-location-input">
                    <input
                      type="text"
                      value={
                        selectedExperience
                          ? selectedExperience.affectedArea
                          : ""
                      }
                      disabled
                    />
                  </div>
                </div>
                {/* RELIEF MEASURES */}
                <div className="preview-reliefmeasures-container">
                  <div className="preview-reliefmeasures-label">
                    <h3>Relief Measures</h3>
                    <div className="preview-reliefmeasures-description">
                      <p>
                        (What actions were taken to relieve the symptoms (e.g.,
                        rest, medication, hydration)
                      </p>
                    </div>
                  </div>
                  <div className="preview-reliefmeasures-input">
                    <input
                      type="text"
                      value={
                        selectedExperience
                          ? selectedExperience.reliefMeasures
                          : ""
                      }
                      disabled
                    />
                  </div>
                </div>
                {/* TRIGGERS */}
                <div className="preview-triggers-container">
                  <div className="preview-triggers-label">
                    <h3>Triggers</h3>
                    <div className="preview-triggers-description">
                      <p>(What are the causes that triggers your symptom?)</p>
                    </div>
                  </div>
                  <div className="preview-triggers-input">
                    <input
                      type="text"
                      value={
                        selectedExperience ? selectedExperience.triggers : ""
                      }
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Right Section Content */}
              <div className="preview-myexperience-rightsection">
                {/* Associated Symptoms */}
                <div className="preview-associated-container">
                  <div className="preview-associated-label">
                    <h3>Associated Symptoms</h3>
                    <div className="preview-associated-description">
                      <p>(Any other symptoms that occur simultaneously.)</p>
                    </div>
                  </div>
                  <div className="preview-associated-input">
                    <input
                      type="text"
                      value={
                        selectedExperience
                          ? selectedExperience.associatedSymptoms
                          : ""
                      }
                      disabled
                    />
                  </div>
                </div>
                {/* Divider */}
                <div className="preview-divider">
                  <Divider
                    plain
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      borderColor: "#FFFFFF",
                    }}
                  >
                    <span style={{ color: "#FFFFFF", fontSize: 17 }}>
                      PASI Score Result
                    </span>
                  </Divider>
                </div>
                {/* PASI Score Result  */}
                <div className="preview-pasiresult-container">
                  {/* PASI Score */}
                  <div className="preview-pasiresult">
                    <span>
                      {selectedExperience
                        ? `${selectedExperience.pasiScore} ${getPasiSeverity(
                            selectedExperience.pasiScore
                          )}`
                        : ""}
                    </span>
                  </div>
                  {/* PASI Score Description */}
                  <div className="preview-pasiresult-description">
                    <p>
                      <span>0 to 5:</span> None to Mild Psoriasis
                    </p>
                    <p>
                      <span>6 to 10:</span> Moderate Psoriasis
                    </p>
                    <p>
                      <span>11 or Above:</span> Severe Psoriasis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="dermatologist-appointment-container">
        <Sidebar />
        <div className="dermatologist-appointment-contents">
          <div className="dermatologist-header-container">
            <div className="dermatologist-appointment-h2">
              <h2>Appointments</h2>
            </div>
            <div className="dermatologist-appointment-table">
              <Table dataSource={appointments} loading={loading}>
                <ColumnGroup title="Name">
                  <Column
                    title="First Name"
                    dataIndex="patientFirstName"
                    key="patientFirstName"
                  />
                  <Column
                    title="Last Name"
                    dataIndex="patientLastName"
                    key="patientLastName"
                  />
                </ColumnGroup>
                <Column
                  title="Status"
                  dataIndex="patientStatus"
                  key="patientStatus"
                />
                <Column
                  title="Email"
                  dataIndex="patientEmail"
                  key="patientEmail"
                />
                <Column
                  title="Contact Number"
                  dataIndex="patientContact"
                  key="patientContact"
                />
                <Column title="Gender" dataIndex="gender" key="gender" />
                <Column title="Service" dataIndex="service" key="service" />
                <Column
                  title="Preferred Day of the Week"
                  dataIndex="preferredDay"
                  key="preferredDay"
                />
                <Column
                  title="Preferred Time of the Day"
                  dataIndex="preferredTime"
                  key="preferredTime"
                />
                <Column
                  title=""
                  key="myexperiences"
                  render={(record) => (
                    <Space size="middle">
                      <div className="myexperience-button">
                        <button onClick={() => showExperience(record.key)}>
                          <div className="viewdetails-icon">
                            <img src={profile} alt="person-icon" />
                          </div>
                          View Details
                        </button>
                      </div>
                    </Space>
                  )}
                />
                <Column
                  title="Action"
                  key="action"
                  render={(record) => (
                    <Space size="middle">
                      <div className="action-container">
                        <div className="accept-action">
                          <button onClick={() => showConfirmModal(record)}>
                            <img src={AcceptIcon} alt="Accept" />
                          </button>
                        </div>
                        <div className="delete-action">
                          <button onClick={() => showDeleteConfirm(record.key)}>
                            <img src={CancelIcon} alt="Cancel" />
                          </button>
                        </div>
                      </div>
                    </Space>
                  )}
                />
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DermatologistAppointment;
