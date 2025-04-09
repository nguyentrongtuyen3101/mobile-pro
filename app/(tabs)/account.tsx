import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '../contexts/UserContext'; // Import useUser từ UserContext

// Define valid FontAwesome 5 Free icon names
type IconName =
    | 'box-open'
    | 'id-card'
    | 'map-marker-alt'
    | 'credit-card'
    | 'ticket-alt'
    | 'bell'
    | 'question-circle'
    | 'info-circle'
    | 'store'
    | 'search'
    | 'shopping-cart'
    | 'heart'
    | 'user'
    | 'pencil-alt'
    | 'angle-right'
    | 'sign-out-alt'
    | 'signal'
    | 'wifi'
    | 'battery-full'
    | 'envelope'
    | 'phone'
    | 'home'
    | 'birthday-cake'
    | 'venus-mars'
    | 'shopping-bag'
    | 'wallet';

// Định nghĩa kiểu cho thông tin cá nhân của khách hàng (đồng bộ với User trong UserContext)
interface CustomerInfo {
    name: string;
    email: string;
    address: string;
    dateOfBirth: string;
    gender: string;
}

const ProfileScreen: React.FC = () => {
    const router = useRouter();
    const { user, setUser } = useUser(); // Lấy thông tin user từ UserContext

    // Chuyển đổi gioitinh (boolean) thành gender (string)
    const convertGender = (gioitinh: boolean | undefined): string => {
        if (gioitinh === undefined) return 'Other';
        return gioitinh ? 'Male' : 'Female';
    };

    // Khởi tạo customerInfo từ user
    const initialCustomerInfo: CustomerInfo = user
        ? {
              name: user.hoten || 'Unknown',
              email: user.gmail || 'Unknown',
              address: user.diachi || 'Unknown',
              dateOfBirth: user.sinhnhat || 'Unknown',
              gender: convertGender(user.gioitinh),
          }
        : {
              name: 'Unknown',
              email: 'Unknown',
              address: 'Unknown',
              dateOfBirth: 'Unknown',
              gender: 'Other',
          };

    // State để quản lý thông tin cá nhân
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(initialCustomerInfo);

    // State để quản lý chế độ chỉnh sửa
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // State để lưu thông tin tạm thời khi chỉnh sửa
    const [tempInfo, setTempInfo] = useState<CustomerInfo>({ ...customerInfo });

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        setUser(null); // Xóa thông tin user khỏi context
        router.replace('/login');
    };

    // Hàm xử lý khi nhấn nút "Edit" hoặc "Save"
    const handleEditToggle = () => {
        if (isEditing) {
            setCustomerInfo({ ...tempInfo });
            // Cập nhật lại user trong UserContext nếu cần
            if (user) {
                setUser({
                    ...user,
                    hoten: tempInfo.name,
                    gmail: tempInfo.email,
                    diachi: tempInfo.address,
                    sinhnhat: tempInfo.dateOfBirth,
                    gioitinh: tempInfo.gender === 'Male' ? true : tempInfo.gender === 'Female' ? false : undefined,
                });
            }
        } else {
            // Khi bắt đầu chỉnh sửa, cập nhật tempInfo từ customerInfo
            setTempInfo({ ...customerInfo });
        }
        setIsEditing(!isEditing);
    };

    // Hàm xử lý thay đổi giá trị của các trường thông tin
    const handleInputChange = (field: keyof CustomerInfo, value: string) => {
        setTempInfo((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <View style={styles.container}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/64' }}
                    style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                    {isEditing ? (
                        <TextInput
                            style={styles.profileNameInput}
                            value={tempInfo.name}
                            onChangeText={(text) => handleInputChange('name', text)}
                        />
                    ) : (
                        <Text style={styles.profileName}>{customerInfo.name}</Text>
                    )}
                    <Text style={styles.profileEmail}>{customerInfo.email}</Text>
                </View>
            </View>

            {/* Personal Information */}
            <ScrollView style={styles.infoContainer}>
                <View style={styles.infoItem}>
                    <View style={styles.infoRow}>
                        <FontAwesome5 name="envelope" size={20} color="gray" />
                        <Text style={styles.infoLabel}>Email</Text>
                    </View>
                    {isEditing ? (
                        <TextInput
                            style={styles.infoInput}
                            value={tempInfo.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            keyboardType="email-address"
                        />
                    ) : (
                        <Text style={styles.infoText}>{customerInfo.email}</Text>
                    )}
                </View>

                <View style={styles.infoItem}>
                    <View style={styles.infoRow}>
                        <FontAwesome5 name="home" size={20} color="gray" />
                        <Text style={styles.infoLabel}>Address</Text>
                    </View>
                    {isEditing ? (
                        <TextInput
                            style={styles.infoInput}
                            value={tempInfo.address}
                            onChangeText={(text) => handleInputChange('address', text)}
                        />
                    ) : (
                        <Text style={styles.infoText}>{customerInfo.address}</Text>
                    )}
                </View>

                <View style={styles.infoItem}>
                    <View style={styles.infoRow}>
                        <FontAwesome5 name="birthday-cake" size={20} color="gray" />
                        <Text style={styles.infoLabel}>Date of Birth</Text>
                    </View>
                    {isEditing ? (
                        <TextInput
                            style={styles.infoInput}
                            value={tempInfo.dateOfBirth}
                            onChangeText={(text) => handleInputChange('dateOfBirth', text)}
                            placeholder="YYYY-MM-DD"
                        />
                    ) : (
                        <Text style={styles.infoText}>{customerInfo.dateOfBirth}</Text>
                    )}
                </View>

                <View style={styles.infoItem}>
                    <View style={styles.infoRow}>
                        <FontAwesome5 name="venus-mars" size={20} color="gray" />
                        <Text style={styles.infoLabel}>Gender</Text>
                    </View>
                    {isEditing ? (
                        <Picker
                            selectedValue={tempInfo.gender}
                            onValueChange={(value) => handleInputChange('gender', value)}
                            style={styles.picker}
                            itemStyle={styles.pickerItem}
                        >
                            <Picker.Item label="Male" value="Male" />
                            <Picker.Item label="Female" value="Female" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                    ) : (
                        <Text style={styles.infoText}>{customerInfo.gender}</Text>
                    )}
                </View>
            </ScrollView>

            {/* Edit/Save Button */}
            <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
                <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>

            {/* Log Out Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <FontAwesome5 name="sign-out-alt" size={20} color="green" />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    profileInfo: {
        marginLeft: 16,
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileNameInput: {
        fontSize: 20,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 4,
        color: '#333',
    },
    profileEmail: {
        color: 'gray',
        marginTop: 4,
    },
    infoContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    infoItem: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    infoText: {
        fontSize: 16,
        color: 'gray',
        marginLeft: 28,
        paddingVertical: 6,
    },
    infoInput: {
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 4,
        marginLeft: 28,
        color: '#333',
    },
    picker: {
        marginLeft: 28,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginRight: -8,
    },
    pickerItem: {
        fontSize: 16,
    },
    editButton: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 10,
        marginTop: 10,
    },
    editButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    logoutText: {
        marginLeft: 10,
        color: 'green',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;