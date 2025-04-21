import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '../contexts/UserContext';
import IP_ADDRESS from "../../ipv4";
import { launchImageLibrary, type ImageLibraryOptions, type ImagePickerResponse, type Asset } from 'react-native-image-picker';
import RNFetchBlob from 'react-native-blob-util';

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

interface CustomerInfo {
    name: string;
    email: string;
    address: string;
    dateOfBirth: string;
    gender: string;
    profilePicture?: string;
}

const ProfileScreen: React.FC = () => {
    const router = useRouter();
    const { user, setUser } = useUser();

    const convertGender = (gioitinh: boolean | undefined): string => {
        if (gioitinh === undefined) return 'Other';
        return gioitinh ? 'Male' : 'Female';
    };

    const initialCustomerInfo: CustomerInfo = user
        ? {
              name: user.hoten || 'Unknown',
              email: user.gmail || 'Unknown',
              address: user.diachi || 'Unknown',
              dateOfBirth: user.sinhnhat || 'Unknown',
              gender: convertGender(user.gioitinh),
              profilePicture: user.duongDanAnh || 'https://via.placeholder.com/64',
          }
        : {
              name: 'Unknown',
              email: 'Unknown',
              address: 'Unknown',
              dateOfBirth: 'Unknown',
              gender: 'Other',
              profilePicture: 'https://via.placeholder.com/64',
          };

    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(initialCustomerInfo);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [tempInfo, setTempInfo] = useState<CustomerInfo>({ ...customerInfo });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Validation functions
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateName = (name: string) => {
        const nameRegex = /^[a-zA-ZÀ-ỹ\s'-]{2,50}$/;
        return nameRegex.test(name);
    };

    const validateAddress = (address: string) => {
        const addressRegex = /^.{5,100}$/;
        return addressRegex.test(address);
    };

    const validateDateOfBirth = (date: string) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return dateRegex.test(date);
    };

    const handleLogout = () => {
        setUser(null);
        router.replace('/login');
    };

    const handleUploadProfilePicture = async () => {
        setErrors({});
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            maxWidth: 300,
            maxHeight: 300,
            quality: 1,
        };

        launchImageLibrary(options, async (response: ImagePickerResponse) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                setErrors((prev) => ({
                    ...prev,
                    general: `Không thể chọn ảnh: ${response.errorMessage}`,
                }));
            } else if (response.assets && response.assets.length > 0) {
                const asset: Asset = response.assets[0];
                const uri = asset.uri;
                if (!uri) {
                    setErrors((prev) => ({
                        ...prev,
                        general: 'Không thể lấy URI của ảnh',
                    }));
                    return;
                }

                try {
                    const formData = new FormData();
                    formData.append('gmail', tempInfo.email);

                    const file = {
                        name: asset.fileName || 'profile.jpg',
                        type: asset.type || 'image/jpeg',
                        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                    };
                    formData.append('file', file as any);

                    console.log('Sending FormData:', {
                        gmail: tempInfo.email,
                        file: {
                            name: file.name,
                            type: file.type,
                            uri: file.uri,
                        },
                    });

                    const uploadResponse = await fetch(`http://${IP_ADDRESS}:9090/API_for_mobile/api/checkmobile/uploadprofilepic`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json',
                        },
                    });

                    const data = await uploadResponse.json();
                    console.log('Upload response:', data);

                    if (uploadResponse.ok) {
                        const imageUrl = data.duongDanAnh ? `http://${IP_ADDRESS}:9090${data.duongDanAnh}` : 'https://via.placeholder.com/64';
                        setTempInfo((prev) => ({ ...prev, profilePicture: imageUrl }));
                        setCustomerInfo((prev) => ({ ...prev, profilePicture: imageUrl }));
                        if (user) {
                            setUser({
                                ...user,
                                duongDanAnh: data.duongDanAnh,
                            });
                        }
                        Alert.alert('Thành công', data.message || 'Cập nhật ảnh đại diện thành công');
                    } else {
                        setErrors((prev) => ({
                            ...prev,
                            general: data.message || 'Không thể upload ảnh',
                        }));
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    setErrors((prev) => ({
                        ...prev,
                        general: `Đã xảy ra lỗi khi upload ảnh: ${(error as any).message}`,
                    }));
                }
            }
        });
    };

    const updateAccount = async () => {
        setErrors({});

        // Validate input
        if (!tempInfo.email.trim()) {
            setErrors((prev) => ({ ...prev, email: "Email không được để trống" }));
            return;
        }
        if (!validateEmail(tempInfo.email)) {
            setErrors((prev) => ({ ...prev, email: "Email không hợp lệ" }));
            return;
        }
        if (!tempInfo.name.trim()) {
            setErrors((prev) => ({ ...prev, name: "Họ tên không được để trống" }));
            return;
        }
        if (!validateName(tempInfo.name)) {
            setErrors((prev) => ({
                ...prev,
                name: "Họ tên không hợp lệ (chỉ chứa chữ cái, khoảng trắng, dấu gạch ngang, dấu nháy đơn, độ dài 2-50 ký tự)",
            }));
            return;
        }
        if (tempInfo.address && !validateAddress(tempInfo.address)) {
            setErrors((prev) => ({
                ...prev,
                address: "Địa chỉ phải có độ dài từ 5 đến 100 ký tự",
            }));
            return;
        }
        if (tempInfo.dateOfBirth && !validateDateOfBirth(tempInfo.dateOfBirth)) {
            setErrors((prev) => ({
                ...prev,
                dateOfBirth: "Ngày sinh phải có định dạng YYYY-MM-DD",
            }));
            return;
        }

        const payload = {
            gmail: tempInfo.email,
            hoten: tempInfo.name,
            diachi: tempInfo.address,
            sinhnhat: tempInfo.dateOfBirth,
            sex: tempInfo.gender === 'Male' ? true : tempInfo.gender === 'Female' ? false : undefined,
            duongDanAnh: tempInfo.profilePicture?.replace(`http://${IP_ADDRESS}:8080`, '') || undefined,
        };
        console.log('Sending API request with payload:', JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(`http://${IP_ADDRESS}:8080/API_for_mobile/api/checkmobile/updateaccount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('API response:', data);

            if (response.ok) {
                setCustomerInfo({ ...tempInfo });
                if (user) {
                    setUser({
                        ...user,
                        hoten: tempInfo.name,
                        gmail: tempInfo.email,
                        diachi: tempInfo.address,
                        sinhnhat: tempInfo.dateOfBirth,
                        gioitinh: tempInfo.gender === 'Male' ? true : tempInfo.gender === 'Female' ? false : undefined,
                        duongDanAnh: tempInfo.profilePicture?.replace(`http://${IP_ADDRESS}:8080`, '') || undefined,
                    });
                }
                Alert.alert('Thành công', data.message || 'Cập nhật thông tin tài khoản thành công');
            } else {
                setErrors((prev) => ({
                    ...prev,
                    general: data.message || 'Không thể cập nhật thông tin tài khoản',
                }));
            }
        } catch (error) {
            console.error('API error:', error);
            setErrors((prev) => ({
                ...prev,
                general: `Đã xảy ra lỗi khi gọi API: ${(error as any).message}`,
            }));
        }
    };

    const handleEditToggle = async () => {
        console.log('handleEditToggle called, isEditing:', isEditing);
        if (isEditing) {
            await updateAccount();
        } else {
            setTempInfo({ ...customerInfo });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (field: keyof CustomerInfo, value: string) => {
        console.log(`Updating ${field}: ${value}`);
        setTempInfo((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileSection}>
                <TouchableOpacity
                    onPress={isEditing ? handleUploadProfilePicture : undefined}
                    style={styles.profileImageContainer}
                    disabled={!isEditing}
                >
                    <Image
                        source={{ uri: tempInfo.profilePicture || 'https://via.placeholder.com/64' }}
                        style={styles.profileImage}
                    />
                    {isEditing && (
                        <View style={styles.uploadIconOverlay}>
                            <FontAwesome5 name="camera" size={16} color="white" />
                        </View>
                    )}
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                    {isEditing ? (
                        <View>
                            <TextInput
                                style={styles.profileNameInput}
                                value={tempInfo.name}
                                onChangeText={(text) => handleInputChange('name', text)}
                            />
                            {errors.name && (
                                <Text style={styles.errorText}>{errors.name}</Text>
                            )}
                        </View>
                    ) : (
                        <Text style={styles.profileName}>{customerInfo.name}</Text>
                    )}
                    <Text style={styles.profileEmail}>{customerInfo.email}</Text>
                </View>
            </View>

            <ScrollView style={styles.infoContainer}>
                <View style={styles.infoItem}>
                    <View style={styles.infoRow}>
                        <FontAwesome5 name="envelope" size={20} color="gray" />
                        <Text style={styles.infoLabel}>Email</Text>
                    </View>
                    {isEditing ? (
                        <View>
                            <TextInput
                                style={styles.infoInput}
                                value={tempInfo.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                            />
                            {errors.email && (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            )}
                        </View>
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
                        <View>
                            <TextInput
                                style={styles.infoInput}
                                value={tempInfo.address}
                                onChangeText={(text) => handleInputChange('address', text)}
                            />
                            {errors.address && (
                                <Text style={styles.errorText}>{errors.address}</Text>
                            )}
                        </View>
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
                        <View>
                            <TextInput
                                style={styles.infoInput}
                                value={tempInfo.dateOfBirth}
                                onChangeText={(text) => handleInputChange('dateOfBirth', text)}
                                placeholder="YYYY-MM-DD"
                            />
                            {errors.dateOfBirth && (
                                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                            )}
                        </View>
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

            {errors.general && (
                <Text style={styles.errorText}>{errors.general}</Text>
            )}

            <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
                <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>

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
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    uploadIconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        padding: 4,
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
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 5,
        marginLeft: 28,
    },
});

export default ProfileScreen;