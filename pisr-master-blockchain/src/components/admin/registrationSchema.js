import * as yup from "yup";

const registrationSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    email: yup
        .string()
        .email("Invalid email format")
        .required("Email ID is required"),
        role: yup.string().required("Role is required"),
    password: yup.string().required("Password is required"),
    address: yup.string().required("Metamask Address is required"),
});

export default registrationSchema;
