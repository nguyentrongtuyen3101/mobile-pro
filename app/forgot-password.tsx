// forgot-password.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { sendOtp, resetPassword } from "../services/authService";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generatedOtp, setGeneratedOtp] = useState<string>(""); // Lưu OTP từ backend
  const router = useRouter();

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateConfirmPassword = (password: string, confirm: string) => {
    return password === confirm && confirm.length > 0;
  };

  const validateOtp = (otp: string) => {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  };

  // Handle Send OTP
  const handleSendOtp = async () => {
    setErrors({});

    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
      return;
    }

    try {
      const otpFromServer = await sendOtp(email);
      setGeneratedOtp(otpFromServer);
      alert("OTP đã được gửi đến email của bạn!");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: error instanceof Error ? error.message : "Đã xảy ra lỗi khi gửi OTP",
      }));
    }
  };

  // Handle Confirm
  const handleConfirm = async () => {
    setErrors({});

    if (!validateOtp(otp)) {
      setErrors((prev) => ({ ...prev, otp: "OTP must be 6 digits" }));
      return;
    }

    if (otp !== generatedOtp) {
      setErrors((prev) => ({ ...prev, otp: "OTP không khớp, vui lòng nhập lại" }));
      return;
    }

    if (!validatePassword(newPassword)) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Password must be at least 6 characters",
      }));
      return;
    }

    if (!validateConfirmPassword(newPassword, confirmPassword)) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    try {
      await resetPassword(email, newPassword, otp);
      alert("Mật khẩu đã được cập nhật thành công!");
      router.push("/login");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error instanceof Error ? error.message : "Cập nhật mật khẩu thất bại",
      }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.carrot}>
        <FontAwesome5 name="carrot" size={70} color="orange" />
      </View>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Reset your password in a few steps</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity style={styles.sendOtpButton} onPress={handleSendOtp}>
        <Text style={styles.sendOtpButtonText}>Send OTP</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP received"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
        />
        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>

      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.backToLoginText}>
          Back to <Text style={styles.loginLink}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  carrot: {
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "gray",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    backgroundColor: "#FFF",
  },
  sendOtpButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#FFA500",
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  sendOtpButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#53B175",
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  backToLoginText: {
    fontSize: 14,
    color: "black",
  },
  loginLink: {
    color: "#53B175",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});