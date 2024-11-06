import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Stack from "@mui/material/Stack";
import {
    AppBar,
    Box,
    Button,
    IconButton,
    ListItemIcon,
    Toolbar,
    Typography,
} from "@mui/material";
import ReportIcon from "@mui/icons-material/Report";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LogoutIcon from "@mui/icons-material/Logout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import "./header.css";
import { useNavigate } from "react-router-dom";
import HowToRegIcon from "@mui/icons-material/HowToReg";
const Header = () => {

    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [role, setRole] = useState("");
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        let id = Cookies.get("id");
        let role = Cookies.get("role");
        setId(id);
        setRole(role);
    }, []);

    const handleHome = () => {
        navigate("/home");
    };
    const handleLogout = () => {
        Cookies.remove("role");
        Cookies.remove("id");
        window.location.href = "/";
    };

    const handleComplaint = () => {
        navigate("/home/file-complaint");
    };

    const handleRegister = () => {
        navigate("/admin/registration");
    };

    const handleViewComplaints = () => {
        if (role === "user") navigate("/home/view-complaints");
        else if (role === "police") navigate("/police/view-complaints");
        else if (role === "admin") navigate("/admin/view-complaints");
        else if (role === "lawyer") navigate("/lawyer/view-complaints");
    };

    return (
        role && (
            <div style={{ marginBottom: "50px" }}>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar
                        position="fixed"
                        color={
                            role === "user"
                                ? "primary"
                                : role == "police"
                                    ? "info"
                                    : "secondary"
                        }
                    >
                        <Toolbar>
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{ flexGrow: 1 }}
                            >
                                <IconButton
                                    variant="contained"
                                    onClick={handleHome}
                                >
                                    <HomeIcon />
                                </IconButton>
                                Police Information System{" (" + role + ")"}
                            </Typography>
                            {id && role && (
                                <>
                                    <Stack
                                        spacing={2}
                                        direction="row"
                                        className="stackmenu"
                                    >
                                        {role === "admin" && (
                                            <Button
                                                variant="contained"
                                                onClick={handleRegister}
                                                startIcon={<HowToRegIcon />}
                                                color="secondary"
                                            >
                                                Register
                                            </Button>
                                        )}
                                        {role === "user" && (
                                            <Button
                                                variant="contained"
                                                onClick={handleComplaint}
                                                startIcon={<ReportIcon />}
                                                color="primary"
                                            >
                                                File Complaint
                                            </Button>
                                        )}

                                        <Button
                                            onClick={handleViewComplaints}
                                            variant="contained"
                                            startIcon={<VisibilityIcon />}
                                            color={
                                                role === "user"
                                                    ? "primary"
                                                    : role == "police"
                                                        ? "info"
                                                        : "secondary"
                                            }
                                        >
                                            View Complaints
                                        </Button>

                                        <Button
                                            variant="contained"
                                            onClick={handleLogout}
                                            startIcon={<LogoutIcon />}
                                            color={
                                                role === "user"
                                                    ? "primary"
                                                    : role == "police"
                                                        ? "info"
                                                        : "secondary"
                                            }
                                        >
                                            Logout
                                        </Button>
                                    </Stack>
                                    <IconButton
                                        className="hamburger"
                                        variant="contained"
                                        id="basic-button"
                                        aria-controls={
                                            open ? "basic-menu" : undefined
                                        }
                                        aria-haspopup="true"
                                        aria-expanded={
                                            open ? "true" : undefined
                                        }
                                        onClick={handleClick}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <Menu
                                        open={open}
                                        id="basic-menu"
                                        anchorEl={anchorEl}
                                        onClose={handleClose}
                                        MenuListProps={{
                                            "aria-labelledby": "basic-button",
                                        }}
                                    >
                                        {role === "admin" && (
                                            <MenuItem onClick={handleRegister}>
                                                <ListItemIcon>
                                                    <HowToRegIcon fontSize="small" />
                                                </ListItemIcon>
                                                Register
                                            </MenuItem>
                                        )}
                                        {role === "user" && (
                                            <MenuItem onClick={handleComplaint}>
                                                <ListItemIcon>
                                                    <ReportIcon fontSize="small" />
                                                </ListItemIcon>
                                                File Complaint
                                            </MenuItem>
                                        )}
                                        <MenuItem
                                            onClick={handleViewComplaints}
                                        >
                                            <ListItemIcon>
                                                <ReportIcon fontSize="small" />
                                            </ListItemIcon>
                                            View Complaints
                                        </MenuItem>

                                        <MenuItem onClick={handleLogout}>
                                            <ListItemIcon>
                                                <LogoutIcon fontSize="small" />
                                            </ListItemIcon>
                                            Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}
                        </Toolbar>
                    </AppBar>
                </Box>
            </div>
        )
    );
};

export default Header;
