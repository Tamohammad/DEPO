
import { createContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // بازیابی از localStorage اگر موجود بود
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const signin = (userData, callback) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    callback();
  };

  const signout = (callback) => {
    setUser(null);
    localStorage.removeItem("user");
    callback();
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
