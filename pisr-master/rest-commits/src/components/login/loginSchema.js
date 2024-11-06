import * as yup from "yup";

const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email("Invalid email format")
        .required("Email ID is required"),
    role: yup.string().required("Role is required"),
    password: yup.string().required("Password is required"),
});

export default loginSchema;
