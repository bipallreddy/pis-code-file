import {
    Alert,
    AlertTitle,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Typography,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import instance from "../../helpers/api";

import CloseIcon from "@mui/icons-material/Close";
import LaunchIcon from "@mui/icons-material/Launch";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Chip from "@mui/material/Chip";

import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import "./viewComplaints.css";
import { blue, indigo, pink } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { getNFT } from "../../helpers/ethers";

const ViewComplaints = () => {
    const [role, setRole] = useState("");
    const [show, setShow] = useState(false);
    const [status, setStatus] = useState("");
    const [lawyer, setLawyer] = useState("");
    const [lawyers, setLawyers] = useState([]);
    const [incident, setIncident] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [complaints, setComplaints] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [lawyerAddress, setLawyerAddress] = useState("");
    const [progressMessage, setProgressMessage] = useState("");
    const [isDialogLoading, setIsDialogLoading] = useState(false);

    const navigate = useNavigate();

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const openAlert = () => {
        setIsAlertOpen(true);
    };

    const closeAlert = () => {
        setIsAlertOpen(false);
    };

    const handleLawerChange = (event) => {
        let lawyerName = event.target.value;
        setLawyer(lawyerName);
        let address = lawyers.filter(
            (lawyer) => lawyer.username === lawyerName
        )[0].address;
        console.log(address);
        setLawyerAddress(address);
    };

    useEffect(() => {
        let id = Cookies.get("id");
        let role = Cookies.get("role");
        let username = Cookies.get("username");
        setProgressMessage("Getting list of complaints");
        if (role && id) {
            setRole(role);
            instance
                .get(`lawyers`)
                .then((response) => {
                    setLawyers(response.data);
                    console.log(response.data);
                })
                .catch((err) => {
                    console.log("Error in fetching the lawyers data: " + err);
                });
            if (role != "user") {
                instance
                    .get(`firs`)
                    .then((response) => {
                        setComplaints(response.data);
                        console.log(response.data);
                        if (role == "lawyer") {
                            let filteredFirs = response.data.filter((fir) => fir.lawyerAssigned == username);
                            setComplaints(filteredFirs);
                        }
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        console.log(
                            "Error in fetching the list of firs for police: " +
                            err
                        );
                    });
            } else if (role === "user") {
                instance
                    .get(`firsByUserId/${id}`)
                    .then((response) => {
                        console.log(response.data);
                        setComplaints(response.data);
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        console.log(
                            "Error in fetching the list of firs for user:  " +
                            err
                        );
                    });
            }
        } else {
            navigate("/");
        }
    }, []);

    const handleViewComplaint = (incident) => {
        setIncident(incident);
        setDialogOpen(true);
    };

    const handleAssignLawyer = (incident) => {
        setIsDialogLoading(true);
        incident.status = "In Progress";
        setProgressMessage("Initiating transaction...");
        incident.lawyerAssigned = lawyer;
        console.log(incident);

        const address = lawyerAddress;
        const firId = incident.complaintId;
        console.log(address, firId);
        instance
            .put(`update-fir`, incident)
            .then((response) => {
                console.log(response);
                setIsDialogLoading(false);
                setStatus("success");
                setErrorMessage("Lawyer assigned successfully!");
                setTimeout(() => {
                    setShow(false);
                    setDialogOpen(false);
                    openAlert(true);
                    document.location.reload();
                }, 2000);
            })
            .catch((err) => {
                console.log("Error in assigning the lawyer: " + err);
            });

    };

    const handleCloseIncident = (incident) => {
        setIsDialogLoading(true);
        setProgressMessage("Initiating transaction...");
        incident.status = "Closed";

        instance
            .put(`update-fir`, incident)
            .then((response) => {
                console.log(response);
                setIsDialogLoading(false);
                setStatus("success");
                setErrorMessage("Complaint closed Successfully!");
                setTimeout(() => {
                    setShow(false);
                    setDialogOpen(false);
                    openAlert(true);
                }, 2000);
            })
            .catch((err) => {
                console.log("Error in closing the incident: " + err);
            });

    };

    const handleWithdrawIncident = (incident) => {
        setIsDialogLoading(true);
        incident.status = "Withdrawn";
        setProgressMessage("Initiating transaction...");

        instance
            .put(`update-fir`, incident)
            .then((response) => {
                console.log(response);
                setIsDialogLoading(false);
                setStatus("success");
                setErrorMessage("Complaint Withdrawn Successfully!");
                setTimeout(() => {
                    setShow(false);
                    setDialogOpen(false);
                    openAlert(true);
                }, 2000);
            })
            .catch((err) => {
                console.log("Error in withdrawing the incident: ", err);
            });


    };



    return (
        <div className="container-view">
            <Snackbar
                open={isAlertOpen}
                autoHideDuration={2000}
                onClose={closeAlert}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert variant="filled" severity={status} onClose={closeAlert}>
                    <AlertTitle>{status}!</AlertTitle>
                    {errorMessage}
                </Alert>
            </Snackbar>
            {isLoading && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <LinearProgress style={{ width: "100%" }} />
                    {progressMessage} Please wait!
                </Box>
            )}
            {!isLoading && (
                <Paper elevation={5} style={{ padding: "10px" }}>
                    {complaints.length > 0 && <h2>List of filed complaints</h2>}
                    <Box className="cards">
                        {complaints.length > 0 &&
                            complaints.map((complaint) => (
                                <Card
                                    elevation={6}
                                    className="card"
                                    key={complaint._id}
                                >
                                    <CardHeader
                                        avatar={
                                            <Avatar aria-label="recipe">
                                                ID
                                            </Avatar>
                                        }
                                        action={
                                            <>
                                                <Tooltip title="Open FIR">
                                                    <IconButton
                                                        aria-label="settings"
                                                        variant="contained"
                                                        onClick={() => {
                                                            handleViewComplaint(
                                                                complaint
                                                            );
                                                        }}
                                                    >
                                                        <LaunchIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        }
                                        title={complaint.firNumber}
                                        subheader={new Date(
                                            complaint.incidentDate
                                        ).toLocaleString()}
                                    />
                                    <CardContent style={{ paddingTop: 0 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            <IconButton aria-label="settings">
                                                <LocationOnIcon />
                                            </IconButton>
                                            {complaint.incidentLocation}
                                        </Typography>
                                        <div className="row">
                                            {complaint.lawyerAssigned && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    <span className="">
                                                        Assigned to:
                                                    </span>
                                                    <Chip
                                                        color="default"
                                                        variant="outlined"
                                                        label={
                                                            complaint.lawyerAssigned
                                                        }
                                                    />
                                                </Typography>
                                            )}{" "}
                                            {!complaint.lawyerAssigned && (
                                                <span>
                                                    Not yet assigned to any
                                                    Lawyer
                                                </span>
                                            )}
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                <Chip
                                                    color={
                                                        complaint.status ===
                                                            "Open"
                                                            ? "info"
                                                            : complaint.status ===
                                                                "In Progress"
                                                                ? "warning"
                                                                : complaint.status ===
                                                                    "Withdrawn"
                                                                    ? "secondary"
                                                                    : "success"
                                                    }
                                                    variant="contained"
                                                    label={complaint.status}
                                                />
                                            </Typography>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        {complaints.length === 0 && <h2>No FIRs Found</h2>}
                    </Box>
                </Paper>
            )}
            {incident && (
                <>
                    <Dialog
                        maxWidth="sm"
                        fullWidth
                        open={isDialogOpen}
                        className="dialog"
                    >
                        <DialogTitle>
                            <h4>Incident Details</h4>
                        </DialogTitle>
                        {isDialogLoading && (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <LinearProgress style={{ width: "100%" }} />
                                {progressMessage} Please wait!
                            </Box>
                        )}
                        {!isDialogLoading && (
                            <DialogContent>
                                {!show &&
                                    !incident.lawyerAssigned && incident.status != "Withdrawn" &&
                                    role === "police" && (
                                        <div>
                                            <span>Select lawyer to assign</span>
                                            <FormControl
                                                variant="outlined"
                                                fullWidth
                                                margin="normal"
                                            >
                                                <Select
                                                    value={lawyer}
                                                    onChange={handleLawerChange}
                                                >
                                                    {lawyers.length > 0 &&
                                                        lawyers.map(
                                                            (lawyer) => (
                                                                <MenuItem
                                                                    value={
                                                                        lawyer.username
                                                                    }
                                                                >
                                                                    {
                                                                        lawyer.username
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                </Select>
                                            </FormControl>
                                            {lawyer &&
                                                !incident.lawyerAssigned && (
                                                    <Button
                                                        fullWidth
                                                        variant="outlined"
                                                        onClick={(e) => {
                                                            handleAssignLawyer(
                                                                incident
                                                            );
                                                        }}
                                                    >
                                                        Assign lawyer
                                                    </Button>
                                                )}
                                        </div>
                                    )}
                                <Card
                                    elevation={4}
                                    sx={{ minWidth: 200 }}
                                    className="card-details"
                                >
                                    <CardContent>
                                        <Typography
                                            gutterBottom
                                            variant="h6"
                                            component="div"
                                        >
                                            Incident Information
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            <div className="row">
                                                <div className="col label">
                                                    Incident Number
                                                </div>
                                                <div className="col">
                                                    {incident.firNumber}
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Incident Date
                                                </div>
                                                <div className="col">
                                                    {new Date(
                                                        incident.incidentDate
                                                    ).toLocaleString()}{" "}
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Description
                                                </div>
                                                <div className="col">
                                                    {incident.description}
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Incident Location
                                                </div>
                                                <div className="col">
                                                    {incident.incidentLocation}
                                                </div>
                                            </div>
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Card
                                    elevation={4}
                                    sx={{ minWidth: 200 }}
                                    className="card-details"
                                >
                                    <CardContent>
                                        <Typography
                                            gutterBottom
                                            variant="h6"
                                            component="div"
                                        >
                                            Reporting Person Details
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            <div className="row">
                                                <div className="col label">
                                                    Reportee name
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.reportingPerson
                                                            .name
                                                    }
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Contact Number
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.reportingPerson
                                                            .contactNumber
                                                    }
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Email
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.reportingPerson
                                                            .email
                                                    }
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Address:
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.reportingPerson
                                                            .address.street
                                                    }
                                                    ,{" "}
                                                    {
                                                        incident.reportingPerson
                                                            .address.city
                                                    }
                                                    ,{" "}
                                                    {
                                                        incident.reportingPerson
                                                            .address.state
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        incident.reportingPerson
                                                            .address.pincode
                                                    }
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Date of Birth:{" "}
                                                </div>
                                                <div className="col">
                                                    {new Date(
                                                        incident.reportingPerson.dob
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Aadhar Number:{" "}
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.reportingPerson
                                                            .aadharNumber
                                                    }
                                                </div>
                                            </div>
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Card
                                    elevation={4}
                                    sx={{ minWidth: 200 }}
                                    className="card-details"
                                >
                                    <CardContent>
                                        <Typography
                                            gutterBottom
                                            variant="h6"
                                            component="div"
                                        >
                                            Victim Details
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            <div className="row">
                                                <div className="col label">
                                                    Victim name
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.victimDetails
                                                            .name
                                                    }
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Contact Number
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.victimDetails
                                                            .contactNumber
                                                    }
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Email
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.victimDetails
                                                            .email
                                                    }
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Address:
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.victimDetails
                                                            .address.street
                                                    }
                                                    ,{" "}
                                                    {
                                                        incident.victimDetails
                                                            .address.city
                                                    }
                                                    ,{" "}
                                                    {
                                                        incident.victimDetails
                                                            .address.state
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        incident.victimDetails
                                                            .address.pincode
                                                    }
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Date of Birth:{" "}
                                                </div>
                                                <div className="col">
                                                    {new Date(
                                                        incident.victimDetails.dob
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col label">
                                                    Aadhar Number:{" "}
                                                </div>
                                                <div className="col">
                                                    {
                                                        incident.victimDetails
                                                            .aadharNumber
                                                    }
                                                </div>
                                            </div>
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Card
                                    elevation={4}
                                    sx={{ minWidth: 200 }}
                                    className="card-details"
                                >
                                    <CardContent>
                                        <Typography
                                            gutterBottom
                                            variant="h6"
                                            component="div"
                                        >
                                            Suspect Details
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {incident.suspects.map(
                                                (suspect, index) => (
                                                    <div
                                                        key={index}
                                                        className="suspects"
                                                    >
                                                        <span>
                                                            {index + 1}.
                                                        </span>
                                                        <span>
                                                            {suspect.name}
                                                        </span>
                                                        <Typography variant="body1">
                                                            <Chip
                                                                variant="outlined"
                                                                avatar={
                                                                    suspect.gender ===
                                                                        "M" ? (
                                                                        <Avatar
                                                                            sx={{
                                                                                bgcolor:
                                                                                    blue[400],
                                                                                color: indigo[900],
                                                                                width: 30,
                                                                                height: 30,
                                                                            }}
                                                                        >
                                                                            M
                                                                        </Avatar>
                                                                    ) : (
                                                                        <Avatar
                                                                            sx={{
                                                                                bgcolor:
                                                                                    pink[200],
                                                                                width: 30,
                                                                                height: 30,
                                                                            }}
                                                                        >
                                                                            F
                                                                        </Avatar>
                                                                    )
                                                                }
                                                                label={
                                                                    suspect.age +
                                                                    " Yrs."
                                                                }
                                                            />
                                                        </Typography>
                                                    </div>
                                                )
                                            )}
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            gutterBottom
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            <div className="row">
                                                <div className="col label">
                                                    Lawyer Assigned:{" "}
                                                </div>
                                                <div className="col">
                                                    {!incident.lawyerAssigned && (
                                                        <span>
                                                            Not yet assigned to
                                                            any Lawyer{" "}
                                                        </span>
                                                    )}
                                                    {incident.lawyerAssigned && (
                                                        <span>
                                                            {
                                                                incident.lawyerAssigned
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            <div className="row">
                                                <div className="col label">
                                                    Incident Status
                                                </div>
                                                <div className="col">
                                                    <Chip
                                                        color={
                                                            incident.status ===
                                                                "Open"
                                                                ? "info"
                                                                : incident.status ===
                                                                    "In Progress"
                                                                    ? "warning"
                                                                    : incident.status ===
                                                                        "Withdrawn"
                                                                        ? "secondary"
                                                                        : "success"
                                                        }
                                                        variant="contained"
                                                        label={incident.status}
                                                    />
                                                </div>
                                            </div>
                                        </Typography>
                                    </CardContent>
                                    {incident.status === "In Progress" &&
                                        role === "lawyer" && (
                                            <Button
                                                onClick={(e) => {
                                                    handleCloseIncident(
                                                        incident
                                                    );
                                                }}
                                                color="success"
                                                variant="contained"
                                            >
                                                Close Incident
                                            </Button>
                                        )}

                                    {(incident.status === "In Progress" ||
                                        incident.status == "Open") &&
                                        role === "user" && (
                                            <Button
                                                onClick={(e) => {
                                                    handleWithdrawIncident(
                                                        incident
                                                    );
                                                }}
                                                color="secondary"
                                                variant="contained"
                                            >
                                                Withdraw Complaint
                                            </Button>
                                        )}
                                </Card>
                            </DialogContent>
                        )}
                        <DialogActions>
                            {!isDialogLoading && (
                                <Button
                                    onClick={handleCloseDialog}
                                    color="primary"
                                    endIcon={<CloseIcon />}
                                ></Button>
                            )}
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </div>
    );
};

export default ViewComplaints;
