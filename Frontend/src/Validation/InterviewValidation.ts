import * as Yup from 'yup';

export const InterviewValidation = Yup.object({
  developerName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Developer name is required'),

  developerEmail: Yup.string()
    .email('Enter a valid email address')
    .required('Developer email is required'),

  position: Yup.string()
    .min(2, 'Position must be at least 2 characters')
    .required('Position is required'),

  experience: Yup.string()
    .required('Experience level is required'),

  interviewDate: Yup.string()
    .required('Interview date is required')
    .test('is-future', 'Interview date must be today or in the future', (value) => {
      if (!value) return false;
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }),

  interviewTime: Yup.string()
    .required('Interview time is required'),
});