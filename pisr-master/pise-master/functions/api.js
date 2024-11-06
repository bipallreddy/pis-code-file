const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const user = require("./user");
const FIR = require("./fir");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');


const app = express();

const url =
    "mongodb+srv://root:root@pis.ddbusv3.mongodb.net/";

mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB: police-info-system");
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB", error);
    });

const router = express.Router();
app.use(cors());
app.use(express.json());

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Function to send OTP to an email address//demoproject488@gmail.com
async function sendOTPEmail(email, otp) {
    // Use nodemailer to send an email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "bindubhargavi342@gmail.com",
            pass: "sxcrcxwfhesobcpd",
        },
    });

    const mailOptions = {
        from: "bindubhargavi342@gmail.com",
        to: email,
        subject: "Your OTP for User Registration",
        text: `Your OTP is: ${otp}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

router.get("/hello", (req, res) => {
    res.json({
        hello: "hi! welcome to police information system",
    });
});

router.post("/register", async (req, res) => {
    try {
        const { email, username, password, role, address } = req.body;

        console.log(req.body);
        let euser = await user.findOne({ email: email });
        if (euser != null) {
            res.status(400).json({
                message: `${euser.role} already exists with email:${email}`
            });
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const saveduser = new user({
                email,
                username,
                password: hashedPassword,
                role,
                address,
            });
            console.log("saved user: " + saveduser);
            await saveduser.save();
            res.json(saveduser);
        }
    } catch (err) {
        res.send(err);
    }
});

router.get("/get-otp/:email", async (req, res) => {
    let userEmail = req.params.email;
    if (!userEmail) {
        return res.status(400).json({ error: "Email is required" });
    }
    let euser = await user.findOne({ email: userEmail });
    if (euser != null) {
        res.status(400).json({
            message: `${userEmail} already taken`,
        });
    } else {
        const generatedOTP = generateOTP();
        console.log("Generated OTP:", generatedOTP);

        // Send the OTP to the provided email
        sendOTPEmail(userEmail, generatedOTP);

        res.json({
            success: true,
            message: "OTP sent successfully",
            otp: generatedOTP,
        });
    }
});

router.post("/login", async (req, res) => {
    let resp = {};
    const { email, password, role } = req.body;
    console.log({ email, password, role });
    let dbuser = await user.findOne({ email: email });

    if (dbuser != null) {
        let dbpass = dbuser.password;
        const passwordMatch = await bcrypt.compare(password, dbpass);
        if (passwordMatch) {
            if (role == dbuser.role) {
                resp.message = `${role} logged in with email: ${email}`;
                resp.role = role;
                resp.id = dbuser._id;
                resp.username = dbuser.username;                
                res.status(200).json(resp);
            } else {
                resp.message = `${role} not found with email: ${email}`;
                res.status(403).json(resp);
            }
        } else {
            resp.message = `Incorrect password for user with email: ${email}`;
            res.status(401).json(resp);
        }
    } else {
        resp.message = `${role} not found with email: ${email}`;
        res.status(404).json(resp);
    }
});

router.get("/all-users", async (req, res) => {
    try {
        const users = await user.find();
        res.json(users);
    } catch (err) {
        res.send(err);
    }
});

router.get("/lawyers", async (req, res) => {
    try {
        const users = await user.find({ role: "lawyer" });
        res.json(users);
    } catch (err) {
        res.send(err);
    }
});

router.get("/user/:id", async (req, res) => {
    const { id } = req.params;
    const dbuser = await user.findById(id);
    res.json(dbuser);
});

// ====================fir=========================

router.get("/firs", async (req, res) => {
    try {
        const reports = await FIR.find();
        res.json(reports);
    } catch (err) {
        res.send(err);
    }
});

router.post("/file-fir", async (req, res) => {
    try {
        console.log(req.body);
        const report = new FIR(req.body);
        report.status = "Open";
        await report.save();
        console.log(report);
        res.json(report);
    } catch (err) {
        res.send(err);
    }
});

router.put("/update-fir", async (req, res) => {
    try {
        const incident = req.body;
        const updatedIncident = await FIR.findOneAndUpdate(
            { _id: incident._id },
            { $set: incident },
            { new: true }
        );
        res.json(updatedIncident);
    } catch (err) {
        res.send(err);
    }
});

router.get("/firsByUserId/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const reports = await FIR.find({ userId: id });
        res.json(reports);
    } catch (err) {
        res.send(err);
    }
});


router.get("/firById/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const reports = await FIR.findOne({ _id: id });
        res.json(reports);
    } catch (err) {
        res.send(err);
    }
});

router.delete("/firById/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const report = await FIR.findByIdAndDelete(id);
        res.json({ message: "FIR Deleted Successfully", data: report });
    } catch (err) {
        res.send(err);
    }
});

app.use(`/`, router);
module.exports = app;
module.exports.handler = serverless(app);
