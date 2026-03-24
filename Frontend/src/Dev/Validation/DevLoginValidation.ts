import * as Yup from "yup";

export const DevLoginValidation = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),

  uniqueCode: Yup.string()
    .required("Unique code is required")
    .matches(
      /^DEV\.[A-Z0-9.]+SKILLFORGE$/,
      "Invalid unique code format"
    )
    .min(20, "Code too short")
    .max(35, "Code too long"),
});