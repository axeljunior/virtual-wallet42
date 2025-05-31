export const passwordValidation = {
  regex: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
  message:
    'The password must be at least 8 characters long, contain numbers, and both uppercase and lowercase letters',
};
