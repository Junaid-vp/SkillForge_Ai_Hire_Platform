import * as Yup from 'yup';

export const TaskValidation = Yup.object({
  title:        Yup.string().min(3, 'Too short').required('Title is required'),
  description:  Yup.string().min(10, 'Too short').required('Description is required'),
  requirements: Yup.string().required('Requirements are required'),
  category:     Yup.string().required('Category is required'),
  techStack:    Yup.string().required('Tech stack is required'),
  difficulty:   Yup.string().required('Difficulty is required'),
  duration:     Yup.number()
    .typeError('Duration must be a number')
    .integer('Must be a whole number')
    .min(1, 'Must be at least 1')
    .required('Duration is required'),
});