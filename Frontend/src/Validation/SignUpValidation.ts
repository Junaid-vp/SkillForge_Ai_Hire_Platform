import * as Yup from 'yup';

export const SignUPValidation = Yup.object().shape({
  Name: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  Email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),
  
  CompanyName: Yup.string()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  
  Designation: Yup.string()
    .required('Designation is required')
    .min(2, 'Designation must be at least 2 characters')
    .max(50, 'Designation must be less than 50 characters'),
  
  CompanyWebsite: Yup.string()
    .url('Please enter a valid URL (include https://)')
    .required('Company website is required')
    .matches(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
      'Please enter a valid website URL'
    ),

  Password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .matches(/(?=.*\d)/, 'Password must contain at least one number')
});