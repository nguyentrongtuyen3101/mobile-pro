import IP_ADDRESS from "../ipv4";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useUser } from "./contexts/UserContext";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const { setUser } = useUser();

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    setErrors({});

    // Validate input
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email không được để trống" }));
      return;
    }
    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Email không hợp lệ" }));
      return;
    }
    if (!password.trim()) {
      setErrors((prev) => ({ ...prev, password: "Mật khẩu không được để trống" }));
      return;
    }
    if (!validatePassword(password)) {
      setErrors((prev) => ({
        ...prev,
        password: "Mật khẩu phải có ít nhất 6 ký tự",
      }));
      return;
    }

    try {
      const response = await fetch(
        `http://${IP_ADDRESS}:8080/API_for_mobile/api/checkmobile/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gmail: email,
            matKhau: password,
          }),
        }
      );

      // Kiểm tra nếu response không hợp lệ (lỗi mạng hoặc không parse được JSON)
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        setErrors((prev) => ({
          ...prev,
          general: "Lỗi khi phân tích dữ liệu từ server",
        }));
        return;
      }

      if (response.ok) {
        // Thành công (status 200-299)
        setUser({
          id: data.id,
          gmail: data.gmail,
          role: data.role,
          hoten: data.hoten,
          diachi: data.diachi,
          gioitinh: data.gioitinh,
          sinhnhat: data.sinhnhat,
          duongDanAnh: data.duongDanAnh,
        });

        if (data.role === "ADMIN") {
          setErrors((prev) => ({
            ...prev,
            general: "Đăng nhập thành công. Chào mừng ADMIN!",
          }));
          Linking.openURL("http://localhost:5000/index.html");
        } else {
          setErrors((prev) => ({
            ...prev,
            general: `Đăng nhập thành công. Chào mừng ${data.gmail} (Role: ${data.role})`,
          }));
          router.push("/(tabs)"); // Đã sửa ở lần trước, giả định /home là route hợp lệ
        }
      } else {
        // Lỗi HTTP (401, 404, v.v.)
        setErrors((prev) => ({
          ...prev,
          general: data.message || "Đã xảy ra lỗi khi đăng nhập",
        }));
      }
    } catch (error) {
      // Lỗi mạng hoặc lỗi không mong muốn
      setErrors((prev) => ({
        ...prev,
        general: "Không thể kết nối đến server. Vui lòng kiểm tra lại!",
      }));
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.carrot}>
        <FontAwesome5 name="carrot" size={70} color="orange" />
      </View>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Enter your email and password</Text>

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
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputFlex}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      <Link href="/forgot-password" asChild>
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/forgot-password")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      {errors.general && (
        <Text
          style={[
            styles.errorText,
            errors.general.includes("Đăng nhập thành công")
              ? { color: "green" }
              : { color: "red" },
          ]}
        >
          {errors.general}
        </Text>
      )}

      <Text style={styles.signupText}>
        Don’t have an account?{" "}
        <Link href="/signup" asChild>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.signupLink}>Signup</Text>
          </TouchableOpacity>
        </Link>
      </Text>
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
  carrot: { marginBottom: 100 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "gray", marginBottom: 20 },
  inputContainer: { width: "100%", marginBottom: 15 },
  label: { fontSize: 14, color: "gray", marginBottom: 5 },
  input: {
    width: "100%",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    backgroundColor: "#FFF",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "black",
    backgroundColor: "#FFF",
  },
  inputFlex: { flex: 1, padding: 10 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 20 },
  forgotPasswordText: { fontSize: 12, color: "black" },
  loginButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#53B175",
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  signupText: { fontSize: 14, color: "black" },
  signupLink: { color: "#53B175", fontWeight: "bold" },
  errorText: {
    fontSize: 12,
    marginTop: 5,
  },
});