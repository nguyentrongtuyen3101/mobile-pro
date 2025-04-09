import IP_ADDRESS from "../ipv4";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useUser } from "./contexts/UserContext"; // Import useUser từ UserContext

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUser } = useUser(); // Sử dụng hook để set user

  const handleLogin = async () => {
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

      const data = await response.json();

      if (response.ok) {
        // Lưu thông tin người dùng vào context
        setUser({
          id: data.id,
          gmail: data.gmail,
          role: data.role,
          hoten:data.hoten,
          diachi:data.diachi,
          gioitinh:data.gioitinh,
          sinhnhat:data.sinhnhat,
        });

        // Đăng nhập thành công
        if (data.role === "ADMIN") {
          Alert.alert("Đăng nhập thành công", "Chào mừng ADMIN!");
          Linking.openURL("http://localhost:5000/index.html");
        } else {
          Alert.alert(
            "Đăng nhập thành công",
            `Chào mừng ${data.gmail} (Role: ${data.role})`
          );
          router.push("/(tabs)");
        }
      } else {
        Alert.alert("Lỗi đăng nhập", data || "Sai email hoặc mật khẩu");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối đến server. Vui lòng kiểm tra lại!");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.carrot}>
        <FontAwesome5 name="carrot" size={70} color="orange" />
      </View>

      {/* Title */}
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Enter your email and password</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      {/* Password Input */}
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
      </View>

      {/* Forgot Password */}
      <Link href="/forgot-password" asChild>
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/forgot-password")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </Link>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      {/* Signup */}
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
});