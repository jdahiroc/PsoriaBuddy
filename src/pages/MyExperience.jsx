import "../styles/myexperience.css"; // css file
// React Hooks
import { useState, useEffect } from "react";
// Ant Design
import {
  Modal,
  Form,
  Input,
  TimePicker,
  DatePicker,
  Radio,
  Divider,
  message,
  Skeleton,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
// Sidebar
import Sidebar from "./Sidebar/Sidebar";
import addbutton from "../assets/patient/add-button.png";
import deletebutton from "../assets/patient/delete-button.png";
// PASI Images
import pasiHeadArea from "../assets/patient/pasi-head-area.png";
import pasiTorsoArea from "../assets/patient/pasi-body-area.png";
import pasiArmsArea from "../assets/patient/pasi-arms-area.png";
import pasiLegsArea from "../assets/patient/pasi-legs-area.png";

// Import Firebase
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { app, db } from "../../firebaseConfig";
import { getAuth } from "firebase/auth";

// Initialize Firebase Services
const auth = getAuth(app);
// const currentUser = auth.currentUser;

// Main Component
const MyExperience = () => {
  // State for My Experience
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [experienceData, setExperienceData] = useState([]);
  // Input Layout
  const [form] = Form.useForm();
  const [formLayout, setFormLayout] = useState("vertical");
  const onFormLayoutChange = ({ layout }) => {
    setFormLayout(layout);
  };
  const { TextArea } = Input;
  //  Modal for Create New Experiences
  const [addExperience, setAddExperience] = useState(false);
  //  Modal Loading State after clicking "OK"
  const [confirmLoading, setConfirmLoading] = useState(false);
  // Modal for Open My Experiences
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch experiences from Firestore
  // Fetch experiences from Firestore
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const querySnapshot = await getDocs(
            collection(db, "users", currentUser.uid, "myexperience")
          );
          const experiences = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setExperienceData(experiences);
        } else {
          message.error("User not logged in");
        }
      } catch (error) {
        message.error("Error fetching experiences");
      }
    };

    fetchExperiences();
  }, []);

  // PASI Radio Buttons
  const [pasiValues, setPasiValues] = useState({
    headArea: 0,
    headErythema: 0,
    headInduration: 0,
    headDesquamation: 0,
    torsoArea: 0,
    torsoErythema: 0,
    torsoInduration: 0,
    torsoDesquamation: 0,
    armsArea: 0,
    armsErythema: 0,
    armsInduration: 0,
    armsDesquamation: 0,
    legsArea: 0,
    legsErythema: 0,
    legsInduration: 0,
    legsDesquamation: 0,
  });

  // Function to handle the PASI Radio Buttons
  const pasiOnChange = (key, value) => {
    setPasiValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset the PASI Form Values
  const resetForms = () => {
    setPasiValues({
      headArea: 0,
      headErythema: 0,
      headInduration: 0,
      headDesquamation: 0,
      torsoArea: 0,
      torsoErythema: 0,
      torsoInduration: 0,
      torsoDesquamation: 0,
      armsArea: 0,
      armsErythema: 0,
      armsInduration: 0,
      armsDesquamation: 0,
      legsArea: 0,
      legsErythema: 0,
      legsInduration: 0,
      legsDesquamation: 0,
    });
    form.resetFields(); // clear the form fields
  };

  // Determine PASI Severity
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
  const showExperience = (experience) => {
    setSelectedExperience(experience);
    setLoading(true);
    setOpen(true);

    setTimeout(() => {
      setLoading(false);
    }, 1000); // A small delay to simulate loading effect
  };

  // Handle the submit button
  const handleOk = async () => {
    const currentUser = getAuth().currentUser; // Fetch the current user logged in
    // Check the current user logged in
    if (!currentUser) {
      message.error("No current user found. Unable to add experience.");
      return;
    }

    try {
      // Get all the values from the form fields
      const values = await form.validateFields();

      // PASI Calculation
      const calculatePasiScore = (pasiValues) => {
        const {
          headArea,
          headErythema,
          headInduration,
          headDesquamation,
          torsoArea,
          torsoErythema,
          torsoInduration,
          torsoDesquamation,
          armsArea,
          armsErythema,
          armsInduration,
          armsDesquamation,
          legsArea,
          legsErythema,
          legsInduration,
          legsDesquamation,
        } = pasiValues;

        // Calculate PASI score
        const pasiScore =
          0.1 * (headErythema + headInduration + headDesquamation) * headArea +
          0.2 * (armsErythema + armsInduration + armsDesquamation) * armsArea +
          0.3 *
            (torsoErythema + torsoInduration + torsoDesquamation) *
            torsoArea +
          0.4 * (legsErythema + legsInduration + legsDesquamation) * legsArea;

        // Rounded to 2 decimal places
        return parseFloat(pasiScore.toFixed(2));
      };

      // Then, after calculating the PASI Score
      // Initialize the PASI Score
      const pasiScore = calculatePasiScore(pasiValues);

      // Structure of the data to be saved
      const newExperience = {
        title: values.title || "",
        typesOfPsoriasis: values.typesOfPsoriasis || "",
        timeSymptomOccur: values.timeSymptomOccur
          ? values.timeSymptomOccur.format("h:mm a")
          : "",
        dateSymptomOccur: values.dateSymptomOccur
          ? values.dateSymptomOccur.format("MM/DD/YYYY")
          : "",
        reliefMeasures: values.reliefMeasures || "",
        associatedSymptoms: values.associatedSymptoms || "",
        affectedArea: values.affectedArea || "",
        triggers: values.triggers || "",
        pasiScore: pasiScore,
        createdAt: new Date(),
      };

      // Save data to Firestore
      await addDoc(
        collection(db, "users", currentUser.uid, "myexperience"),
        newExperience
      );
      message.success("Experience successfully added.");

      // Clear the fields and close modal
      resetForms();
      setConfirmLoading(true);
      setTimeout(() => {
        setAddExperience(false);
        setConfirmLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error while submitting: ", error);
      message.error("Unable to add experience. Please try again later.");
    }
  };

  // Cancel the modal
  const handleCancel = () => {
    form.resetFields(); // clear the form fields
    setAddExperience(false); // close the modal
    resetForms(); // reset the form values of radio buttons
  };

  // My Experience Delete Logic
  // Handle Delete Confirmation
  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this experience?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No, Cancel",
      onOk: () => {
        handleDeleteExperience(id);
      },
    });
  };

  // Handle Delete Experience
  const handleDeleteExperience = async (id) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteDoc(doc(db, "users", currentUser.uid, "myexperience", id));
        setExperienceData((prev) =>
          prev.filter((experience) => experience.id !== id)
        );
        message.success("Experience deleted successfully.");
      } else {
        message.error("User not logged in");
      }
    } catch (error) {
      message.error("Error deleting experience");
    }
  };

  return (
    <>
      {/* Modal */}
      {/* Open My Experiences */}
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

      {/* Modal   */}
      {/* Create My Experiences */}
      <Modal
        centered
        open={addExperience}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        width={810}
      >
        <div className="modal-container">
          <div className="modal-contents">
            {/* All Sections Combined in One Form */}
            <Form
              layout={formLayout}
              form={form}
              initialValues={{
                layout: formLayout,
                title: "",
                typesOfPsoriasis: "",
                timeSymptomOccur: null,
                dateSymptomOccur: null,
                reliefMeasures: "",
                associatedSymptoms: "",
                affectedArea: "",
                triggers: "",
              }}
              onValuesChange={onFormLayoutChange}
              style={{
                maxWidth: formLayout === "inline" ? "none" : 800,
              }}
            >
              {/* First Section */}
              <div className="modal-first-section-container">
                <div className="modal-leftsection">
                  <div className="modal-title">
                    <Form.Item name="title">
                      <Input
                        placeholder="Title here"
                        size="large"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="modal-typesofpsoriasis">
                    <h4>Type of Psoriasis</h4>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "10px",
                      }}
                    >
                      (Plaque, Guttate, Inverse, Pustular, Erythrodermic, Scalp,
                      Nail)
                    </p>
                    <Form.Item name="typesOfPsoriasis">
                      <TextArea
                        showCount
                        maxLength={100}
                        placeholder="Describe what the condition looks like..."
                        style={{
                          height: 120,
                          resize: "none",
                          paddingBottom: 25,
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="modal-timedate-container">
                    <div className="modal-time-occur">
                      <h4>Time Symptom Occur</h4>
                      <Form.Item name="timeSymptomOccur">
                        <TimePicker use12Hours format="h:mm a" size="large" />
                      </Form.Item>
                    </div>
                    <div className="modal-date-occur">
                      <h4>Date Symptom Occur</h4>
                      <Form.Item name="dateSymptomOccur">
                        <DatePicker size="large" />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="modal-relief-measures">
                    <h4>Relief Measures</h4>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "10px",
                      }}
                    >
                      (What actions were taken to relieve the symptoms (e.g.,
                      rest, medication, ointments, creams)
                    </p>
                    <Form.Item name="reliefMeasures">
                      <TextArea
                        showCount
                        maxLength={100}
                        placeholder="Describe what you do to relieve the symptoms..."
                        style={{
                          height: 80,
                          resize: "none",
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Right Section */}
                <div className="modal-rightsection">
                  <div className="modal-associatedsymptoms">
                    <h4>Associated Symptoms</h4>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "10px",
                      }}
                    >
                      (Any other symptoms that occur simultaneously)
                    </p>
                    <Form.Item name="associatedSymptoms">
                      <TextArea
                        showCount
                        maxLength={100}
                        placeholder="Describe other symptoms that occur simultaneously..."
                        style={{
                          height: 80,
                          resize: "none",
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="modal-location">
                    <h4>Affected Area</h4>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "10px",
                      }}
                    >
                      (What part on body the symptoms are experienced)
                    </p>
                    <Form.Item name="affectedArea">
                      <Input size="large" />
                    </Form.Item>
                  </div>
                  <div className="modal-triggers">
                    <h4>Triggers</h4>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: "10px",
                      }}
                    >
                      (What are the causes that triggers your symptom?)
                    </p>
                    <Form.Item name="triggers">
                      <Input size="large" />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Second Section */}
              <div className="modal-second-section-container">
                <div className="modal-second-header">
                  <h2>Psoriasis Area Severity Index (PASI)</h2>
                </div>
                <div className="modal-second-section-content1">
                  <div className="modal-pasi-container">
                    {/* Head Area */}
                    <div className="pasi-head-area-container">
                      <div className="pasi-head-area-header">
                        <p>Head Area</p>
                      </div>
                      <div className="pasi-head-area-label">
                        <div className="pasi-head-area">
                          <li>Area</li>
                          <div className="pasi-head-area-radiobutton">
                            <Radio.Group
                              onChange={(e) =>
                                pasiOnChange("headArea", e.target.value)
                              }
                              value={pasiValues.headArea}
                              style={{ paddingTop: 10 }}
                            >
                              <Radio value={1}>0%</Radio>
                              <Radio value={2}>{"<10%"}</Radio>
                              <Radio value={3}>10-29%</Radio>
                              <Radio value={4}>30-49%</Radio>
                              <Radio value={5}>50-69%</Radio>
                              <Radio value={6}>70-89%</Radio>
                              <Radio value={7}>90-100%</Radio>
                            </Radio.Group>
                          </div>
                        </div>
                        <div className="pasi-head-erythema">
                          <li>Erythema (redness)</li>
                          <Radio.Group
                            onChange={(e) =>
                              pasiOnChange("headErythema", e.target.value)
                            }
                            value={pasiValues.headErythema}
                            style={{ paddingTop: 10 }}
                          >
                            <Radio value={1}>1</Radio>
                            <Radio value={2}>2</Radio>
                            <Radio value={3}>3</Radio>
                            <Radio value={4}>4</Radio>
                          </Radio.Group>
                        </div>
                        <div className="pasi-head-induration">
                          <li>Induration (thickness)</li>
                          <Radio.Group
                            onChange={(e) =>
                              pasiOnChange("headInduration", e.target.value)
                            }
                            value={pasiValues.headInduration}
                            style={{ paddingTop: 10 }}
                          >
                            <Radio value={1}>1</Radio>
                            <Radio value={2}>2</Radio>
                            <Radio value={3}>3</Radio>
                            <Radio value={4}>4</Radio>
                          </Radio.Group>
                        </div>
                        <div className="pasi-head-desquamation">
                          <li>Desquamation (scaling)</li>
                          <Radio.Group
                            onChange={(e) =>
                              pasiOnChange("headDesquamation", e.target.value)
                            }
                            value={pasiValues.headDesquamation}
                            style={{ paddingTop: 10 }}
                          >
                            <Radio value={1}>1</Radio>
                            <Radio value={2}>2</Radio>
                            <Radio value={3}>3</Radio>
                            <Radio value={4}>4</Radio>
                          </Radio.Group>
                        </div>
                      </div>
                      <div className="pasi-head-area-image">
                        <img src={pasiHeadArea} alt="" />
                      </div>
                    </div>
                  </div>
                  {/* Torso Area */}
                  <div className="pasi-torso-area-container">
                    <div className="pasi-torso-area-header">
                      <p>Torso Area</p>
                    </div>
                    <div className="pasi-torso-area-label">
                      <div className="pasi-torso-area">
                        <li>Area</li>
                        <div className="pasi-torso-area-radiobutton">
                          <Radio.Group
                            onChange={(e) =>
                              pasiOnChange("torsoArea", e.target.value)
                            }
                            value={pasiValues.torsoArea}
                            style={{ paddingTop: 10 }}
                          >
                            <Radio value={1}>0%</Radio>
                            <Radio value={2}>{"<10%"}</Radio>
                            <Radio value={3}>10-29%</Radio>
                            <Radio value={4}>30-49%</Radio>
                            <Radio value={5}>50-69%</Radio>
                            <Radio value={6}>70-89%</Radio>
                            <Radio value={7}>90-100%</Radio>
                          </Radio.Group>
                        </div>
                      </div>
                      <div className="pasi-torso-erythema">
                        <li>Erythema (redness)</li>
                        <Radio.Group
                          onChange={(e) =>
                            pasiOnChange("torsoErythema", e.target.value)
                          }
                          value={pasiValues.torsoErythema}
                          style={{ paddingTop: 10 }}
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                          <Radio value={4}>4</Radio>
                        </Radio.Group>
                      </div>
                      <div className="pasi-torso-induration">
                        <li>Induration (thickness)</li>
                        <Radio.Group
                          onChange={(e) =>
                            pasiOnChange("torsoInduration", e.target.value)
                          }
                          value={pasiValues.torsoInduration}
                          style={{ paddingTop: 10 }}
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                          <Radio value={4}>4</Radio>
                        </Radio.Group>
                      </div>
                      <div className="pasi-torso-desquamation">
                        <li>Desquamation (scaling)</li>
                        <Radio.Group
                          onChange={(e) =>
                            pasiOnChange("torsoDesquamation", e.target.value)
                          }
                          value={pasiValues.torsoDesquamation}
                          style={{ paddingTop: 10 }}
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                          <Radio value={4}>4</Radio>
                        </Radio.Group>
                      </div>
                    </div>
                    <div className="pasi-torso-area-image">
                      <img src={pasiTorsoArea} alt="" />
                    </div>
                  </div>
                </div>

                {/* Arms Area */}
                <div className="modal-second-section-content2">
                  <div className="pasi-arms-area-container">
                    <div className="pasi-arms-area-header">
                      <p>Arms Area</p>
                    </div>
                    <div className="pasi-arms-area-label">
                      <div className="pasi-arms-area">
                        <li>Area</li>
                        <div className="pasi-arms-area-radiobutton">
                          <Radio.Group
                            onChange={(e) =>
                              pasiOnChange("armsArea", e.target.value)
                            }
                            value={pasiValues.armsArea}
                            style={{ paddingTop: 10 }}
                          >
                            <Radio value={1}>0%</Radio>
                            <Radio value={2}>{"<10%"}</Radio>
                            <Radio value={3}>10-29%</Radio>
                            <Radio value={4}>30-49%</Radio>
                            <Radio value={5}>50-69%</Radio>
                            <Radio value={6}>70-89%</Radio>
                            <Radio value={7}>90-100%</Radio>
                          </Radio.Group>
                        </div>
                      </div>
                      <div className="pasi-arms-erythema">
                        <li>Erythema (redness)</li>
                        <Radio.Group
                          onChange={(e) =>
                            pasiOnChange("armsErythema", e.target.value)
                          }
                          value={pasiValues.armsErythema}
                          style={{ paddingTop: 10 }}
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                          <Radio value={4}>4</Radio>
                        </Radio.Group>
                      </div>
                      <div className="pasi-arms-induration">
                        <li>Induration (thickness)</li>
                        <Radio.Group
                          onChange={(e) =>
                            pasiOnChange("armsInduration", e.target.value)
                          }
                          value={pasiValues.armsInduration}
                          style={{ paddingTop: 10 }}
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                          <Radio value={4}>4</Radio>
                        </Radio.Group>
                      </div>
                      <div className="pasi-arms-desquamation">
                        <li>Desquamation (scaling)</li>
                        <Radio.Group
                          onChange={(e) =>
                            pasiOnChange("armsDesquamation", e.target.value)
                          }
                          value={pasiValues.armsDesquamation}
                          style={{ paddingTop: 10 }}
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                          <Radio value={4}>4</Radio>
                        </Radio.Group>
                      </div>
                    </div>
                    <div className="pasi-arms-area-image">
                      <img src={pasiArmsArea} alt="" />
                    </div>
                  </div>

                  {/* Legs Area */}
                  <div className="pasi-legs-area-container">
                    <div className="pasi-legs-area-header">
                      <p>Legs Area</p>
                    </div>
                    <div className="pasi-legs-area-label">
                      <div className="pasi-legs-area">
                        <li>Area</li>
                        <div className="pasi-legs-area-radiobutton">
                          <Radio.Group
                            onChange={(e) =>
                              pasiOnChange("legsArea", e.target.value)
                            }
                            value={pasiValues.legsArea}
                            style={{ paddingTop: 10 }}
                          >
                            <Radio value={1}>0%</Radio>
                            <Radio value={2}>{"<10%"}</Radio>
                            <Radio value={3}>10-29%</Radio>
                            <Radio value={4}>30-49%</Radio>
                            <Radio value={5}>50-69%</Radio>
                            <Radio value={6}>70-89%</Radio>
                            <Radio value={7}>90-100%</Radio>
                          </Radio.Group>
                        </div>
                      </div>
                      <div className="pasi-legs-erythema">
                        <li>Erythema (redness)</li>
                        <Radio.Group
                          onChange={(e) =>
                            pasiOnChange("legsErythema", e.target.value)
                          }
                          value={pasiValues.legsErythema}
                          style={{ paddingTop: 10 }}
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                          <Radio value={4}>4</Radio>
                        </Radio.Group>
                      </div>
                      <div className="pasi-legs-induration">
                        <li>Induration (thickness)</li>
                        <Radio.Group
                          onChange={(e) =>
                            pasiOnChange("legsInduration", e.target.value)
                          }
                          value={pasiValues.legsInduration}
                          style={{ paddingTop: 10 }}
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                          <Radio value={4}>4</Radio>
                        </Radio.Group>
                      </div>
                      <div className="pasi-legs-desquamation">
                        <li>Desquamation (scaling)</li>
                        <Radio.Group
                          onChange={(e) =>
                            pasiOnChange("legsDesquamation", e.target.value)
                          }
                          value={pasiValues.legsDesquamation}
                          style={{ paddingTop: 10 }}
                        >
                          <Radio value={1}>1</Radio>
                          <Radio value={2}>2</Radio>
                          <Radio value={3}>3</Radio>
                          <Radio value={4}>4</Radio>
                        </Radio.Group>
                      </div>
                    </div>
                    <div className="pasi-legs-area-image">
                      <img src={pasiLegsArea} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </Modal>

      {/* Right Side Section of My Experience */}
      {/* My Experience Tiles */}
      <div className="myexperience-container">
        <Sidebar />
        <div className="myexperience-contents">
          <div className="myexperience-header-container">
            {/* Header */}
            <div className="myexperience-h2">
              <h2>My Experiences</h2>
            </div>
            {/* Add New Button */}
            <div className="myexperience-addbutton">
              <button onClick={() => setAddExperience(true)}>
                <img src={addbutton} alt="add-icon" />
              </button>
            </div>
          </div>

          <div className="myexperience-list-container">
            {experienceData.map((experience) => (
              <div
                key={experience.id}
                onClick={() => showExperience(experience)}
                className="myexperience-card"
              >
                <div className="myexperience-card-content">
                  <div className="myexperience-delete">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteConfirm(experience.id);
                      }}
                    >
                      <img src={deletebutton} alt="delete-icon" />
                    </button>
                  </div>
                  <div className="myexperience-date-added">
                    <p>{experience.dateSymptomOccur}</p>
                  </div>
                  <div className="myexperience-title">
                    <h3>{experience.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyExperience;
