import React, { useState } from "react";
import "./signup.css";
import instance from "../../helpers/api";
import signupSchema from "./signupSchema";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Snackbar from "@mui/material/Snackbar";

import {
    Button,
    Typography,
    Paper,
    Box,
    TextField,
    InputAdornment,
    IconButton,
    LinearProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Signup = () => {
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [serverOtp, setServerOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [showOtpPage, setShowOtpPage] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");

    const openAlert = () => {
        setIsAlertOpen(true);
    };

    const closeAlert = () => {
        setIsAlertOpen(false);
    };

    const handleOtpChange = (event) => {
        setOtp(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    // show pwd events
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleOtpSubmit = () => {
        setIsLoading(true);
        setProgressMessage("Verifying OTP");
        console.log(serverOtp);
        console.log(otp);
        if (serverOtp == otp) {
            setTimeout(() => {
                console.log("otp matched");
                setStatus("success");
                setErrorMessage("OTP Verified successfully");
                openAlert();
                setProgressMessage("Registering user...");
                instance
                    .post("register", {
                        email,
                        password,
                        username,
                        address: "",
                        role: "user",
                    })
                    .then((response) => {
                        setIsLoading(false);
                        setStatus("success");
                        setErrorMessage("User registered successfully");
                        openAlert();
                        setProgressMessage("");
                        setTimeout(() => {
                            window.location.href = "/";
                        }, 1000);
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        console.log(error);
                        console.error(
                            "Registration error:",
                            error.response.data
                        );
                        setStatus("error");
                        setErrorMessage(error.response.data.message);
                        openAlert();
                    });
            }, 1500);
        } else {
            setTimeout(() => {
                console.log("otp not matched");
                setIsLoading(false);
                setStatus("error");
                setErrorMessage("OTP Verification failed");
                openAlert();
                setProgressMessage("");
            }, 1500);
        }
    };

    const handleOtpRequest = () => {
        signupSchema
            .validate({ email, password, username }, { abortEarly: false })
            .then(() => {
                setIsLoading(true);
                setProgressMessage(`Sending OTP to ${email}`);
                instance
                    .get(`get-otp/${email}`)
                    .then((response) => {
                        console.log(response.data);
                        if (response.data) {
                            let serverOTP = response.data.otp;
                            setServerOtp(serverOTP);
                        }
                        setTimeout(() => {
                            setIsLoading(false);
                            setStatus("success");
                            setErrorMessage(`OTP sent to ${email}`);
                            openAlert();
                            setShowOtpPage(true);
                        }, 2000);
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        console.log(error);
                        console.error("OTP error:", error.response.data);
                        setStatus("error");
                        setErrorMessage(error.response.data.message);
                        openAlert();
                    });
            })
            .catch((validationErrors) => {
                const validationErrorMap = {};
                validationErrors.inner.forEach((error) => {
                    validationErrorMap[error.path] = error.message;
                });
                setErrors(validationErrorMap);
            });
    };

    return (
        <div className="box">
            <Snackbar
                open={isAlertOpen}
                onClose={closeAlert}
                autoHideDuration={2000}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert variant="filled" severity={status} onClose={closeAlert}>
                    <AlertTitle>{status}!</AlertTitle>
                    {errorMessage}
                </Alert>
            </Snackbar>
            <Paper className="signupbox" elevation={5}>
                {isLoading && (
                    <Box
                        p={8}
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
                {!isLoading && !showOtpPage && (
                    <Box p={3}>
                        <Typography variant="h4">Register</Typography> <br />
                        <TextField
                            required
                            fullWidth
                            type="text"
                            margin="normal"
                            label="Username"
                            value={username}
                            id="outlined-required"
                            error={!!errors.username}
                            helperText={errors.username}
                            onChange={handleUsernameChange}
                        />
                        <TextField
                            required
                            fullWidth
                            type="text"
                            value={email}
                            label="Email"
                            margin="normal"
                            error={!!errors.email}
                            id="outlined-required"
                            helperText={errors.email}
                            onChange={handleEmailChange}
                            placeholder="john@example.com"
                        />
                        <TextField
                            required
                            fullWidth
                            margin="normal"
                            label="Password"
                            value={password}
                            id="outlined-required"
                            placeholder="*********"
                            error={!!errors.password}
                            helperText={errors.password}
                            onChange={handlePasswordChange}
                            type={showPassword ? "text" : "password"}
                            InputProps={{
                                endAdornment: (
                                    <>
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={
                                                    handleClickShowPassword
                                                }
                                                onMouseDown={
                                                    handleMouseDownPassword
                                                }
                                                edge="end"
                                            >
                                                {showPassword ? (
                                                    <Visibility />
                                                ) : (
                                                    <VisibilityOff />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    </>
                                ),
                            }}
                        />
                        <br />
                        <Button
                            fullWidth
                            color="info"
                            variant="contained"
                            onClick={handleOtpRequest}
                        >
                            Request OTP
                        </Button>
                        <br /> <br />
                        <span>
                            Already have an account?{" "}
                            <Link
                                to="/"
                                href="#"
                                variant="body2"
                                color="primary"
                                underline="none"
                                component={Link}
                                sx={{ textDecoration: "none" }}
                            >
                                Login
                            </Link>
                        </span>
                    </Box>
                )}
                {!isLoading && showOtpPage && (
                    <Box p={3}>
                        <Typography variant="h4">Enter OTP</Typography> <br />
                        <TextField
                            required
                            fullWidth
                            label="OTP"
                            value={otp}
                            type="text"
                            margin="normal"
                            id="outlined-required"
                            onChange={handleOtpChange}
                            placeholder="Please enter 6 digit OTP"
                        />
                        <Button
                            fullWidth
                            color="primary"
                            variant="contained"
                            onClick={handleOtpSubmit}
                            disabled={!otp || otp.length != 6}
                        >
                            Submit OTP
                        </Button>
                    </Box>
                )}
            </Paper>
        </div>
    );
};

export default Signup;
