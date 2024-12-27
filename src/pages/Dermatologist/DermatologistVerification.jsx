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

// Ant Design Component
import { Divider, message, Upload, Descriptions } from "antd";
import { InboxOutlined } from "@ant-design/icons";

// Steps Name
const steps = ["Personal Information", "Submit your ID", "Review"];

// ID TYPES
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
    firstName: "",
    middleName: "",
    lastName: "",
    nationality: "",
    dateOfBirth: "",
    placeOfBirth: "",
    fullAddress: "",
    additionalAddress: "",
    zipCode: "",
    idType: "",
    // uploadedFile: [], // Removed because don't have access to Firebase Storage yet!
    idNumber: "",
    idExpirationDate: "",
  });

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

  const handleNext = () => {
    // Allows to proceed to next step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      nationality: "",
      dateOfBirth: "",
      placeOfBirth: "",
      fullAddress: "",
      additionalAddress: "",
      zipCode: "",
      idType: "",
      // uploadedFile: null, // REMOVED because don't have access to Firebase Storage
      idNumber: "",
      idExpirationDate: "",
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
      "idType",
      "idNumber",
      "idExpirationDate",
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

  // Fetch cities in the Philippines using JSON
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
    <>
      {/* Step 1 */}
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

          {/* Nationality */}
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

          {/* Date of Birth */}
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

          {/* Place of Birth */}
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

          {/* Current */}
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
              Submit Your ID
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
                value="professional_regulation_commission_PRC"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: "#0B0B0C",
                  opacity: "82%",
                }}
              >
                Professional Regulation Commission (PRC)
              </MenuItem>
              <MenuItem
                value="board_certifications"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "17px",
                  fontWeight: 500,
                  color: "#0B0B0C",
                  opacity: "82%",
                }}
              >
                Board Certifications
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
              Review your information
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
          {formData.nationality || "Not Provided"}
        </Descriptions.Item>

        {/* Date of Birth */}
        <Descriptions.Item label="Date of Birth">
          {formData.dateOfBirth
            ? new Date(formData.dateOfBirth).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Not Provided"}
        </Descriptions.Item>

        {/* Place of Birth */}
        <Descriptions.Item label="Place of Birth">
          {formData.placeOfBirth || "Not Provided"}
        </Descriptions.Item>

        {/* Address */}
        <Descriptions.Item label="Current Address">
          {`${formData.fullAddress || "Not Provided"}`}
        </Descriptions.Item>

        {/* Additional Address */}
        <Descriptions.Item lable="Addtional Address">
          {` ${
            formData.additionalAddress ? ` ${formData.additionalAddress}` : ""
          }`}
        </Descriptions.Item>

        {/* Zip Code */}
        <Descriptions.Item label="Zip Code">
          {formData.zipCode || "Not Provided"}
        </Descriptions.Item>

        {/* ID Type */}
        <Descriptions.Item label="ID Type">
          {idTypeLabels[formData.idType] || "Not Provided"}
        </Descriptions.Item>

        {/* ID Number */}
        <Descriptions.Item label="ID Number">
          {formData.idNumber || "Not Provided"}
        </Descriptions.Item>

        {/* ID Expiration Date */}
        <Descriptions.Item label="ID Expiration Date">
          {formData.idExpirationDate
            ? new Date(formData.dateOfBirth).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Not Provided"}
        </Descriptions.Item>

        {/* Attachments */}
        <Descriptions.Item label="Attachments" span={2}>
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
            : "No files uploaded."}
        </Descriptions.Item>
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
