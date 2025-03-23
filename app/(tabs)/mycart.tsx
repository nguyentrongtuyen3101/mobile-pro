import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Animated, Easing } from 'react-native';
import { useRef, useEffect } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
interface CartItemProps {
    image: string;
    name: string;
    details: string;
    price: number;
}

const CartItem: React.FC<CartItemProps> = ({ image, name, details, price }) => (
    <View style={styles.cartItem}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{name}</Text>
            <Text style={styles.itemDetailsText}>{details}</Text>
            <View style={styles.quantityControl}>
                <TouchableOpacity style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>1</Text>
                <TouchableOpacity style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
        <View style={styles.closeprice}>
            <TouchableOpacity style={styles.deleteButton}>
                <FontAwesome name="close" size={24} color="#B3B3B3" />
            </TouchableOpacity>
            <Text style={styles.price}>${price.toFixed(2)}</Text>
        </View>
    </View>
);

const App = () => {
    const [showCheckout, setShowCheckout] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const blurAnim = useRef(new Animated.Value(1)).current;
    const [isVisible, setIsVisible] = useState(true); // Kiểm soát hiển thị
    const navigationState = useRootNavigationState(); // Kiểm tra navigation state

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: showCheckout ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(blurAnim, {
                toValue: showCheckout ? 0.3 : 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    }, [showCheckout]);

    const [deliveryMethod, setDeliveryMethod] = useState('Standard Delivery');
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const basePrice = 100;
    const totalCost = basePrice - discount;
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const applyPromoCode = () => {
        if (promoCode === 'DISCOUNT10') {
            setDiscount(2);
            Alert.alert('Success', 'Promo code applied successfully!');
        } else {
            setDiscount(0);
            Alert.alert('Invalid', 'This promo code is not valid.');
        }
    };
    const [showError, setShowError] = useState(false);

    // Khi paymentStatus thay đổi, cập nhật showError
    useEffect(() => {
        if (paymentStatus === 'failed') {
            setShowError(true);
        }
    }, [paymentStatus]);

    const handleTryAgain = () => {
        setShowError(false); // Ẩn màn hình lỗi trước
        router.push('/mycart'); // Chuyển về màn hình mycart
    };

    const router = useRouter();
    const handlePayment = () => {
        const isSuccess = Math.random() > 0.5; // Giả lập thanh toán thành công/thất bại
        if (isSuccess) {
            setPaymentStatus('success');
            router.push('/orderaccept'); // Điều hướng tới màn hình thành công
        } else {
            setPaymentStatus('failed'); // Hiển thị màn hình thất bại
        }
    };


    return (
        <View style={styles.container}>
            <Animated.View style={[styles.myCart, { opacity: blurAnim }]}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>My Cart</Text>
                </View>
                <ScrollView style={styles.cartItems}>
                    <CartItem image="https://placehold.co/64" name="Apple" details="1kg" price={2.99} />
                    <CartItem image="https://placehold.co/64" name="Orange" details="500g" price={1.49} />
                </ScrollView>
                <TouchableOpacity style={styles.checkoutButton} onPress={() => setShowCheckout(true)}>
                    <Text style={styles.checkoutButtonText}>Go to Checkout</Text>
                    <View style={styles.checkoutPrice}>
                        <Text style={styles.checkoutPriceText}>${totalCost.toFixed(2)}</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {showCheckout && (
                <TouchableWithoutFeedback onPress={(event) => {
                    if (event.target === event.currentTarget) {
                        setShowCheckout(false);
                    }
                }}>
                    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <Text style={styles.headerText}>Checkout</Text>
                            </View>

                            <ScrollView style={styles.content}>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Delivery</Text>
                                    <TouchableOpacity style={styles.rowEnd}
                                        onPress={() => setDeliveryMethod(deliveryMethod === 'Standard Delivery' ? 'Express Delivery' : 'Standard Delivery')}>
                                        <Text style={styles.value}>{deliveryMethod}</Text>
                                        <FontAwesome name="angle-right" size={20} color="gray" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Payment</Text>
                                    <TouchableOpacity style={styles.rowEnd}
                                        onPress={() => setPaymentMethod(paymentMethod === 'Credit Card' ? 'PayPal' : 'Credit Card')}>
                                        <Text style={styles.value}>{paymentMethod}</Text>
                                        <FontAwesome name="angle-right" size={20} color="gray" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Promo Code</Text>
                                    <View style={styles.rowEnd}>
                                        <TextInput style={styles.input} placeholder="Enter code"
                                            value={promoCode} onChangeText={setPromoCode} />
                                        <TouchableOpacity onPress={applyPromoCode}>
                                            <Text style={styles.applyText}>Apply</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Total Cost</Text>
                                    <Text style={styles.cost}>${totalCost.toFixed(2)}</Text>
                                    <FontAwesome name="angle-right" size={20} color="gray" />
                                </View>
                            </ScrollView>

                            <TouchableOpacity style={styles.button} onPress={() => handlePayment()}>
                                <Text style={styles.buttonText}>Place Order</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            )}
            {showError && (
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.closeIconContainer} onPress={() => router.push('/(tabs)')}>
                            <AntDesign name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>

                        {/* Hình ảnh minh họa */}
                        <View style={styles.iconContainer}>
                            <Image source={require('../../assets/images/order-failed.png')} style={styles.imageIcon} />
                        </View>
                        {/* Tiêu đề */}
                        <Text style={styles.title}>Oops! Order Failed</Text>
                        <Text style={styles.subtitle}>
                            Something went terribly wrong
                        </Text>

                        {/* Nút thử lại */}
                        <TouchableOpacity style={styles.button} onPress={handleTryAgain}>
                            <Text style={styles.buttonText}>Please Try Again</Text>
                        </TouchableOpacity>
                        {/* Nút quay về trang chủ */}
                        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
                            <Text style={styles.linkText}>Back to home</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        position: 'relative',
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageIcon: {
        width: 130,
        height: 120,
        marginLeft: 100
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 24,
        textAlign: 'center',
    },
    linkText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center'
    },
    closeIconContainer: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    cost: {
        color: '#181725',
        fontSize: 16,
        marginRight: -130
    },

    content: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        width: 320,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    deleteButton: {
        padding: 8, // Khoảng cách giữa nút X và giá
    },
    myCart: { flex: 1 },
    closeprice: {
        flexDirection: 'column', // Sắp xếp theo chiều dọc
        alignItems: 'center', // Căn giữa theo trục ngang
        justifyContent: 'space-between', // Dãn cách đều
        height: 80,
    }, // C
    container: { flex: 1, backgroundColor: 'white' },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', alignItems: 'center' },
    headerText: { fontSize: 20, fontWeight: 'bold' },
    cartItems: { padding: 16 },
    cartItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    image: { width: 64, height: 64 },
    itemDetails: { flex: 1, marginLeft: 16 },
    itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
    itemDetailsText: { color: 'gray' },
    quantityControl: { flexDirection: 'row', alignItems: 'center', marginTop: 13, marginLeft: -11 },
    quantityButton: { width: 32, height: 32, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 16, alignItems: 'center', justifyContent: 'center', margin: 8 },
    quantityButtonText: { fontSize: 16 },
    quantityText: { marginHorizontal: 8 },
    price: { fontSize: 16, fontWeight: 'bold' },
    checkoutButton: {
        width: "80%",
        padding: 20,
        backgroundColor: "#53B175",
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginLeft: 38
    },
    checkoutButtonText: { color: 'white', fontSize: 16, paddingLeft: 45 },
    checkoutPrice: { backgroundColor: 'darkgreen', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, width: "30%" },
    checkoutPriceText: { color: 'white' },

    // ✅ Style cho màn hình Checkout
    overlay: {
        ...StyleSheet.absoluteFillObject, // Chồng lên toàn bộ màn hình
        backgroundColor: 'rgba(0,0,0,0.5)', // Làm mờ nền
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutContainer: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    checkoutTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    checkoutText: { fontSize: 18, marginBottom: 20 },
    confirmButton: { backgroundColor: '#53B175', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
    confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    backButton: { position: 'absolute', left: 15, top: 15 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingVertical: 15,
    },
    label: {
        color: '#6b7280',
        fontSize: 16,
    },
    rowEnd: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    value: {
        color: '#181725',
        marginRight: 10,
        fontSize: 16,
    },
    input: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        fontSize: 14,
        width: 120,
        marginRight: 10,
    },
    applyText: {
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#53B175',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    footerText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 10,
    },
    footerLink: {
        color: 'black',
        fontWeight: '600',
    },
});

export default App;
