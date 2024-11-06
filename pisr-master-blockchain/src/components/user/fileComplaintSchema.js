import * as yup from "yup";

const fileComplaintSchema = yup.object().shape({
    userId: yup.string().required("User ID is required"),
    incidentDate: yup.date().required("Incident date is required"),
    incidentLocation: yup.string().required("Incident location is required"),
    description: yup.string().required("Description is required"),
    reportingPerson: yup.object().shape({
        name: yup.string().required("Reporting person name is required"),
        contactNumber: yup
            .string()
            .matches(/^\d{10}$/, "Mobile number should be 10 digit")
            .required("Contact number is required"),
        address: yup.object().shape({
            street: yup.string().required("Street name is required"),
            city: yup.string().required("City is required"),
            state: yup.string().required("State is required"),
            pincode: yup.string()
            .matches(/^\d{6}$/, "Pincode must be 6 digits")
            .required("Pincode is required"),
        }),
        email: yup
            .string()
            .email("Invalid email")
            .required("Email is required"),
        dob: yup.date().required("Date of birth is required"),
        aadharNumber: yup
            .string()
            .matches(/^\d{12}$/, "Aadhar number must be 12 digits")
            .required("Aadhar number is required"),
    }),
    victimDetails: yup.object().shape({
        name: yup.string().required("Victim name is required"),
        contactNumber: yup
            .string()
            .matches(/^\d{10}$/, "Mobile number should be 10 digit")
            .required("Victim contact number is required"),
        address: yup.object().shape({
            street: yup.string().required("Street name is required"),
            city: yup.string().required("City is required"),
            state: yup.string().required("State is required"),
            pincode: yup.string()
            .matches(/^\d{6}$/, "Pincode must be 6 digits")
            .required("Pincode is required"),
        }),
        email: yup
            .string()
            .email("Invalid email")
            .required("Email is required"),
        dob: yup.date().required("Date of birth is required"),
        aadharNumber: yup.string()
        .matches(/^\d{12}$/, "Aadhar number must be 12 digits")
        .required("Aadhar number is required"),
    }),
});

export default fileComplaintSchema;
