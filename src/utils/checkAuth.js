// src/utils/checkAuth.js
import apiRequest from '../lib/apiRequest';

export const checkTokenValidity = async () => {
  try {
    // Make a request to the backend to verify the token
    const response = await apiRequest.get(`/jwt/verify`, {
      withCredentials: true,
    });

    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    // Token is either absent or expired
    return false;
  }
};
