import React, { useState } from "react";
import "./register.css";
import instance from "../../helpers/api";
import registrationSchema from "./registrationSchema";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Snackbar from "@mui/material/Snackbar";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
    InputAdornment,
    IconButton,
    LinearProgress,
} from "@mui/material";

const initialValues = {
    email: "",
    username: "",
    password: "",
    role: "",
    address: "",
};

export default function Register() {
    const [role, setRole] = useState("");
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [formData, setFormData] = useState(initialValues);
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const openAlert = () => {
        setIsAlertOpen(true);
    };
    const closeAlert = () => {
        setIsAlertOpen(false);
    };
    const handleRoleChange = (event) => {
        setRole(event.target.value);
        setFormData((prevData) => ({
            ...prevData,
            role: event.target.value,
        }));
    };
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        registrationSchema
            .validate(formData, { abortEarly: false })
            .then(() => {
                setIsLoading(true);
                console.log(formData);
                instance
                    .post("register", formData)
                    .then((response) => {
                        console.log("response", response);
                        const user = response.data;
                        setTimeout(() => {
                            setIsLoading(false);
                            setStatus("success");
                            setErrorMessage(`${role} registration successful.`);
                            openAlert();
                            setFormData(initialValues);
                            setRole("");
                        }, 1000);
                    })
                    .catch((err) => {
                        console.log(err.response);
                        setIsLoading(false);
                        setStatus("error");
                        setErrorMessage(err.response.data.message);
                        openAlert();
                    });
            })
            .catch((validationErrors) => {
                const validationErrorMap = {};
                validationErrors.inner.forEach((error) => {
                    console.log(error.message);
                    validationErrorMap[error.path] = error.message;
                });
                setErrors(validationErrorMap);
            });
    };
    return (
        <>
            <div className='register'>
                <Snackbar
                    open={isAlertOpen}
                    autoHideDuration={2000}
                    onClose={closeAlert}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert variant='filled' severity={status} onClose={closeAlert}>
                        <AlertTitle>{status}!</AlertTitle>
                        {errorMessage}
                    </Alert>
                </Snackbar>
                <Paper className='registerBox' elevation={5}>
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
                            Registering {role}... please wait!
                        </Box>
                    )}
                    {!isLoading && (
                        <Box p={3}>
                            <Typography variant='h5' textAlign={"center"}>
                                Authority Registration
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    type='text'
                                    name='email'
                                    label='Email'
                                    margin='normal'
                                    id='outlined-email'
                                    error={errors.email}
                                    value={formData.email}
                                    onChange={handleChange}
                                    helperText={errors.email}
                                    placeholder='john@example.com'
                                />
                                <TextField
                                    fullWidth
                                    type='text'
                                    margin='normal'
                                    name='username'
                                    label='Username'
                                    id='outlined-name'
                                    onChange={handleChange}
                                    value={formData.username}
                                    error={!!errors.username}
                                    helperText={errors.username}
                                />
                                <TextField
                                    fullWidth
                                    margin='normal'
                                    name='password'
                                    label='Password'
                                    placeholder='********'
                                    id='outlined-password'
                                    onChange={handleChange}
                                    value={formData.password}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    type={showPassword ? "text" : "password"}
                                    InputProps={{
                                        endAdornment: (
                                            <>
                                                <InputAdornment position='end'>
                                                    <IconButton
                                                        edge='end'
                                                        onClick={handleClickShowPassword}
                                                        onMouseDown={handleMouseDownPassword}
                                                        aria-label='toggle password visibility'
                                                    >
                                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            </>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    type='text'
                                    name='address'
                                    margin='normal'
                                    id='outlined-address'
                                    onChange={handleChange}
                                    label='Metamask Address'
                                    value={formData.address}
                                    error={!!errors.address}
                                    helperText={errors.address}
                                    placeholder='Enter valid Metamask address'
                                />
                                <FormControl fullWidth margin='normal'>
                                    <InputLabel>Role</InputLabel>
                                    <Select value={role} onChange={handleRoleChange}>
                                        <MenuItem value='police'>Police</MenuItem>
                                        <MenuItem value='lawyer'>Lawyer</MenuItem>
                                    </Select>
                                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                                </FormControl>
                                <Button type='submit' variant='contained' color='secondary' fullWidth>
                                    Register
                                </Button>
                            </form>
                        </Box>
                    )}
                </Paper>
            </div>
        </>
    );
}
