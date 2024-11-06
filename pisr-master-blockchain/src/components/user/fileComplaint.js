import React, { useState } from "react";
import {
    TextField,
    Button,
    Paper,
    Box,
    Snackbar,
    Alert,
    AlertTitle,
    LinearProgress,
} from "@mui/material";
import "./fileComplaint.css";
import instance from "../../helpers/api";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import Cookies from "js-cookie";
import { initialValues } from "../consts";
import { getNFT } from "../../helpers/ethers";
import { useNavigate } from "react-router-dom";
import fileComplaintSchema from "./fileComplaintSchema";

const FileComplaint = () => {
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [formData, setFormData] = useState(initialValues);
    const [progressMessage, setProgressMessage] = useState("");

    const navigate = useNavigate();

    const openAlert = () => {
        setIsAlertOpen(true);
    };

    const closeAlert = () => {
        setIsAlertOpen(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        console.log(event.target);
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleNestedChange = (parentField, field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [parentField]: {
                ...prevData[parentField],
                [field]: value,
            },
        }));
    };

    const handleNestedChange1 = (parentField, childField, field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [parentField]: {
                ...prevData[parentField],
                [childField]: {
                    ...prevData[parentField][childField],
                    [field]: value,
                },
            },
        }));
    };

    const handleAddSuspect = () => {
        setFormData((prevData) => ({
            ...prevData,
            suspects: [
                ...prevData.suspects,
                {
                    name: "",
                    age: "",
                    gender: "",
                },
            ],
        }));
    };

    const handleRemoveSuspect = (index) => {
        setFormData((prevData) => ({
            ...prevData,
            suspects: prevData.suspects.filter((_, i) => i !== index),
        }));
    };

    const handleSuspectChange = (parentField, field, value, index) => {
        if (parentField === "suspects") {
            setFormData((prevData) => ({
                ...prevData,
                suspects: prevData.suspects.map((suspect, i) =>
                    i === index ? { ...suspect, [field]: value } : suspect
                ),
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [parentField]: {
                    ...prevData[parentField],
                    [field]: value,
                },
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let id = Cookies.get("id");
        formData.userId = id;
        console.log(formData);
        fileComplaintSchema
            .validate(formData, { abortEarly: false })
            .then(() => {
                setShow(true);
                setProgressMessage("Registering complaint...");
                console.log(formData);
                instance.post("file-fir", formData).then(
                    (response) => {
                        console.log("response", response);
                        const incident = response.data;
                        setTimeout(() => {
                            setProgressMessage("Transaction in progress...");
                        }, 1000);
                        const fileComplaint = async (url) => {
                            console.log("inside contract: " + url);
                            const contract = await getNFT();
                            const complaintId =
                                await contract.fileComplaint.staticCall(url);
                            const tx = await contract.fileComplaint(url);
                            await tx.wait(1);
                            return complaintId;
                        };
                        const url =
                            "https://pis-express.netlify.app/firById/" +
                            response.data._id;
                        let firId = response.data._id;
                        console.log("fid:" + firId);
                        fileComplaint(url).then(
                            (id) => {
                                incident.complaintId = id.toString();
                                console.log(
                                    "Complained registered successfully",
                                    id
                                );
                                console.log("complaint: " + incident);
                                instance
                                    .put(`update-fir`, incident)
                                    .then((res) => {
                                        console.log("response", res);
                                        setStatus("success");
                                        setErrorMessage(
                                            "Complaint filed successfully"
                                        );
                                        setTimeout(() => {
                                            setShow(false);
                                            openAlert();
                                            setTimeout(() => {
                                                navigate(
                                                    "/home/view-complaints"
                                                );
                                            }, 1000);
                                        }, 2000);
                                    });
                            },
                            (err) => {
                                setStatus("error");
                                if (err.info.error.code == 4001) {
                                    instance
                                        .delete(`/firById/${firId}`)
                                        .then((response) => {
                                            console.log(response);
                                            setErrorMessage(
                                                "User denied the ETH Transaction"
                                            );
                                        });
                                } else {
                                    setErrorMessage(
                                        "Internal Server Error. Retry again!"
                                    );
                                }
                                setTimeout(() => {
                                    setShow(false);
                                    openAlert();
                                    setTimeout(() => {
                                        navigate("/home/file-complaint");
                                    }, 1000);
                                }, 2000);
                            }
                        );
                    },
                    
                    (err) => {
                        console.log("Error in saving the fir:" + err);
                    }
                );
            })
            .catch((validationErrors) => {
                const validationErrorMap = {};
                validationErrors.inner.forEach((error) => {
                    const field = error.path;
                    const pathArray = field.split(".");
                    console.log(pathArray);
                    if (pathArray[0] === "suspects") {
                        const index = parseInt(pathArray[1], 10);
                        const nestedField = pathArray[2];
                        validationErrorMap.suspects =
                            validationErrorMap.suspects || [];
                        validationErrorMap.suspects[index] =
                            validationErrorMap.suspects[index] || {};
                        validationErrorMap.suspects[index][nestedField] =
                            error.message;
                    } else {
                        pathArray.reduce((acc, key, index) => {
                            if (index === pathArray.length - 1) {
                                acc[key] = error.message;
                            } else {
                                acc[key] = acc[key] || {};
                            }
                            return acc[key];
                        }, validationErrorMap);
                    }
                });
                console.log(validationErrorMap);
                setErrors(validationErrorMap);
            });
    };

    return (
        <>
            <div className="container-form">
                <Snackbar
                    open={isAlertOpen}
                    onClose={closeAlert}
                    autoHideDuration={2000}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert
                        variant="filled"
                        severity={status}
                        onClose={closeAlert}
                    >
                        <AlertTitle>{status}!</AlertTitle>
                        {errorMessage}
                    </Alert>
                </Snackbar>
                {show && (
                    <Box
                        sx={{
                            width: "40%",
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <LinearProgress style={{ width: "100%" }} />
                        {progressMessage} Please wait!
                    </Box>
                )}
                {!show && (
                    <Paper className="form" elevation={8}>
                        <Box>
                            <h2 className="center">Incident Report Form</h2>
                            <hr></hr>
                            <form onSubmit={handleSubmit}>
                                <h3>Incident details</h3>
                                <div className="rowline">
                                    <div className="colline">
                                        <span className="label">
                                            Incident Date
                                        </span>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                            name="incidentDate"
                                            type="datetime-local"
                                            onChange={handleChange}
                                            value={formData.incidentDate}
                                            error={Boolean(errors.incidentDate)}
                                            helperText={
                                                errors.incidentDate && (
                                                    <span>
                                                        Incident date is
                                                        required
                                                    </span>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="collline colline-full">
                                        <span className="label">
                                            Incident location
                                        </span>
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            variant="outlined"
                                            name="incidentLocation"
                                            onChange={handleChange}
                                            value={formData.incidentLocation}
                                            error={!!errors.incidentLocation}
                                            helperText={errors.incidentLocation}
                                            placeholder="Please include the exact location of the incident"
                                        />
                                    </div>
                                </div>
                                <div className="rowline">
                                    <div className="colline colline-full">
                                        <span className="label">
                                            Description
                                        </span>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rowlines={3}
                                            margin="normal"
                                            variant="outlined"
                                            name="description"
                                            onChange={handleChange}
                                            value={formData.description}
                                            error={!!errors.description}
                                            helperText={errors.description}
                                            placeholder="Describe the incident clearly in not less than 200 characters"
                                        />
                                    </div>
                                </div>
                                <h3>Reporting Person Details</h3>
                                <div className="rowline">
                                    <div className="colline">
                                        <span className="label">
                                            Reportee Name
                                        </span>
                                        <TextField
                                            fullWidth
                                            type="text"
                                            variant="outlined"
                                            name="reportingPerson.name"
                                            value={
                                                formData.reportingPerson.name
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "reportingPerson",
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .name && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .name
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .name && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .name
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">
                                            Contact Number
                                        </span>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            variant="outlined"
                                            name="reportingPerson.contactNumber"
                                            value={
                                                formData.reportingPerson
                                                    .contactNumber
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "reportingPerson",
                                                    "contactNumber",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .contactNumber && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .contactNumber
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .contactNumber && (
                                                                <div>{errors.reportingPerson.contactNumber}</div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">Email ID</span>
                                        <TextField
                                            type="email"
                                            fullWidth
                                            variant="outlined"
                                            name="reportingPerson.email"
                                            value={
                                                formData.reportingPerson.email
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "reportingPerson",
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .email && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .email
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .email && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .email
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rowline">
                                    <div className="colline">
                                        <span className="label">
                                            Reportee DOB
                                        </span>
                                        <TextField
                                            type="datetime-local"
                                            fullWidth
                                            variant="outlined"
                                            name="reportingPerson.dob"
                                            value={formData.reportingPerson.dob}
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "reportingPerson",
                                                    "dob",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .dob && (
                                                                <div>
                                                                    {errors.incidentDate && (
                                                                        <span>
                                                                            Incident
                                                                            date is
                                                                            required
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .dob && (
                                                                <div>
                                                                    {errors
                                                                        .reportingPerson
                                                                        .dob && (
                                                                            <span>
                                                                                Reportee
                                                                                DOB is
                                                                                required
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">
                                            Aadhar Number
                                        </span>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            name="reportingPerson.aadharNumber"
                                            value={
                                                formData.reportingPerson
                                                    .aadharNumber
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "reportingPerson",
                                                    "aadharNumber",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .aadharNumber && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .aadharNumber
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .aadharNumber && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .aadharNumber
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">
                                            Street Name
                                        </span>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            name="reportingPerson.address.street"
                                            value={
                                                formData.reportingPerson.address
                                                    .street
                                            }
                                            onChange={(e) =>
                                                handleNestedChange1(
                                                    "reportingPerson",
                                                    "address",
                                                    "street",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .address.street && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .address
                                                                            .street
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .address.street && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .address
                                                                            .street
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rowline">
                                    <div className="colline">
                                        <span className="label">City</span>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            name="reportingPerson.address.city"
                                            value={
                                                formData.reportingPerson.address
                                                    .city
                                            }
                                            onChange={(e) =>
                                                handleNestedChange1(
                                                    "reportingPerson",
                                                    "address",
                                                    "city",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .address.city && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .address
                                                                            .city
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .address.city && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .address
                                                                            .city
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">State</span>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            name="reportingPerson.address.state"
                                            value={
                                                formData.reportingPerson.address
                                                    .state
                                            }
                                            onChange={(e) =>
                                                handleNestedChange1(
                                                    "reportingPerson",
                                                    "address",
                                                    "state",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .address.state && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .address
                                                                            .state
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .address.state && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .address
                                                                            .state
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">PIN code</span>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            name="reportingPerson.address.pincode"
                                            value={
                                                formData.reportingPerson.address
                                                    .pincode
                                            }
                                            onChange={(e) =>
                                                handleNestedChange1(
                                                    "reportingPerson",
                                                    "address",
                                                    "pincode",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .address
                                                            .pincode && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .address
                                                                            .pincode
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.reportingPerson &&
                                                typeof errors.reportingPerson ===
                                                "object" && (
                                                    <>
                                                        {errors.reportingPerson
                                                            .address
                                                            .pincode && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .reportingPerson
                                                                            .address
                                                                            .pincode
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <h3>Victim Details</h3>
                                <div className="rowline">
                                    <div className="colline">
                                        <span className="label">
                                            Victim Name
                                        </span>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            name="victimDetails.name"
                                            value={formData.victimDetails.name}
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "victimDetails",
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .name && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .name
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .name && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .name
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">
                                            Contact Number
                                        </span>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            name="victimDetails.contactNumber"
                                            value={
                                                formData.victimDetails
                                                    .contactNumber
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "victimDetails",
                                                    "contactNumber",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .contactNumber && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .contactNumber
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .contactNumber && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .contactNumber
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">Email ID</span>
                                        <TextField
                                            type="email"
                                            fullWidth
                                            variant="outlined"
                                            name="victimDetails.email"
                                            value={formData.victimDetails.email}
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "victimDetails",
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .email && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .email
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .email && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .email
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rowline">
                                    <div className="colline">
                                        <span className="label">
                                            Victim DOB
                                        </span>
                                        <TextField
                                            type="datetime-local"
                                            fullWidth
                                            variant="outlined"
                                            name="victimDetails.dob"
                                            value={formData.victimDetails.dob}
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "victimDetails",
                                                    "dob",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .dob && (
                                                                <div>
                                                                    {errors
                                                                        .victimDetails
                                                                        .dob && (
                                                                            <span>
                                                                                Victim
                                                                                DOB is
                                                                                required
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .dob && (
                                                                <div>
                                                                    {errors.incidentDate && (
                                                                        <span>
                                                                            Victim
                                                                            DOB is
                                                                            required
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">
                                            Aadhar Number
                                        </span>
                                        <TextField
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            name="victimDetails.aadharNumber"
                                            value={
                                                formData.victimDetails
                                                    .aadharNumber
                                            }
                                            onChange={(e) =>
                                                handleNestedChange(
                                                    "victimDetails",
                                                    "aadharNumber",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .aadharNumber && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .aadharNumber
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .aadharNumber && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .aadharNumber
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">
                                            Street Name
                                        </span>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            name="victimDetails.address.street"
                                            value={
                                                formData.victimDetails.address
                                                    .street
                                            }
                                            onChange={(e) =>
                                                handleNestedChange1(
                                                    "victimDetails",
                                                    "address",
                                                    "street",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .address.street && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .address
                                                                            .street
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .address.street && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .address
                                                                            .street
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="rowline">
                                    <div className="colline">
                                        <span className="label">City</span>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            name="victimDetails.address.city"
                                            value={
                                                formData.victimDetails.address
                                                    .city
                                            }
                                            onChange={(e) =>
                                                handleNestedChange1(
                                                    "victimDetails",
                                                    "address",
                                                    "city",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .address.city && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .address
                                                                            .city
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .address.city && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .address
                                                                            .city
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">State</span>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            name="victimDetails.address.state"
                                            value={
                                                formData.victimDetails.address
                                                    .state
                                            }
                                            onChange={(e) =>
                                                handleNestedChange1(
                                                    "victimDetails",
                                                    "address",
                                                    "state",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .address.state && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .address
                                                                            .state
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .address.state && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .address
                                                                            .state
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="colline">
                                        <span className="label">PIN code</span>
                                        <TextField
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            name="victimDetails.address.pincode"
                                            value={
                                                formData.victimDetails.address
                                                    .pincode
                                            }
                                            onChange={(e) =>
                                                handleNestedChange1(
                                                    "victimDetails",
                                                    "address",
                                                    "pincode",
                                                    e.target.value
                                                )
                                            }
                                            margin="normal"
                                            error={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .address
                                                            .pincode && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .address
                                                                            .pincode
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                            helperText={
                                                errors.victimDetails &&
                                                typeof errors.victimDetails ===
                                                "object" && (
                                                    <>
                                                        {errors.victimDetails
                                                            .address
                                                            .pincode && (
                                                                <div>
                                                                    {
                                                                        errors
                                                                            .victimDetails
                                                                            .address
                                                                            .pincode
                                                                    }
                                                                </div>
                                                            )}
                                                    </>
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                {formData.suspects.length !== 0 && (
                                    <h3>Suspect Details</h3>
                                )}
                                {formData.suspects.map((suspect, index) => (
                                    <div className="rowline" key={index}>
                                        {/* Suspect {index + 1} : */}
                                        <div className="colline colline-suspect">
                                            <TextField
                                                variant="outlined"
                                                fullWidth
                                                label="Name"
                                                name={`suspects[${index}].name`}
                                                value={suspect.name}
                                                onChange={(e) =>
                                                    handleSuspectChange(
                                                        "suspects",
                                                        "name",
                                                        e.target.value,
                                                        index
                                                    )
                                                }
                                                margin="normal"

                                            />
                                            {errors.suspects &&
                                                errors.suspects.length > 0 && (
                                                    <>
                                                        <div>
                                                            Suspects Errors:
                                                        </div>
                                                        {errors.suspects.map(
                                                            (
                                                                suspectErrors,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                >
                                                                    <strong>
                                                                        Suspect{" "}
                                                                        {index +
                                                                            1}
                                                                        :
                                                                    </strong>
                                                                    {Object.keys(
                                                                        suspectErrors
                                                                    ).map(
                                                                        (
                                                                            field
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    field
                                                                                }
                                                                            >
                                                                                {
                                                                                    field
                                                                                }

                                                                                :{" "}
                                                                                {
                                                                                    suspectErrors[
                                                                                    field
                                                                                    ]
                                                                                }
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )
                                                        )}
                                                    </>
                                                )}
                                        </div>
                                        <div className="colline colline-suspect">
                                            <TextField
                                                variant="outlined"
                                                fullWidth
                                                label="Gender"
                                                placeholder="M/F"
                                                name={`suspects[${index}].gender`}
                                                inputProps={{ maxLength: 1 }}
                                                value={suspect.gender}
                                                onChange={(e) =>
                                                    handleSuspectChange(
                                                        "suspects",
                                                        "gender",
                                                        e.target.value,
                                                        index
                                                    )
                                                }
                                                margin="normal"
                                            />
                                        </div>
                                        <div className="colline colline-suspect">
                                            <TextField
                                                type="number"
                                                variant="outlined"
                                                fullWidth
                                                label="Age"
                                                name={`suspects[${index}].age`}
                                                value={suspect.age}
                                                onChange={(e) =>
                                                    handleSuspectChange(
                                                        "suspects",
                                                        "age",
                                                        e.target.value,
                                                        index
                                                    )
                                                }
                                                margin="normal"
                                            />
                                        </div>
                                        <div className="colline colline-suspect-del">
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() =>
                                                    handleRemoveSuspect(index)
                                                }
                                                endIcon={<DeleteIcon />}
                                            >
                                                Remove
                                            </Button>
                                        </div>{" "}
                                        <br />
                                    </div>
                                ))}

                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleAddSuspect}
                                    startIcon={<AddIcon />}
                                >
                                    Add Suspect
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    style={{ marginTop: "20px" }}
                                >
                                    Submit
                                </Button>
                            </form>
                        </Box>
                    </Paper>
                )}
            </div>
        </>
    );
};

export default FileComplaint;
