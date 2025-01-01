import "../../styles/adminevents.css";
import Sidebar from "../Sidebar/ASidebar";
import plusicon from "../../assets/background/Plus.png";
import { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Input,
  Button,
  Alert,
  Space,
  DatePicker,
  TimePicker,
  message,
} from "antd";
import {
  CheckOutlined,
  DeleteFilled,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { db } from "../../../firebaseConfig"; // Import your Firebase configuration
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

dayjs.extend(customParseFormat);

const AdminEvents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [tableData, setTableData] = useState([]);
  const [editKey, setEditKey] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Firestore Collection References
  const eventsCollectionRef = collection(db, "events");

  // Fetch Data from Firestore
  const fetchData = async () => {
    const eventsSnapshot = await getDocs(eventsCollectionRef);

    setTableData(
      eventsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    );
  };

  // Format the time to include AM/PM
  const formattedTime = formData.time
    ? dayjs(formData.time, "HH:mm:ss").format("h:mm A")
    : "";

  const updatedFormData = {
    ...formData,
    time: formattedTime, // Save the formatted time
    dateCreated: isEditMode
      ? formData.dateCreated
      : new Date().toLocaleDateString(),
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (record = null) => {
    if (record) {
      setIsEditMode(true);
      setFormData(record);
      setEditKey(record.id);
    } else {
      setIsEditMode(false);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Input Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Checks the link if valid
  const isValidURL = (url) => {
    const urlRegex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/;
    return urlRegex.test(url);
  };

  // Add or Update Event
  const handleSubmit = async () => {
    if (!isValidURL(formData.link)) {
      message.error("Please enter a valid URL for the link.");
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      message.error("Please fill in all required fields.");
      return;
    }

    // Format the time dynamically
    const formattedTime = formData.time
      ? dayjs(formData.time, "h:mm A").format("h:mm A")
      : "";

    const updatedFormData = {
      ...formData,
      time: formattedTime,
      dateCreated: isEditMode
        ? formData.dateCreated
        : new Date().toLocaleDateString(),
      isOpened: false,
    };

    try {
      if (isEditMode) {
        // Update existing event
        const eventDoc = doc(db, "events", editKey);
        await updateDoc(eventDoc, updatedFormData);
        setAlertMessage("Event Updated Successfully");
      } else {
        // Add a new event with isOpened default to false
        await addDoc(eventsCollectionRef, updatedFormData);
        setAlertMessage("New Event Created Successfully");
      }
      setIsModalOpen(false);
      fetchData();
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Failed to save event:", error);
      message.error("Failed to save event.");
    }
  };

  // Delete Event with Confirmation
  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this event?",
      content: "Once deleted, the event cannot be recovered.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const eventDoc = doc(db, "events", id);
          await deleteDoc(eventDoc);
          message.success("Event deleted successfully");
          fetchData();
        } catch (error) {
          message.error("Failed to delete event");
        }
      },
      onCancel() {
        message.info("You have cancelled the deletion!");
      },
    });
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      className: "transparent-background",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      className: "transparent-background",
    },
    {
      title: "Web Link",
      dataIndex: "link",
      key: "link",
      className: "transparent-background",
      render: (text) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      className: "transparent-background",
    },
    {
      title: "Date and Time",
      key: "dateAndTime",
      className: "transparent-background",
      render: (text, record) => (
        <span>
          {dayjs(record.date).format("MMMM D, YYYY")} @ {record.time || "N/A"}
        </span>
      ),
    },

    {
      title: "Created On",
      dataIndex: "dateCreated",
      key: "dateCreated",
      className: "transparent-background",
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Action",
      key: "action",
      className: "transparent-background",
      render: (text, record) => (
        <Space size="middle">
          <EditOutlined
            onClick={() => handleOpenModal(record)}
            style={{ color: "#1890ff", cursor: "pointer" }}
          />
          <DeleteFilled
            onClick={() => showDeleteConfirm(record.id)}
            style={{ color: "#ff4d4f", cursor: "pointer" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="admin-profile-container">
        <Sidebar />
        <div className="admin-profile-content">
          <div className="admin-profile-heading">
            <h2>Events</h2>
          </div>
          {showAlert && (
            <Alert
              message={
                <>
                  <CheckOutlined style={{ color: "#48742C" }} />{" "}
                  <span style={{ color: "#48742C" }}>{alertMessage}</span>
                </>
              }
              type="success"
              className="alert-top-right"
            />
          )}
          <Table
            className="accountsdata-table"
            columns={columns}
            dataSource={tableData}
            rowKey="id"
            pagination={{
              pageSize: 2, // Display 2 records per page
              showSizeChanger: false, // Hide the page size changer
            }}
          />
        </div>

        {/* Add Button */}
        <div className="derma-save" onClick={() => handleOpenModal()}>
          <button
            style={{
              backgroundColor: "#51829B",
              border: "none",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              position: "fixed",
              bottom: "20px",
              right: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <PlusOutlined style={{ color: "white", fontSize: "24px" }} />
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        title={isEditMode ? "Edit Event" : "New Event"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <Input
          className="input-gap"
          placeholder="Title of the event"
          name="title"
          value={formData.title || ""}
          onChange={handleInputChange}
        />
        <Input
          className="input-gap"
          placeholder="Description"
          name="description"
          value={formData.description || ""}
          onChange={handleInputChange}
        />
        <Input
          className="input-gap"
          placeholder="Location"
          name="location"
          value={formData.location || ""}
          onChange={handleInputChange}
        />

        <Input
          className="input-gap"
          placeholder="e.g., https://example.com"
          name="link"
          value={formData.link || ""}
          onChange={handleInputChange}
        />
        <Space direction="horizontal">
          <DatePicker
            onChange={(date, dateString) =>
              setFormData({ ...formData, date: dateString })
            }
            className="input-gap"
            value={formData.date ? dayjs(formData.date) : null}
            placeholder="Select a date"
          />
          <TimePicker
            use12Hours
            format="h:mm a"
            onChange={(time) =>
              setFormData({
                ...formData,
                time: time ? dayjs(time).format("h:mm A") : "",
              })
            }
            defaultOpenValue={dayjs("00:00:00", "HH:mm:ss")}
            className="input-gap"
            value={formData.time ? dayjs(formData.time, "h:mm A") : null}
            placeholder="Select a time"
          />
        </Space>
        <Button
          type="primary"
          block
          style={{ backgroundColor: "#51829B", marginTop: "20px" }}
          onClick={handleSubmit}
        >
          {isEditMode ? "Update Event" : "Create Event"}
        </Button>
      </Modal>
    </>
  );
};

export default AdminEvents;
