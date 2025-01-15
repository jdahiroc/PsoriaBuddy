// React Hooks
import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

// Firebase
import { db } from "../../../firebaseConfig";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

// Dataset
import citiesData from "../../assets/dataset/cities.json";

// Assets
import idIcon from "../../assets/verification/Identification Documents.png";

// CSS
import "../../css/dermatologistverification.css";

// MUI Components
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

// Ant Design Component
import { Divider, message, Upload, Descriptions } from "antd";
import { InboxOutlined } from "@ant-design/icons";

// Steps Name
const steps = [
  "Personal Information",
  "Professional Information",
  "Submit your ID",
  "Review",
];

// ID TYPES
// Submit Your ID
const idTypeLabels = {
  professional_regulation_commission_PRC:
    "Professional Regulation Commission (PRC)",
  board_certifications: "Board Certifications",
};

const DermatologistVerification = () => {
  //   For MUI Alert error message
  const [error, setError] = useState("");

  //   Steppers Active State
  const [activeStep, setActiveStep] = useState(0);

  //   Countries & Cities State
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  // Credentials as Dermatologist State
  const [selectedOption, setSelectedOption] = useState();
  const [otherCredentials, setOtherCredentials] = useState();

  // Preview Images or PDF
  const [previewUrl, setPreviewUrl] = useState("");

  // Auth Context (Current User)
  const { currentUser } = useContext(AuthContext);

  // Navigate
  const navigate = useNavigate();

  // Debounced function to filter cities based on user input
  const filterCities = useCallback(
    debounce((input) => {
      const lowercasedInput = input.toLowerCase();
      const filtered = cities.filter((city) =>
        city.toLowerCase().includes(lowercasedInput)
      );
      setFilteredCities(filtered);
    }, 300), // Wait for 300ms before applying the filter
    [cities]
  );

  // State for form data
  const [formData, setFormData] = useState({
    // ----- Personal Information -----
    firstName: "",
    middleName: "",
    lastName: "",
    nationality: "",
    dateOfBirth: "",
    placeOfBirth: "",
    fullAddress: "",
    additionalAddress: "",
    zipCode: "",
    prc_license_number: "",
    prc_expiry_date: "",

    // ----- Credentials and Professional Information -----
    // Speciality Credentials
    isDermatologist: "",

    // Credentials as a Dermatologist
    cred_Dermatologist: "",
    // cred_Dermatologist_attachment: [],      // Removed because don't have access to Firebase Storage yet!

    // Residency Training Details
    residency_name: "",
    residency_completion_date: "",
    // residency_completion_attachment: [],    // Removed because don't have access to Firebase Storage yet!

    // Speciality Board Exam
    isPassSpecialityBoardExam: "",
    // speciality_board_exam_attachment: [],   // Removed because don't have access to Firebase Storage yet!

    // ----- Submit my ID -----
    // Accepted IDs
    idType: "",
    idNumber: "",
    idExpirationDate: "",
    // uploadedFile: [],  // Removed because don't have access to Firebase Storage yet!

    // Clinic/Hospital Affiliation
    clinic_hospital_affiliation_name: "",
    clinic_hospital_address: "",
    // proof_of_affiliation: [],   // Removed because don't have access to Firebase Storage yet!
  });

  // Handle Option Change
  // Credentials as a Dermatologist
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    if (event.target.value !== "Other") {
      setOtherCredentials("");
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  //   Handles the Upload Attachments
  const handleFileChange = (files) => {
    const totalFiles = (formData.uploadedFile || []).length;

    if (files.length + totalFiles > 3) {
      setError(
        "You can only upload up to 3 files: Front ID, Back ID, and a Selfie with ID."
      );
      return;
    }

    const acceptedFormats = /\.(jpg|jpeg|png|pdf)$/i;
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach((file) => {
      if (!acceptedFormats.test(file.name)) {
        errors.push(
          `${file.name} is not a valid file type. Accepted types: .jpg, .jpeg, .png, .pdf.`
        );
      } else if (file.size / 1024 / 1024 > 50) {
        errors.push(`${file.name} exceeds the 50MB size limit.`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      // uploadedFile: [...(prevData.uploadedFile || []), ...validFiles],
    }));

    setError(""); // Reset error on success
  };

  //   Handles the Next Steps
  const handleNext = () => {
    // Allows to proceed to next step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  //   Handles the Back Steps
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  //   Handles the Reset
  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      // ----- Personal Information -----
      firstName: "",
      middleName: "",
      lastName: "",
      nationality: "",
      dateOfBirth: "",
      placeOfBirth: "",
      fullAddress: "",
      additionalAddress: "",
      zipCode: "",
      prc_license_number: "",
      prc_expiry_date: "",

      // ----- Credentials and Professional Information -----
      // Speciality Credentials
      isDermatologist: "",

      // Credentials as a Dermatologist
      cred_Dermatologist: "",
      // cred_Dermatologist_attachment: [],       // Removed because don't have access to Firebase Storage yet!

      // Residency Training Details
      residency_name: "",
      residency_completion_date: "",
      // residency_completion_attachment: [],    // Removed because don't have access to Firebase Storage yet!

      // Speciality Board Exam
      isPassSpecialityBoardExam: "",
      // speciality_board_exam_attachment: [],   // Removed because don't have access to Firebase Storage yet!

      // ----- Submit my ID -----
      // Accepted IDs
      idType: "",
      idNumber: "",
      idExpirationDate: "",
      // uploadedFile: [],  // Removed because don't have access to Firebase Storage yet!

      // Clinic/Hospital Affiliation
      clinic_hospital_affiliation_name: "",
      clinic_hospital_address: "",
      // proof_of_affiliation: [],   // Removed because don't have access to Firebase Storage yet!
    });
  };

  //   Checks if all forms are filled
  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "nationality",
      "dateOfBirth",
      "placeOfBirth",
      "fullAddress",
      "zipCode",
      "prc_license_number",
      "prc_expiry_date",
      "isDermatologist",
      "cred_Dermatologist",
      // cred_Dermatologist_attachment: [],        // Removed because don't have access to Firebase Storage yet!
      "residency_name",
      "residency_completion_date",
      // residency_completion_attachment: [],    // Removed because don't have access to Firebase Storage yet!
      "isPassSpecialityBoardExam",
      // speciality_board_exam_attachment: [],   // Removed because don't have access to Firebase Storage yet!
      "idType",
      "idNumber",
      "idExpirationDate",
      // uploadedFile: [],  // Removed because don't have access to Firebase Storage yet!
      "clinic_hospital_affiliation_name",
      "clinic_hospital_address",
      // proof_of_affiliation: [],   // Removed because don't have access to Firebase Storage yet!
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        message.error(`${field} is required.`);
        return false;
      }
    }
    return true;
  };

  //   Handles Submit of the Verification Form
  const handleSubmit = async () => {
    if (!currentUser) {
      message.error("You must be logged in to submit verification");
      return;
    }

    if (!validateForm()) return;

    try {
      await addDoc(collection(db, "verification"), {
        ...formData,
        cred_Dermatologist:
          formData.cred_Dermatologist === "Other"
            ? formData.otherCredentials
            : formData.cred_Dermatologist, // Use specified value for "Other"
        user_uid: currentUser.uid,
        verification: "pending",
        createdAt: new Date(),
      });

      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        verification: "pending",
      });

      message.success("Verification submitted successfully!");

      // navigate user to verification status
      navigate("/d/verification-status", { replace: true });

      handleReset();
    } catch (error) {
      console.error("Error submitting verification:", error);
      message.error("There was an error submitting the verification.");
    }
  };

  // Add useEffect to update formData with user_uid when currentUser becomes available
  // useEffect(() => {
  //   if (currentUser) {
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       user_uid: currentUser.uid,
  //     }));
  //   }
  // }, [currentUser]);

  // Fetch cities in the Philippines using JSON File from "/assets/dataset/cities.json"
  useEffect(() => {
    const formattedLocations = [
      ...new Set(
        citiesData.map((location) =>
          location.city
            ? `CITY OF ${location.name.toUpperCase()}`
            : `MUNICIPALITY OF ${location.name.toUpperCase()}`
        )
      ),
    ].sort((a, b) => a.localeCompare(b)); // Remove duplicates and sort alphabetically
    setCities(formattedLocations);
    setFilteredCities(formattedLocations);
  }, []);

  // To return a cleanup function using debounce filtering cities
  useEffect(() => {
    return () => {
      filterCities.cancel(); // Cancel debounce on unmount
    };
  }, [filterCities]);

  // Fetch countries data from an API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        // Extract relevant fields (e.g., country name)
        const countryList = data
          .map((country) => ({
            name: country.name.common,
            alpha2Code: country.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
        setCountries(countryList);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // Handles Upload Attachments
  // Use useEffect to clean up the object URL when the component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // STEP CONTENTS
  const stepContents = [
    //  Step 1
    <>
      <div className="step1-container">
        <div className="step1-header-container">
          <div className="step1-header">
            <Typography
              variant="h3"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: "#0B0B0C",
                paddingBottom: "0.15em",
              }}
            >
              Tell us about yourself
            </Typography>
          </div>
          <div className="step1-subheader">
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "17px",
                fontWeight: 500,
                color: "#0B0B0C",
                opacity: "60%",
                paddingBottom: "1em",
              }}
            >
              Please provide the following personal information.
            </Typography>
          </div>
        </div>
        <form>
          <div className="step1-notice">
            <InfoRoundedIcon
              fontSize="small"
              style={{
                color: "#1976D2",
                display: "flex",
                alignItems: "start",
              }}
            />
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#0B0B0C",
                opacity: "60%",
                display: "flex",
                alignItems: "center",
                paddingLeft: ".2em",
              }}
            >
              Please check if the following information details are complete and
              match your ID.
            </Typography>
          </div>
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
              paddingTop: "1em",
            }}
          >
            Full Name<span style={{ color: "#1976D2" }}>*</span>
          </Typography>
          {/* ----- FULL NAME ----- */}
          <TextField
            label="First Name"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.firstName || ""}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
          />
          <TextField
            label="Middle Name"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.middleName || ""}
            onChange={(e) => handleInputChange("middleName", e.target.value)}
          />
          <TextField
            label="Last Name"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.lastName || ""}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
          />

          <Divider />

          {/* ----- Nationality ----- */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
            }}
          >
            Nationality<span style={{ color: "#1976D2" }}>*</span>
          </Typography>
          <FormControl variant="filled" fullWidth margin="normal">
            <InputLabel id="nationality-label">Nationality</InputLabel>
            <Select
              labelId="nationality-label"
              id="nationality-select"
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
            >
              {countries.map((country) => (
                <MenuItem key={country.alpha2Code} value={country.name}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />

          {/* ----- Date of Birth ----- */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
            }}
          >
            Date of Birth<span style={{ color: "#1976D2" }}>*</span>
          </Typography>
          <TextField
            label="Date of Birth"
            variant="filled"
            type="date"
            fullWidth
            margin="normal"
            value={formData.dateOfBirth || ""}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Divider />

          {/* ----- Place of Birth ----- */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
            }}
          >
            Place of Birth<span style={{ color: "#1976D2" }}>*</span>
          </Typography>
          <Autocomplete
            options={filteredCities} // Use filteredCities state
            getOptionLabel={(option) => option || ""}
            onInputChange={(event, value) => {
              filterCities(value); // Trigger debounce on input change
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Place of Birth"
                variant="filled"
                fullWidth
                margin="normal"
              />
            )}
            value={formData.placeOfBirth || ""}
            onChange={(event, newValue) => {
              if (cities.includes(newValue)) {
                handleInputChange("placeOfBirth", newValue || "");
              } else {
                message.error(
                  "Invalid selection. Please choose a valid city or municipality."
                );
              }
            }}
            noOptionsText="No matching city or municipality found."
            isOptionEqualToValue={(option, value) => option === value}
          />

          <Divider />

          {/* ----- Current Address ----- */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
            }}
          >
            Current Address<span style={{ color: "#1976D2" }}>*</span>
          </Typography>
          <TextField
            label="Full Address"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.fullAddress || ""}
            onChange={(e) => handleInputChange("fullAddress", e.target.value)}
          />
          <TextField
            label="Additional Address (Optional)"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.additionalAddress || ""}
            onChange={(e) =>
              handleInputChange("additionalAddress", e.target.value)
            }
          />
          <TextField
            label="Zip Code"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.zipCode || ""}
            onChange={(e) => handleInputChange("zipCode", e.target.value)}
          />

          <Divider />

          {/* ----- PRC Information ----- */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
            }}
          >
            Professional Regulation Commission (PRC) Information
            <span style={{ color: "#1976D2" }}>*</span>
          </Typography>
          <TextField
            label="License Number"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.prc_license_number || ""}
            onChange={(e) =>
              handleInputChange("prc_license_number", e.target.value)
            }
          />
          <TextField
            label="Expiry Date"
            variant="filled"
            type="date"
            fullWidth
            margin="normal"
            value={formData.prc_expiry_date || ""}
            onChange={(e) =>
              handleInputChange("prc_expiry_date", e.target.value)
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
        </form>
      </div>
    </>,
    // Step 2
    <>
      <div className="step2-container">
        <div className="step2-header-container">
          <div className="step2-header">
            <Typography
              variant="h3"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: "#0B0B0C",
                paddingBottom: "0.15em",
              }}
            >
              Credentials and Professional Information
            </Typography>
          </div>
          <div className="step2-subheader">
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "17px",
                fontWeight: 500,
                color: "#0B0B0C",
                opacity: "60%",
                paddingBottom: "1em",
              }}
            >
              Please provide the following information Credentials and
              Professional Information.
            </Typography>
          </div>
        </div>
        <form>
          <div className="step2-notice">
            <InfoRoundedIcon
              fontSize="small"
              style={{
                color: "#1976D2",
                display: "flex",
                alignItems: "start",
              }}
            />
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#0B0B0C",
                opacity: "60%",
                display: "flex",
                alignItems: "center",
                paddingLeft: ".2em",
              }}
            >
              Please check if the following information details are complete.
            </Typography>
          </div>
          <div className="step2-speciality-credentials">
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "17px",
                fontWeight: 600,
                color: "#0B0B0C",
                marginTop: "1.5rem",
              }}
            >
              Speciality Credentials
              <span style={{ color: "#1976D2" }}>*</span>
            </Typography>
            <Typography
              style={{
                paddingTop: "1rem",
                fontSize: "17px",
                fontFamily: "Inter, sans-serif",
                color: "#0B0B0C",
              }}
            >
              Are you a certified dermatologist?{" "}
              <RadioGroup
                row
                name="radio-buttons-group"
                value={formData.isDermatologist || ""}
                onChange={(e) =>
                  handleInputChange("isDermatologist", e.target.value)
                }
              >
                <FormControlLabel
                  value="true"
                  control={
                    <Radio
                      style={{
                        color: "#0B0B0C",
                      }}
                      size="small"
                    />
                  }
                  label="Yes"
                />
                <FormControlLabel
                  value="false"
                  control={
                    <Radio
                      style={{
                        color: "#0B0B0C",
                      }}
                      size="small"
                    />
                  }
                  label="No"
                />
              </RadioGroup>
            </Typography>

            <Divider />

            {/* Credentials as a Dermatologist */}
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "17px",
                fontWeight: 600,
                color: "#0B0B0C",
              }}
            >
              Credentials as a Dermatologist
              <span style={{ color: "#1976D2" }}>*</span>
            </Typography>
            <FormControl variant="filled" fullWidth margin="normal">
              <InputLabel id="cred_Dermatologist-label">
                Select a credential
              </InputLabel>
              <Select
                labelId="cred_Dermatologist-label"
                id="cred_Dermatologist-select"
                value={formData.cred_Dermatologist || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  handleOptionChange(event); // Call your handleOptionChange
                  handleInputChange("cred_Dermatologist", value); // Update formData
                }}
              >
                <MenuItem value="PDS">
                  Diplomate of the Philippine Dermatological Society (PDS)
                </MenuItem>
                <MenuItem value="FPDS">
                  Fellow of the Philippine Dermatological Society (FPDS)
                </MenuItem>
                <MenuItem value="Other">Other credentials</MenuItem>
              </Select>

              {formData.cred_Dermatologist === "Other" && (
                <TextField
                  label="Please specify:"
                  variant="standard"
                  fullWidth
                  margin="normal"
                  value={formData.otherCredentials || ""}
                  onChange={(e) =>
                    handleInputChange("otherCredentials", e.target.value)
                  }
                />
              )}
            </FormControl>
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "#0B0B0C",
                display: "flex",
                alignItems: "center",
                marginTop: "1rem",
                marginBottom: "0.5rem",
                paddingLeft: "0.2em",
              }}
            >
              Attachments (ID or Certificate)
            </Typography>

            {/* Error Message (MUI Alert) */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                style={{ marginBottom: "1rem" }}
              >
                {error}
              </Alert>
            )}

            <Upload.Dragger
              name="file"
              maxCount={3}
              listType="picture"
              beforeUpload={() => false}
              onChange={(e) =>
                handleFileChange(e.fileList.map((f) => f.originFileObj))
              }
              accept=".jpg,.jpeg,.png,.pdf"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag files here to upload
              </p>
              <p className="ant-upload-hint">
                Supported formats: .jpg, .jpeg, .png, .pdf. Maximum file size:
                50MB.
              </p>
              <p className="ant-upload-hint">Maximum file size: 50MB.</p>
            </Upload.Dragger>
          </div>

          <Divider />

          {/* Residency Training Details */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
              marginTop: "1.5rem",
            }}
          >
            Residency Training Details
            <span style={{ color: "#1976D2" }}>*</span>
          </Typography>
          <TextField
            label="Hospital/Institution Name"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.residency_name || ""}
            onChange={(e) =>
              handleInputChange("residency_name", e.target.value.toUpperCase())
            }
          />
          <TextField
            label="Completion Date"
            variant="filled"
            type="date"
            fullWidth
            margin="normal"
            value={formData.residency_completion_date || ""}
            onChange={(e) =>
              handleInputChange("residency_completion_date", e.target.value)
            }
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              color: "#0B0B0C",
              display: "flex",
              alignItems: "center",
              marginTop: "1rem",
              marginBottom: "0.5rem",
              paddingLeft: "0.2em",
            }}
          >
            Residency Completion Certificate
          </Typography>

          {/* Error Message (MUI Alert) */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              style={{ marginBottom: "1rem" }}
            >
              {error}
            </Alert>
          )}

          <Upload.Dragger
            name="file"
            maxCount={3}
            listType="picture"
            beforeUpload={() => false}
            onChange={(e) =>
              handleFileChange(e.fileList.map((f) => f.originFileObj))
            }
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag files here to upload
            </p>
            <p className="ant-upload-hint">
              Supported formats: .jpg, .jpeg, .png, .pdf. Maximum file size:
              50MB.
            </p>
            <p className="ant-upload-hint">Maximum file size: 50MB.</p>
          </Upload.Dragger>

          {/* Speciality Board Exam */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
              marginTop: "1.5rem",
            }}
          >
            Speciality Board Exam
            <span style={{ color: "#1976D2" }}>*</span>
          </Typography>
          <Typography
            style={{
              paddingTop: "1rem",
              fontSize: "17px",
              fontFamily: "Inter, sans-serif",
              color: "#0B0B0C",
            }}
          >
            Did you pass the Dermatology Specialty Board Exam?
            <RadioGroup
              row
              name="radio-buttons-group"
              value={formData.isPassSpecialityBoardExam || ""}
              onChange={(e) =>
                handleInputChange("isPassSpecialityBoardExam", e.target.value)
              }
            >
              <FormControlLabel
                value="true"
                control={
                  <Radio
                    style={{
                      color: "#0B0B0C",
                    }}
                    size="small"
                  />
                }
                label="Yes"
              />
              <FormControlLabel
                value="false"
                control={
                  <Radio
                    style={{
                      color: "#0B0B0C",
                    }}
                    size="small"
                  />
                }
                label="No"
              />
            </RadioGroup>
          </Typography>
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              color: "#0B0B0C",
              display: "flex",
              alignItems: "center",
              marginTop: "1rem",
              marginBottom: "0.5rem",
              paddingLeft: "0.2em",
            }}
          >
            Speciality Board Exam Certificate
          </Typography>

          {/* Error Message (MUI Alert) */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              style={{ marginBottom: "1rem" }}
            >
              {error}
            </Alert>
          )}

          <Upload.Dragger
            name="file"
            maxCount={3}
            listType="picture"
            beforeUpload={() => false}
            onChange={(e) =>
              handleFileChange(e.fileList.map((f) => f.originFileObj))
            }
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag files here to upload
            </p>
            <p className="ant-upload-hint">
              Supported formats: .jpg, .jpeg, .png, .pdf. Maximum file size:
              50MB.
            </p>
            <p className="ant-upload-hint">Maximum file size: 50MB.</p>
          </Upload.Dragger>
        </form>
      </div>
    </>,
    // Step 3
    <>
      <div className="step3-container">
        <div className="step3-header-container">
          <div className="step3-header">
            <Typography
              variant="h3"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: "#0B0B0C",
                paddingBottom: "0.15em",
              }}
            >
              Submit Your ID
            </Typography>
          </div>
          <div className="step3-subheader">
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "17px",
                fontWeight: 500,
                color: "#0B0B0C",
                opacity: "60%",
                paddingBottom: "1em",
              }}
            >
              Your ID helps us confirm your identity. Please choose a valid ID
              to submit from the list below:
            </Typography>
          </div>
        </div>
        <form>
          {/* ID Type Selection */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
              paddingTop: "1em",
            }}
          >
            ACCEPTED IDS
            <span style={{ color: "#1976D2", opacity: "82%" }}>*</span>
          </Typography>
          <FormControl variant="filled" fullWidth margin="normal">
            <InputLabel id="id-type-label">ID Type</InputLabel>
            <Select
              labelId="id-type-label"
              id="id-type-select"
              value={formData.idType || ""}
              onChange={(e) => handleInputChange("idType", e.target.value)}
            >
              <MenuItem
                value="driver's_license"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: "#0B0B0C",
                  opacity: "82%",
                }}
              >
                Driver&apos;s License
              </MenuItem>
              <MenuItem
                value="national_id"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: "#0B0B0C",
                  opacity: "82%",
                }}
              >
                National ID (PhilSys)
              </MenuItem>
              <MenuItem
                value="unified_multi_purpose_id"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: "#0B0B0C",
                  opacity: "82%",
                }}
              >
                Unified Multi-Purpose ID (UMID)
              </MenuItem>
              <MenuItem
                value="passport"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: "#0B0B0C",
                  opacity: "82%",
                }}
              >
                Passport
              </MenuItem>
              <MenuItem
                value="unified_multi_purpose_id"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: "#0B0B0C",
                  opacity: "82%",
                }}
              >
                Social Security System (SSS) ID
              </MenuItem>
              <MenuItem
                value="professional_regulation_commission_PRC"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: "#0B0B0C",
                  opacity: "82%",
                }}
              >
                PRC ID
              </MenuItem>
            </Select>
          </FormControl>

          {/* ID Details */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "#0B0B0C",
              paddingTop: "1em",
            }}
          >
            ID DETAILS<span style={{ color: "#1976D2" }}>*</span>
          </Typography>
          <TextField
            label="ID Number"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.idNumber || ""}
            onChange={(e) => handleInputChange("idNumber", e.target.value)}
          />

          <TextField
            label="Expiration Date"
            variant="filled"
            type="date"
            fullWidth
            margin="normal"
            value={formData.idExpirationDate || ""}
            onChange={(e) =>
              handleInputChange("idExpirationDate", e.target.value)
            }
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Divider />

          {/* Upload File */}
          <Typography
            variant="h3"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              color: "#0B0B0C",
              paddingBottom: "0.15em",
            }}
          >
            Upload an ID photo
          </Typography>
          <div className="step2-notice">
            <InfoRoundedIcon
              fontSize="small"
              style={{
                color: "#1976D2",
                display: "flex",
                alignItems: "start",
              }}
            />
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "#0B0B0C",
                opacity: "60%",
                display: "flex",
                alignItems: "center",
                paddingLeft: ".2em",
              }}
            >
              Upload files: Front ID, Back ID, Selfie holding your ID.
            </Typography>
          </div>
          {/* Error Message (MUI Alert) */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              style={{ marginBottom: "1rem" }}
            >
              {error}
            </Alert>
          )}

          <Upload.Dragger
            name="file"
            maxCount={3}
            listType="picture"
            beforeUpload={() => false}
            onChange={(e) =>
              handleFileChange(e.fileList.map((f) => f.originFileObj))
            }
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag files here to upload
            </p>
            <p className="ant-upload-hint">
              Supported formats: .jpg, .jpeg, .png, .pdf. Maximum file size:
              50MB.
            </p>
            <p className="ant-upload-hint">Maximum file size: 50MB.</p>
          </Upload.Dragger>

          <Divider />

          {/* Clinic/Hospital Affiliation */}
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 500,
              color: "#0B0B0C",
              paddingTop: "0.5em",
            }}
          >
            Clinic/Hospital Affiliation{" "}
            <span style={{ color: "#1976D2" }}>(Optional)</span>
          </Typography>
          <TextField
            label="Clinic/Hospital Affiliation Name"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.clinic_hospital_affiliation_name || ""}
            onChange={(e) =>
              handleInputChange(
                "clinic_hospital_affiliation_name",
                e.target.value
              )
            }
          />
          <Typography
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "17px",
              fontWeight: 500,
              color: "#0B0B0C",
              paddingTop: "0.5em",
            }}
          >
            Clinic/Hospital Affiliation Address{" "}
            <span style={{ color: "#1976D2" }}>(Optional)</span>
          </Typography>
          <TextField
            label="Clinic Address"
            variant="filled"
            fullWidth
            margin="normal"
            value={formData.clinic_hospital_address || ""}
            onChange={(e) =>
              handleInputChange("clinic_hospital_address", e.target.value)
            }
          />
          <div className="step2-notice">
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "#0B0B0C",
                opacity: "60%",
                display: "flex",
                alignItems: "center",
                paddingLeft: ".2em",
              }}
            >
              Attachments (Proof of Affiliation)
            </Typography>
          </div>
          {/* Error Message (MUI Alert) */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              style={{ marginBottom: "1rem" }}
            >
              {error}
            </Alert>
          )}

          <Upload.Dragger
            name="file"
            maxCount={3}
            listType="picture"
            beforeUpload={() => false}
            onChange={(e) =>
              handleFileChange(e.fileList.map((f) => f.originFileObj))
            }
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag files here to upload
            </p>
            <p className="ant-upload-hint">
              Supported formats: .jpg, .jpeg, .png, .pdf. Maximum file size:
              50MB.
            </p>
            <p className="ant-upload-hint">Maximum file size: 50MB.</p>
          </Upload.Dragger>
        </form>
      </div>
    </>,
    // Step 4
    <>
      <div className="step4-container">
        <div className="step4-header-container">
          <div className="step4-header">
            <Typography
              variant="h3"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                color: "#0B0B0C",
                paddingBottom: "0.15em",
              }}
            >
              Review your information
            </Typography>
          </div>
          <div className="step4-subheader">
            <Typography
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "17px",
                fontWeight: 500,
                color: "#0B0B0C",
                opacity: "60%",
                paddingBottom: "1em",
              }}
            >
              Please review the information you provided before submitting.
            </Typography>
          </div>
        </div>
      </div>
      <Descriptions
        layout="vertical"
        bordered
        column={{ xs: 1, sm: 1, md: 2 }}
        size="small"
      >
        {/* Full Name */}
        <Descriptions.Item label="Full Name">
          {`${formData.firstName || ""} ${formData.middleName || ""} ${
            formData.lastName || ""
          }`}
        </Descriptions.Item>

        {/* Nationality */}
        <Descriptions.Item label="Nationality">
          {formData.nationality || ""}
        </Descriptions.Item>

        {/* Date of Birth */}
        <Descriptions.Item label="Date of Birth">
          {formData.dateOfBirth
            ? new Date(formData.dateOfBirth).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </Descriptions.Item>

        {/* Place of Birth */}
        <Descriptions.Item label="Place of Birth">
          {formData.placeOfBirth || ""}
        </Descriptions.Item>

        {/* Address */}
        <Descriptions.Item label="Current Address">
          {`${formData.fullAddress || ""}`}
        </Descriptions.Item>

        {/* Additional Address */}
        <Descriptions.Item lable="Addtional Address">
          {` ${
            formData.additionalAddress ? ` ${formData.additionalAddress}` : ""
          }`}
        </Descriptions.Item>

        {/* Zip Code */}
        <Descriptions.Item label="Zip Code">
          {formData.zipCode || ""}
        </Descriptions.Item>

        {/* PRC License Number */}
        <Descriptions.Item label="Professional Regulation Commission (PRC) Information">
          {formData.prc_license_number || ""}
        </Descriptions.Item>

        {/* PRC Expiry Date */}
        <Descriptions.Item label="Expiry Date">
          {formData.prc_expiry_date
            ? new Date(formData.prc_expiry_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </Descriptions.Item>

        {/* Speciality Credentials */}
        <Descriptions.Item label="Speciality Credentials">
          {formData.isDermatologist || ""}
        </Descriptions.Item>

        {/* Credentials as a Dermatologist */}
        <Descriptions.Item label="Credentials as a Dermatologist">
          {formData.cred_Dermatologist || ""}
        </Descriptions.Item>

        {/* -------------------------------------------------- 
            ADD HERE Credentials as a Dermatologist Attachment 
            -------------------------------------------------- */}

        {/* Residency Training Details */}
        <Descriptions.Item label="Residency Hospital/Institution Name">
          {formData.residency_name || ""}
        </Descriptions.Item>

        <Descriptions.Item label="Residency Completion Date">
          {formData.residency_completion_date
            ? new Date(formData.residency_completion_date).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )
            : ""}
        </Descriptions.Item>

        {/* -------------------------------------------------- 
            ADD HERE Residency Completion Certificate Attachment 
            -------------------------------------------------- */}

        {/*  Speciality Board Exam  */}
        <Descriptions.Item label="Speciality Board Exam">
          {formData.isPassSpecialityBoardExam || ""}
        </Descriptions.Item>

        {/* -------------------------------------------------- 
            ADD HERE Speciality Board Exam Certificate Attachment 
            -------------------------------------------------- */}

        {/* ID Type */}
        <Descriptions.Item label="ID Type">
          {idTypeLabels[formData.idType] || ""}
        </Descriptions.Item>

        {/* ID Number */}
        <Descriptions.Item label="ID Number">
          {formData.idNumber || ""}
        </Descriptions.Item>

        {/* ID Expiration Date */}
        <Descriptions.Item label="ID Expiration Date">
          {formData.idExpirationDate
            ? new Date(formData.dateOfBirth).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </Descriptions.Item>

        {/* Attachments of Verification ID */}
        <Descriptions.Item label="Attachments of Valid IDs" span={2}>
          {formData.uploadedFile && formData.uploadedFile.length > 0
            ? formData.uploadedFile.map((file, index) => {
                // Generate object URL for preview
                const fileUrl = URL.createObjectURL(file);

                return (
                  <div key={index} style={{ marginBottom: "1rem" }}>
                    {/* File Name */}
                    <Typography
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0B0B0C",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {file.name}
                    </Typography>

                    {/* File Preview */}
                    {file.type.includes("pdf") ? (
                      <embed
                        src={fileUrl}
                        type="application/pdf"
                        width="100%"
                        height="200px"
                        style={{ border: "1px solid #ccc" }}
                      />
                    ) : (
                      <img
                        src={fileUrl}
                        alt={`attachment-${index}`}
                        style={{
                          width: "150px",
                          marginRight: "10px",
                          border: "1px solid #ccc",
                        }}
                      />
                    )}
                  </div>
                );
              })
            : ""}
        </Descriptions.Item>

        {/* Clinic/Hospital Affiliation */}
        <Descriptions.Item label="Clinic/Hospital Affiliation Name">
          {formData.clinic_hospital_affiliation_name || ""}
        </Descriptions.Item>

        <Descriptions.Item label="Clinic/Hospital Affiliation Address">
          {formData.clinic_hospital_address || ""}
        </Descriptions.Item>

        {/* -------------------------------------------------- 
            ADD HERE Clinic/Hospital Affiliation Attachment 
            -------------------------------------------------- */}
      </Descriptions>
    </>,
  ];

  return (
    <>
      <div className="verification-container">
        <div className="verification-contents">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you're finished
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </>
          ) : (
            <>
              <div>{stepContents[activeStep]}</div>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button
                  onClick={
                    activeStep === steps.length - 1 ? handleSubmit : handleNext
                  }
                >
                  {activeStep === steps.length - 1 ? "Submit" : "Next"}
                </Button>
              </Box>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DermatologistVerification;
