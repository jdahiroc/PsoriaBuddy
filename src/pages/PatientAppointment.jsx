// Styles
import "../styles/patientappointment.css";
// React Hooks
import { useState, useEffect, useContext } from "react";
// Firebase Configs
import { db } from "../../firebaseConfig";
import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
// Sidebar Components
import Sidebar from "./Sidebar/Sidebar";
// Assets
import filtericon from "../assets/patient/filter-icon.png";
import dermatologistProfile from "../assets/background/Ellipse5.png";
import videomeeticon from "../assets/patient/videocam.png";
import onsiteicon from "../assets/patient/on-site.png";
import scheduleIcon from "../assets/patient/schedule-icon.png";
// Ant Design Components
import {
  Select,
  Modal,
  Divider,
  Radio,
  Spin,
  Empty,
  message,
  Alert,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
// AuthContext to get currentUser
import { AuthContext } from "../context/AuthContext";
import Dermatologistprofile from "./Dermatologist/Dermatologistprofile";

const PatientAppointment = () => {
  // Loading State
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Data Display State
  const [viewProfileModal, setViewProfileModal] = useState(false);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [selectedDermatologist, setSelectedDermatologist] = useState(null);
  const [filterBy, setFilterBy] = useState("All");

  // Dermatology Profile Data
  const [patientStatus, setPatientStatus] = useState(1);
  const [patientFirstName, setPatientFirstName] = useState("");
  const [patientLastName, setPatientLastName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientContact, setPatientContact] = useState("");
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [preferredDay, setPreferredDay] = useState(null);
  const [preferredTime, setPreferredTime] = useState(null);

  // CurrentUser from AuthContext
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    setSpinning(true);

    const dermatologistQuery = query(
      collection(db, "users"),
      where("userType", "==", "Dermatologist"),
      where("isVerified", "==", true)
    );

    const unsubscribe = onSnapshot(
      dermatologistQuery,
      (querySnapshot) => {
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDermatologistData(fetchedData);
        setSpinning(false);
      },
      (error) => {
        console.error("Error fetching data:", error);
        setSpinning(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchDermatologists = async (filter) => {
    setSpinning(true);

    try {
      let dermatologistQuery;

      if (filter === "By Location") {
        // Fetch dermatologists with a non-empty location
        dermatologistQuery = query(
          collection(db, "users"),
          where("userType", "==", "Dermatologist"),
          where("isVerified", "==", true),
          where("location", "!=", "") // Avoids empty locations
        );
      } else if (filter === "All") {
        // Fetch all verified dermatologists regardless of location
        dermatologistQuery = query(
          collection(db, "users"),
          where("userType", "==", "Dermatologist"),
          where("isVerified", "==", true)
        );
      }

      const querySnapshot = await getDocs(dermatologistQuery);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDermatologistData(fetchedData); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching dermatologists:", error);
    } finally {
      setSpinning(false);
    }
  };

  //  Display all dermatologist that has location
  useEffect(() => {
    fetchDermatologists(filterBy); // Fetch data based on the selected filter
  }, [filterBy]);

  //  Handle Filter Change value
  const handleFilterChange = (value) => {
    setFilterBy(value); // Update filter value
  };

  // Function to reset all forms
  const resetForms = () => {
    // Radio Buttons
    setPatientStatus(1); // Reset to default or initial value
    // Input Components
    setPatientFirstName("");
    setPatientLastName("");
    setPatientEmail("");
    setPatientContact("");
    // Reset Select components
    setSelectedGender(null);
    setSelectedService(null);
    setSelectedExperience(null);
    setPreferredDay(null);
    setPreferredTime(null);
  };

  // Radio Button for Patient Status
  const onChangePatientStatus = (e) => {
    setPatientStatus(e.target.value);
  };

  // View Profile Modal
  const openViewProfileModal = (dermatologist) => {
    setSelectedDermatologist(dermatologist);
    setViewProfileModal(true);
  };

  // Appointment Modal
  const openAppointmentModal = (dermatologist) => {
    setSelectedDermatologist(dermatologist);
    setAppointmentModal(true);
  };

  // Function to show loader (loading spinner)
  const showLoader = () => {
    setSpinning(true);
    let ptg = -10;
    const interval = setInterval(() => {
      ptg += 5;
      setPercent(ptg);
      if (ptg > 100) {
        // Change condition to 100
        clearInterval(interval);
        setSpinning(false);
        setPercent(0);
      }
    }, 100);
  };

  // OK Button Function
  const handleOk = () => {
    setSpinning(true);
    resetForms(); // Clear all forms before closing
    setViewProfileModal(false);
    setAppointmentModal(false);
    setSelectedDermatologist(null);
  };

  // Cancel Button Function
  const handleCancel = () => {
    resetForms(); // Clear all forms before closing
    setViewProfileModal(false);
    setAppointmentModal(false);
    setSelectedDermatologist(null);
  };

  // Function to show confirmation message
  const showConfirmMessage = () => {
    Modal.success({
      title: "Appointment Confirmed",
      content:
        "Your appointment has been sent to your Dermatologist. Please wait for future updates!",
      okText: "OK",
    });
  };

  // Close Alert States
  const [visible, setVisible] = useState(true);
  //  Close Function for My Experience
  const handleClose = () => {
    setVisible(false);
  };

  // Function to check if the form is completely filled
  const isFormComplete = () => {
    return (
      patientFirstName &&
      patientLastName &&
      patientEmail &&
      patientContact &&
      selectedGender &&
      selectedService &&
      preferredDay &&
      preferredTime
    );
  };

  // Save Book an Appointment Function
  const saveAppointment = async () => {
    if (!selectedDermatologist || !isFormComplete()) {
      message.error("Please complete all fields.");
      setSpinning(false);
      return;
    }

    if (!selectedExperience) {
      message.error("Please select an experience.");
      return;
    }

    try {
      await addDoc(collection(db, "appointments"), {
        service: selectedService,
        experience: selectedExperienceDetails,
        preferredDay,
        preferredTime,
        patientStatus,
        patientFirstName,
        patientLastName,
        patientEmail,
        patientContact,
        gender: selectedGender,
        patientUID: currentUser.uid,
        dermatologistUID: selectedDermatologist.id,
        status: "Pending",
        createdAt: new Date(),
      });

      message.success("Appointment request sent successfully!");
      resetForms();
      handleOk();
    } catch (error) {
      console.error("Error saving appointment:", error);
      message.error("Failed to send appointment request. Try again.");
    }
  };

  // Function to set an appointment
  const handleSetAppointment = async () => {
    setConfirmLoading(true);
    setSpinning(true); // Start spinner here

    try {
      // Wait for appointment saving to complete
      await saveAppointment();
      // Show success message
      showConfirmMessage();
      // Reset form values
      resetForms();
      // Close the modal
      handleOk();
    } catch (error) {
      console.error("Error setting appointment:", error);
    } finally {
      setSpinning(false);
      setConfirmLoading(false);
    }
  };

  // State to store dermatologist data
  const [dermatologistData, setDermatologistData] = useState([]);
  // State to store my experiences
  const [myExperiences, setMyExperiences] = useState([]);
  const [selectedExperienceId, setSelectedExperienceId] = useState(null);
  const [selectedExperienceDetails, setSelectedExperienceDetails] =
    useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchMyExperiences();
    }
  }, [currentUser]);

  // Handle Experience Selection
  const handleExperienceSelect = (experienceId) => {
    const experience = myExperiences.find((exp) => exp.id === experienceId);
    // Set the selected experience ID
    setSelectedExperienceId(experienceId);
    // Set the title or other relevant value from the experience
    setSelectedExperience(experience?.title);
    // Full experience details for saving to Firestore
    setSelectedExperienceDetails(experience);
  };

  // Fetch My Experiences
  const fetchMyExperiences = async () => {
    try {
      const myExperienceRef = collection(
        db,
        "users",
        currentUser.uid,
        "myexperience"
      );
      const querySnapshot = await getDocs(myExperienceRef);
      const experiences = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Document ID
        ...doc.data(), // Document Datas
      }));
      setMyExperiences(experiences);
    } catch (error) {
      console.error("Error fetching myexperience data:", error);
    }
  };

  return (
    <>
      {/* Modal View Profile */}
      <Modal
        title={
          <span
            style={{
              fontSize: "27px",
              fontWeight: "700",
              fontFamily: "Inter, sans-serif",
              color: "#0B0B0C",
              opacity: "0.8",
            }}
          >
            {selectedDermatologist ? selectedDermatologist.fullName : ""}
            <p
              style={{
                fontSize: "14px",
                fontWeight: "400",
                fontFamily: "Inter, sans-serif",
                color: "#121212",
                opacity: "0.8",
              }}
            >
              Dermatologist
            </p>
          </span>
        }
        open={viewProfileModal}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        style={{ top: 20 }}
      >
        {selectedDermatologist && (
          <div className="viewprofile-derma-container">
            <div className="viewprofile-derma-contents">
              <div className="viewprofile-derma-profile">
                {selectedDermatologist && (
                  <img src={dermatologistProfile} alt="dermatologist-profile" />
                )}
              </div>
              <div className="viewprofile-divider">
                <Divider />
              </div>
              <div className="viewprofile-derma-about">
                <div className="viewprofile-derma-about-header">
                  <h4>About</h4>
                </div>
                <div className="viewprofile-derma-about-description">
                  {/* About  */}
                  <p style={{ paddingBottom: 20 }}>
                    {selectedDermatologist ? selectedDermatologist.aboutMe : ""}
                  </p>
                  <div className="viewprofile-speciality-yearsofexperience-container">
                    <div className="viewprofile-derma-speciality">
                      <div className="viewprofile-derma-speciality-header">
                        <h4>Speciality</h4>
                        <div className="viewprofile-derma-speciality-description">
                          <p>Dermatology</p>
                        </div>
                      </div>
                    </div>
                    {/* Years of Experience */}
                    <div className="viewprofile-derma-yearsofexperience">
                      <div className="viewprofile-derma-yearsofexperience-header">
                        <h4>Years of Experience</h4>
                        <div className="viewprofile-derma-yearsofexperience-description">
                          <p>
                            {selectedDermatologist
                              ? selectedDermatologist.years
                              : ""}{" "}
                            years
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="viewProfile-derma-location">
                    <div className="viewProfile-derma-location-header">
                      <h4>Location</h4>
                      <div className="viewprofile-derma-location-description">
                        <p>
                          {selectedDermatologist
                            ? selectedDermatologist.location
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="viewprofile-derma-education">
                    <div className="viewprofile-derma-education-header">
                      <h4>Education</h4>
                      <div className="viewprofile-derma-education-description">
                        <p>
                          {selectedDermatologist
                            ? selectedDermatologist.collegeSchoolName
                            : ""}{" "}
                          ,{" "}
                          {selectedDermatologist
                            ? selectedDermatologist.graduateAt
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="viewprofile-divider">
                <Divider />
              </div>
              {/* Services Offered */}
              <div className="viewprofile-services-offer">
                <div className="viewprofile-services-offer-header">
                  <h4>Consultation Availability</h4>
                </div>
                <div className="viewprofile-services-offer-buttons">
                  {/* Video Meet */}
                  <div className="viewprofile-service-videomeet">
                    <div className="viewprofile-videomeet-button">
                      <button>
                        <div className="viewprofile-videomeet-icon">
                          <img src={videomeeticon} alt="video-icon" />
                        </div>
                        <div className="viewprofile-button">
                          <div className="viewprofile-videomeet-label">
                            <span>Video Meet</span>
                          </div>
                          <div className="viewprofile-videomeet-price">
                            <span>
                              ₱{" "}
                              {selectedDermatologist
                                ? selectedDermatologist.rate
                                : ""}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                    {/* On-Site */}
                    <div className="viewprofile-service-onsite">
                      <div className="viewprofile-onsite-button">
                        <button>
                          <div className="viewprofile-onsite-icon">
                            <img src={onsiteicon} alt="onsite-icon" />
                          </div>
                          <div className="viewprofile-button">
                            <div className="viewprofile-onsite-label">
                              <span>On-Site</span>
                            </div>
                            <div className="viewprofile-onsite-price">
                              <div className="viewprofile-onsite-price-label">
                                <span>
                                  ₱{" "}
                                  {selectedDermatologist
                                    ? selectedDermatologist.rate
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="viewprofile-divider">
                <Divider />
              </div>
              {/* Online Consultation */}
              <div className="viewprofile-online-consultation">
                <div className="viewprofile-online-consultation-header">
                  <h3>
                    <img src={scheduleIcon} alt="schedule-icon" /> Online
                    Consultation Schedules
                  </h3>
                </div>
                <div className="viewprofile-online-consultation-schedule">
                  <p>
                    {selectedDermatologist
                      ? selectedDermatologist.consulationSchedules
                      : ""}
                  </p>
                </div>
              </div>
              <div className="viewprofile-divider">
                <Divider />
              </div>
              <div className="viewprofile-book-appointment-button">
                <button
                  onChange={handleCancel}
                  onClick={() => {
                    if (selectedDermatologist) {
                      handleCancel(); // Close View Profile Modal then...
                      openAppointmentModal(selectedDermatologist); // Open Appointment Modal with passed data
                    } else {
                      console.error("No dermatologist selected");
                    }
                  }}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Book Appointment */}
      <Modal
        title={
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: 27,
              color: "#393939",
            }}
          >
            New Appointment
            <div className="newappointment-divider">
              <Divider />
            </div>
          </span>
        }
        open={appointmentModal}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        footer={null}
        style={{ top: 20 }}
      >
        {/* Loader will display when 'spinning' is true */}
        <Spin spinning={spinning} percent={percent} fullscreen />
        <div className="newappointment-container">
          <div className="newappointment-contents">
            {/* Header */}
            <div className="newappointment-header-container">
              <h2>Appoinment Information</h2>
            </div>
            {/* Online Schedule */}
            <div className="newappointment-onlineschedule-container">
              <div className="newappointment-onlineschedule-header">
                <h4>Online Consulation Schedules</h4>
              </div>
              {selectedExperienceDetails && (
                <Alert
                  style={{ marginTop: 20 }}
                  message={
                    <>
                      <p>
                        <strong>Title:</strong>{" "}
                        {selectedExperienceDetails.title}
                      </p>
                      <p>
                        <strong>Affected Area:</strong>{" "}
                        {selectedExperienceDetails.affectedArea}
                      </p>
                      <p>
                        <strong>PASI Score:</strong>{" "}
                        {selectedExperienceDetails.pasiScore}
                      </p>
                      <p>
                        <strong>Triggers:</strong>{" "}
                        {selectedExperienceDetails.triggers}
                      </p>
                      <p>
                        <strong>Date Symptom Occurred:</strong>{" "}
                        {selectedExperienceDetails.dateSymptomOccur}
                      </p>
                      <p>
                        <strong>Time Symptom Occurred:</strong>{" "}
                        {selectedExperienceDetails.timeSymptomOccur}
                      </p>
                      <p>
                        <strong>Relief Measures:</strong>{" "}
                        {selectedExperienceDetails.reliefMeasures}
                      </p>
                      <p>
                        <strong>Associated Symptoms:</strong>{" "}
                        {selectedExperienceDetails.associatedSymptoms}
                      </p>
                      <p>
                        <strong>Types of Psoriasis:</strong>{" "}
                        {selectedExperienceDetails.typesOfPsoriasis}
                      </p>
                    </>
                  }
                  type="success"
                  closable
                  afterClose={handleClose}
                />
              )}
              <div className="newappointment-onlineschedule-description">
                <p>
                  {selectedDermatologist
                    ? selectedDermatologist.onlineConsultationSchedule
                    : ""}
                </p>
              </div>
              {/* Services and My Experiences */}
              <div className="newappoint-services-myexperience-container">
                <div className="newappoint-service-container">
                  <div className="newappoint-service-header">
                    <h4>Services</h4>
                  </div>
                  <div className="newappoint-service-select">
                    <Select
                      value={selectedService}
                      onChange={setSelectedService}
                      placeholder="Select Service"
                      style={{
                        width: 200,
                        fontFamily: "Inter, sans-serif",
                        color: "#393939",
                      }}
                      // onChange={handleChange}
                      options={[
                        { value: "videomeet", label: "Video Meet" },
                        { value: "onsite", label: "On-Site" },
                      ]}
                    />
                  </div>
                </div>
                <div className="newappoint-experience-container">
                  <div className="newappoint-experience-header">
                    <h4>My Experience</h4>
                  </div>
                  <div className="newappoint-experience-description">
                    <Select
                      style={{ width: "205px" }}
                      value={selectedExperienceId}
                      onChange={handleExperienceSelect}
                      placeholder="Select from My Experience"
                    >
                      {myExperiences.map((experience) => (
                        <Select.Option
                          key={experience.id}
                          value={experience.id}
                        >
                          {experience.title} - {experience.dateSymptomOccur}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              {/* Preferred Day and Time */}
              <div className="newappoint-day-and-time-container">
                {/* Prefered Day of the Week */}
                <div className="newappoint-day-container">
                  <div className="newappoint-day-header">
                    <h4>Preferred Day of the Week</h4>
                  </div>
                  <div className="newappoint-day-select">
                    <Select
                      value={preferredDay}
                      onChange={setPreferredDay}
                      placeholder="Select Preferred Day"
                      style={{
                        width: 200,
                        fontFamily: "Inter, sans-serif",
                        color: "#393939",
                      }}
                      // onChange={handleChange}
                      options={[
                        { value: "Monday", label: "Monday" },
                        {
                          value: "Tuesday",
                          label: "Tuesday",
                        },
                        {
                          value: "Wednesday",
                          label: "Wednesday",
                        },
                        {
                          value: "Thursday",
                          label: "Thursday",
                        },
                        {
                          value: "Friday",
                          label: "Friday",
                        },
                        {
                          value: "Saturday",
                          label: "Saturday",
                        },
                      ]}
                    />
                  </div>
                </div>
                {/* Prefered Time of the Day */}
                <div className="newappoint-time-container">
                  <div className="newappoint-time-header">
                    <h4>Preferred Time of the Day</h4>
                  </div>
                  <div className="newappoint-time-select">
                    <Select
                      value={preferredTime}
                      onChange={setPreferredTime}
                      placeholder="Select Preferred Time"
                      style={{
                        width: 200,
                        fontFamily: "Inter, sans-serif",
                        color: "#393939",
                      }}
                      // onChange={handleChange}
                      options={[
                        { value: "Morning", label: "Morning" },
                        {
                          value: "Afternoon",
                          label: "Afternoon",
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Patient Information */}
            <div className="newappoint-patient-info-container">
              <div className="newappoint-patient-info-contents">
                {/* Header */}
                <div className="newappoint-patient-info-header">
                  <h2>Patient Information</h2>
                </div>
                {/* Patient Status */}
                <div className="newappoint-patient-status-contents">
                  <div className="newappoint-patient-status-header">
                    <h4>Patient Status</h4>
                  </div>
                  <div className="newappoint-patient-status-radio">
                    <span>
                      I am a &nbsp;
                      <Radio.Group
                        onChange={onChangePatientStatus}
                        value={patientStatus}
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 14,
                        }}
                      >
                        <Radio value="New Patient">New Patient</Radio>
                        <Radio value="Returning Patient">
                          Returning Patient
                        </Radio>
                      </Radio.Group>
                    </span>
                  </div>
                </div>
                {/* Patient First Name & Last Name */}
                <div className="newappoint-patient-first-last-container">
                  <div className="newappoint-patient-first-last-contents">
                    {/* Patient First Name */}
                    <div className="newappoint-patient-firstname">
                      <div className="newappoint-patient-firstname-header">
                        <h4>First Name</h4>
                      </div>
                      <div className="newappoint-patient-firstname-input">
                        <input
                          type="text"
                          value={patientFirstName}
                          onChange={(e) => setPatientFirstName(e.target.value)}
                          placeholder="Patient First Name"
                        />
                      </div>
                    </div>
                    {/* Patient Last Name */}
                    <div className="newappoint-patient-lastname">
                      <div className="newappoint-patient-lastname-header">
                        <h4>Last Name</h4>
                      </div>
                      <div className="newappoint-patient-lastname-input">
                        <input
                          type="text"
                          value={patientLastName}
                          onChange={(e) => setPatientLastName(e.target.value)}
                          placeholder="Patient Last Name"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Patient Email */}
                  <div className="newappoint-patient-email">
                    <div className="newappoint-patient-email-header">
                      <h4>Email</h4>
                    </div>
                    <div className="newappoint-patient-email-input">
                      <input
                        type="text"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="Patient Email"
                      />
                    </div>
                  </div>
                  {/* Contact & Gender */}
                  <div className="newappoint-patient-contact-gender-container">
                    {/* Patient Contact Number */}
                    <div className="newappoint-patient-contact">
                      <div className="newappoint-patient-contact-header">
                        <h4>Contact Number</h4>
                      </div>
                      <div className="newappoint-patient-contact-input">
                        <input
                          type="text"
                          value={patientContact}
                          onChange={(e) => setPatientContact(e.target.value)}
                          placeholder="Patient Contact Number"
                        />
                      </div>
                    </div>
                    {/* Patient Gender */}
                    <div className="newappoint-patient-gender">
                      <div className="newappoint-patient-gender-header">
                        <h4>Gender</h4>
                      </div>
                      <div className="newappointment-patient-gender-select">
                        <Select
                          value={selectedGender}
                          onChange={setSelectedGender}
                          placeholder="Patient Gender"
                          style={{
                            width: 200,
                            height: 30,
                            fontFamily: "Inter, sans-serif",
                            color: "#393939",
                          }}
                          // onChange={handleChange}
                          options={[
                            { value: "Male", label: "Male" },
                            {
                              value: "Female",
                              label: "Female",
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Book Appointment */}
            <div className="newappoint-bookappoint-button">
              <button
                onClick={handleSetAppointment}
                disabled={!isFormComplete()}
              >
                {confirmLoading ? (
                  <Spin indicator={<LoadingOutlined spin />} size="small" />
                ) : (
                  "Set an appointment"
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <div className="appointment-container">
        <Sidebar />
        <div className="appointment-contents">
          <div className="appointment-header-container">
            {/* Header */}
            <div className="appointment-h2">
              <h2>Appointment</h2>
            </div>
            {/* List of Dermatologist */}
            <Spin spinning={spinning}>
              <div className="appointment-dermalist-container">
                {/* Filter Actions */}
                <div className="appointment-filter-section">
                  <div className="appointment-filter-icon">
                    <img src={filtericon} alt="filter-icon" />
                  </div>
                  <div className="appointment-filter-label">
                    <p>Filters</p>
                  </div>
                  <div className="appointment-filter-button">
                    <Select
                      defaultValue="All"
                      style={{ width: 150 }}
                      onChange={handleFilterChange}
                      options={[
                        { value: "All", label: "All" },
                        { value: "By Location", label: "By Location" },
                      ]}
                    />
                  </div>
                </div>

                {/* Dermatologist Profile Card or No Data Message */}
                {dermatologistData.length > 0 ? (
                  <div className="appointment-listofdermatologist-container">
                    {dermatologistData.map((dermatologist) => (
                      <div
                        key={dermatologist.id}
                        className="listofdermatologist-card"
                      >
                        {/* Dermatologist Profile Icon */}
                        <div className="dermatologist-profile">
                          <img src={dermatologistProfile} alt="avatar-icon" />
                        </div>
                        {/* Dermatologist Profile Name */}
                        <div className="dermatologist-name">
                          <p>{dermatologist.fullName}</p>
                          <div className="dermatologist-field">
                            <p>Dermatologist</p>
                          </div>
                        </div>
                        <div className="derma-action-buttons">
                          <div className="derma-bookappointment-button">
                            <button
                              onClick={() =>
                                openAppointmentModal(dermatologist)
                              }
                            >
                              Book Appointment
                            </button>
                          </div>
                          <div className="derma-viewprofile-button">
                            <button
                              onClick={() =>
                                openViewProfileModal(dermatologist)
                              }
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="empty-data"
                    style={{
                      textAlign: "center",
                      marginTop: "100px",
                    }}
                  >
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </div>
                )}
              </div>
            </Spin>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientAppointment;
