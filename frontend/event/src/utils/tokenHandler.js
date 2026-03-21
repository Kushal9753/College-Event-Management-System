const TOKEN_KEY = 'event_app_token';
const USER_KEY = 'event_app_user';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setUserData = (userData) => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const getUserData = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};
