import "./App.css";
import React from "react";
import Login from "./components/login/login";
import UserHome from "./components/user/userHome";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Header from "./components/header/header";
import FileComplaint from "./components/user/fileComplaint";
import ViewComplaints from "./components/user/viewComplaints";
import Register from "./components/admin/register";
import Signup from "./components/user/signup";

function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route exact path="/" element={<Login />} />
                <Route path="home" element={<UserHome />} />
                <Route path="register" element={<Signup />} />
                <Route path="admin/registration" element={<Register />} />
                <Route path="home/file-complaint" element={<FileComplaint />} />
                <Route path="home/view-complaints" element={<ViewComplaints />} />
                <Route path="admin/view-complaints" element={<ViewComplaints />} />
                <Route path="police/view-complaints" element={<ViewComplaints />} />
                <Route path="lawyer/view-complaints" element={<ViewComplaints />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
