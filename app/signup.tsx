// signup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { register } from "../services/authService";

const SignUpScreen: React.FC = () => {
  const [hoTen, setHoTen] = useState("");
  const [gmail, setGmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-ZÀ-ỹ\s'-]{2,50}$/;
    return nameRegex.test(name);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSignUp = async () => {
    setErrors({});

    // Validate input
    if (!hoTen.trim()) {
      setErrors((prev) => ({ ...prev, hoTen: "Họ tên không được để trống" }));
      return;
    }
    if (!validateName(hoTen)) {
      setErrors((prev) => ({
        ...prev,
        hoTen:
          "Họ tên không hợp lệ (chỉ chứa chữ cái, khoảng trắng, dấu gạch ngang, dấu nháy đơn, độ dài 2-50 ký tự)",
      }));
      return;
    }
    if (!gmail.trim()) {
      setErrors((prev) => ({ ...prev, gmail: "Email không được để trống" }));
      return;
    }
    if (!validateEmail(gmail)) {
      setErrors((prev) => ({ ...prev, gmail: "Email không hợp lệ" }));
      return;
    }
    if (!matKhau.trim()) {
      setErrors((prev) => ({ ...prev, matKhau: "Mật khẩu không được để trống" }));
      return;
    }
    if (!validatePassword(matKhau)) {
      setErrors((prev) => ({
        ...prev,
        matKhau: "Mật khẩu phải có ít nhất 6 ký tự",
      }));
      return;
    }

    setIsLoading(true);

    try {
      const user = await register(hoTen, gmail, matKhau);
      Alert.alert("Thành công", "Đăng ký thành công!");
      router.push("/login");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error instanceof Error ? error.message : "Đăng ký thất bại",
      }));
      console.error("API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="carrot" size={50} color="orange" />
        </View>
        <Text style={styles.title}>Đăng ký</Text>
        <Text style={styles.subtitle}>Nhập thông tin để tiếp tục</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ tên"
            value={hoTen}
            onChangeText={setHoTen}
          />
          {errors.hoTen && <Text style={styles.errorText}>{errors.hoTen}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={gmail}
            onChangeText={setGmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.gmail && <Text style={styles.errorText}>{errors.gmail}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              secureTextEntry={!showPassword}
              value={matKhau}
              onChangeText={setMatKhau}
            />
            <TouchableOpacity
              style={styles.icon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <FontAwesome
                name={showPassword ? "eye-slash" : "eye"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          {errors.matKhau && <Text style={styles.errorText}>{errors.matKhau}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.footerText}>
            Đã có tài khoản? <Text style={styles.loginText}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  subtitle: { textAlign: "center", color: "gray", marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: "gray", marginBottom: 8 },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  inputWrapper: { position: "relative" },
  icon: { position: "absolute", right: 12, top: "50%", transform: [{ translateY: -10 }] },
  button: {
    padding: 16,
    backgroundColor: "#53B175",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: { backgroundColor: "#a0a0a0" },
  buttonText: { color: "white", fontWeight: "600" },
  footerText: { textAlign: "center", marginTop: 20, color: "gray" },
  loginText: { color: "#53B175", fontWeight: "600" },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default SignUpScreen;