const mongoose = require("mongoose");

const firSchema = new mongoose.Schema({
    complaintId: {
        type: String
    },
    firNumber: {
        type: String,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
    },
    incidentDate: {
        type: Date,
        required: true,
    },
    incidentLocation: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    reportingPerson: {
        name: {
            type: String,
            required: true,
        },
        contactNumber: String,
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
        },
        email: String,
        dob: Date,
        aadharNumber: String,
    },
    victimDetails: {
        name: {
            type: String,
            required: true,
        },
        contactNumber: String,
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
        },
        email: String,
        dob: Date,
        aadharNumber: String,
    },
    suspects: [
        {
            name: String,
            age: Number,
            gender: String,
        },
    ],
    status: {
        type: String,
        default: "Open",
    },
    lawyerAssigned: {
        type: String,
        type: String,
        default: "",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

firSchema.pre("save", async function (next) {
    if (!this.firNumber) {
        const currentYear = new Date().getFullYear().toString();
        const lastFIR = await this.constructor.findOne(
            { firNumber: new RegExp(`^FIR${currentYear}\\d{3}$`) },
            { firNumber: 1 },
            { sort: { createdAt: -1 } }
        );

        if (lastFIR) {
            const lastNumber = parseInt(lastFIR.firNumber.slice(-3));
            this.firNumber = `FIR${currentYear}${(lastNumber + 1)
                .toString()
                .padStart(3, "0")}`;
        } else {
            this.firNumber = `FIR${currentYear}001`;
        }
    }
    next();
});

module.exports = mongoose.model("Fir", firSchema);
