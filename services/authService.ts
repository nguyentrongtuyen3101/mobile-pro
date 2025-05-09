// services/authService.ts
import IP_ADDRESS from "../ipv4";

export interface User {
  id: string;
  gmail: string;
  role: string;
  hoten: string;
  diachi: string;
  gioitinh: boolean | undefined;
  sinhnhat: string;
  duongDanAnh: string | undefined;
  token?: string;
}

const BASE_URL = `http://${IP_ADDRESS}:8080/API_for_mobile/api/checkmobile`;

// Đăng nhập
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gmail: email,
        matKhau: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đã xảy ra lỗi khi đăng nhập");
    }

    return {
      id: data.id,
      gmail: data.gmail,
      role: data.role,
      hoten: data.hoten,
      diachi: data.diachi,
      gioitinh: data.gioitinh,
      sinhnhat: data.sinhnhat,
      duongDanAnh: data.duongDanAnh,
      token: data.token,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Không thể kết nối đến server");
  }
};

// Đăng ký
export const register = async (hoTen: string, gmail: string, matKhau: string): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hoTen,
        gmail,
        matKhau,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đã xảy ra lỗi khi đăng ký");
    }

    return {
      id: data.id,
      gmail: data.gmail,
      role: data.role,
      hoten: data.hoten,
      diachi: data.diachi,
      gioitinh: data.gioitinh,
      sinhnhat: data.sinhnhat,
      duongDanAnh: data.duongDanAnh,
      token: data.token,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Không thể kết nối đến server");
  }
};

// Gửi OTP
export const sendOtp = async (email: string): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gmail: email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(data.message || "Email không tồn tại");
      }
      throw new Error(data.message || "Đã xảy ra lỗi khi gửi OTP");
    }

    return data.otp; // Giả sử backend trả về OTP trong response
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Không thể kết nối đến server");
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (email: string, newPassword: string, otp: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/quenmk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gmail: email,
        matKhau: newPassword,
        otp, // Gửi OTP để xác thực
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Cập nhật mật khẩu thất bại");
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Không thể kết nối đến server");
  }
};