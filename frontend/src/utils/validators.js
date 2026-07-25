export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validatePhone = (phone) => {
  const re = /^\+?[1-9]\d{1,14}$/; // Generic international phone regex
  return !phone || re.test(String(phone));
};