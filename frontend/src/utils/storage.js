export const getLocal = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (err) {
    return null;
  }
};

export const setLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Local storage set failed", err);
  }
};

export const removeLocal = (key) => {
  localStorage.removeItem(key);
};