import "./login.css";
import React, { useState } from "react";
import instance from "../../helpers/api";
import loginSchema from "./loginSchema";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Snackbar from "@mui/material/Snackbar";

import {
    FormControl,
    InputLabel,
    Button,
    Select,
    MenuItem,
    Typography,
    Paper,
    Box,
    TextField,
    FormHelperText,
    IconButton,
    InputAdornment,
    LinearProgress,
} from "@mui/material";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const openAlert = () => {
        setIsAlertOpen(true);
    };

    const closeAlert = () => {
        setIsAlertOpen(false);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleRoleChange = (event) => {
        setRole(event.target.value);
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleLogin = () => {
        loginSchema
            .validate({ email, password, role }, { abortEarly: false })
            .then(() => {
                setIsLoading(true);
                instance
                    .post("login", {
                        email,
                        password,
                        role,
                    })
                    .then((response) => {
                        setIsLoading(false);
                        setStatus("success");
                        setErrorMessage(response.data.message);
                        console.log("Login successful:", response.data);
                        openAlert();
                        Cookies.set("id", response.data.id);
                        Cookies.set("role", response.data.role);
                        Cookies.set("username", response.data.username);
                        setTimeout(() => {
                            window.location.href = "/home";
                        }, 2100);
                    })
                    .catch((error) => {
                        setIsLoading(false);
                        console.error("Login error:", error.response.data);
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
            <Paper className="loginBox" elevation={5}>
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
                        <LinearProgress style={{width: "100%"}} />
                        Getting in... please wait!
                    </Box>
                )}
                {!isLoading && (
                    <Box p={3}>
                        <Typography variant="h4">Login</Typography> <br />
                        <TextField
                            required
                            fullWidth
                            type="email"
                            label="Email"
                            value={email}
                            id="outlined-required"
                            error={!!errors.email}
                            helperText={errors.email}
                            onChange={handleEmailChange}
                            placeholder="john@example.com"
                        />{" "}
                        <br /> <br />
                        <TextField
                            required
                            fullWidth
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
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select value={role} onChange={handleRoleChange}>
                                <MenuItem value="user">Citizen</MenuItem>
                                <MenuItem value="police">Police</MenuItem>
                                <MenuItem value="lawyer">Lawyer</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                            {errors.role && (
                                <FormHelperText>{errors.role}</FormHelperText>
                            )}
                        </FormControl>{" "}
                        <br />
                        <Button
                            fullWidth
                            color="primary"
                            variant="contained"
                            onClick={handleLogin}
                        >
                            Login
                        </Button>{" "}
                        <br /> <br />
                        <span>
                            New user?{" "}
                            <Link
                                href="#"
                                variant="body2"
                                color="primary"
                                to="/register"
                                component={Link}
                                sx={{ textDecoration: "none" }}
                                underline="none"
                            >
                                Register
                            </Link>{" "}
                        </span>{" "}
                        <br />
                    </Box>
                )}
            </Paper>
        </div>
    );
};

export default Login;
