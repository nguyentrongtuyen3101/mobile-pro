import IP_ADDRESS from '../ipv4';
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SignUpScreen: React.FC = () => {
  const [hoTen, setHoTen] = useState('');
  const [gmail, setGmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    // Validate input
    if (!hoTen || !gmail || !matKhau) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(gmail)) {
      Alert.alert('Lỗi', 'Email không hợp lệ!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://${IP_ADDRESS}:8080/API_for_mobile/api/checkmobile/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hoTen,
          gmail,
          matKhau,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Thành công', data.message || 'Đăng ký thành công!');
        router.push('/login');
      } else {
        Alert.alert('Lỗi', typeof data === 'string' ? data : 'Đăng ký thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối đến server');
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <FontAwesome5 name="carrot" size={50} color="orange" />
        </View>

        {/* Form */}
        <Text style={styles.title}>Đăng ký</Text>
        <Text style={styles.subtitle}>Nhập thông tin để tiếp tục</Text>

        {/* Họ tên */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ tên"
            value={hoTen}
            onChangeText={setHoTen}
          />
        </View>

        {/* Email */}
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
        </View>

        {/* Mật khẩu */}
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
        </View>

        {/* Button */}
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

        {/* Login link */}
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.footerText}>
            Đã có tài khoản? <Text style={styles.loginText}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: 'gray', marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: 'gray', marginBottom: 8 },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputWrapper: { position: 'relative' },
  icon: { position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -10 }] },
  button: {
    padding: 16,
    backgroundColor: '#53B175',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { backgroundColor: '#a0a0a0' },
  buttonText: { color: 'white', fontWeight: '600' },
  footerText: { textAlign: 'center', marginTop: 20, color: 'gray' },
  loginText: { color: '#53B175', fontWeight: '600' },
});

export default SignUpScreen;