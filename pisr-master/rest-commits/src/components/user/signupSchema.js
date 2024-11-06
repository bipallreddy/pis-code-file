import * as yup from "yup";

const signupSchema = yup.object().shape({
    username: yup.string().required("Username is required"),
    email: yup
        .string()
        .email("Invalid email format")
        .required("Email ID is required"),
    password: yup
        .string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
            "Password must contain at least one special character"
        )
        .required("Password is required"),
});

export default signupSchema;
