import React, { createContext, useContext, useState, ReactNode } from "react";

// Định nghĩa kiểu cho thông tin người dùng
interface User {
  id: string;
  gmail: string;
  role: string;
  hoten:string;
  diachi:string;
  gioitinh:boolean| undefined;
  sinhnhat:string;
}

// Định nghĩa kiểu cho context
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Tạo context với giá trị mặc định là undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// Tạo provider để bọc ứng dụng
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook để sử dụng context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};