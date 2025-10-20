import { axiosInstance } from "../axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (inputs) => {
    const res = await axiosInstance.post("auth/login", inputs);

    setCurrentUser(res.data)
  };

  const logout = async () => {
    await axiosInstance.post("auth/logout", {});
    setCurrentUser(null);
  };

  // Remove localStorage persistence so user must log in every session

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
