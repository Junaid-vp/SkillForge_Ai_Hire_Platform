
import * as Yup from "yup";
export const LoginValidation = Yup.object({
Email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
   Password: Yup.string()
       .required('Password is required')
       .min(8, 'Password must be at least 8 characters')
       .matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
       .matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
       .matches(/(?=.*\d)/, 'Password must contain at least one number')
    .required("Enter Correct Password"),
});
