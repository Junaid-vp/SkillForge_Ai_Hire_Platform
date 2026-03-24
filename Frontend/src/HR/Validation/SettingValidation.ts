import * as Yup from 'yup';


export const SettingsValidation = Yup.object({
  name:  Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  companyName:  Yup.string()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  
  designation:  Yup.string()
    .required('Designation is required')
    .min(2, 'Designation must be at least 2 characters')
    .max(50, 'Designation must be less than 50 characters'),
  companyWebsite:  Yup.string()
    .url('Please enter a valid URL (include https://)')
    .required('Company website is required')
    .matches(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
      'Please enter a valid website URL'
    ),
});
