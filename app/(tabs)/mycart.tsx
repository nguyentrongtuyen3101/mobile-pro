import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useRouter, useRootNavigationState } from 'expo-router';
import { useCart } from '../contexts/CartContext'; // Thay useGioHang bằng useCart
import { useUser } from '../contexts/UserContext';
import IP_ADDRESS from '../../ipv4';

// Định nghĩa kiểu cho CartItem (đồng bộ với CartContext)
interface CartItem {
    id: number;
    title: string;
    subtitle: string;
    price: string;
    image: any;
    quantity: number;
}

// Định nghĩa kiểu cho dữ liệu từ API
interface GioHangResponse {
    id: number;
    accountId: number;
    sanPhamId: number;
    tenSanPham: string;
    duongDanAnh: string;
    giaTien: number;
    soLuong: number;
}

// Định nghĩa props cho CartItem component
interface CartItemProps {
    item: CartItem;
    onRemove: (id: number) => void; // Thay gioHangId bằng id
    onUpdateQuantity: (id: number, newQuantity: number) => void; // Thay gioHangId bằng id
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity }) => {
    const price = parseFloat(item.price.replace('$', '')) * item.quantity;

    return (
        <View style={styles.cartItem}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.title}</Text>
                <Text style={styles.itemDetailsText}>{item.subtitle}</Text>
                <View style={styles.quantityControl}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.closeprice}>
                <TouchableOpacity style={styles.deleteButton} onPress={() => onRemove(item.id)}>
                    <FontAwesome name="close" size={24} color="#B3B3B3" />
                </TouchableOpacity>
                <Text style={styles.price}>${price.toFixed(2)}</Text>
            </View>
        </View>
    );
};

const App = () => {
    const { cartItems, setCartItems } = useCart(); // Thay useGioHang bằng useCart
    const { user } = useUser();
    const [showCheckout, setShowCheckout] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const blurAnim = useRef(new Animated.Value(1)).current;
    const router = useRouter();

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
            }),
        ]).start();
    }, [showCheckout]);

    // Gọi API để lấy giỏ hàng từ server
    useEffect(() => {
        const fetchCartItems = async () => {
            if (!user) {
                console.log("User not logged in, cannot fetch cart items");
                return;
            }

            try {
                const response = await fetch(`http://${IP_ADDRESS}:8080/API_for_mobile/api/checkmobile/giohang?accountId=${user.id}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Lỗi khi lấy giỏ hàng: ${response.status} - ${errorText}`);
                    throw new Error(`Không thể lấy giỏ hàng: ${errorText}`);
                }

                const data: GioHangResponse[] = await response.json();
                const cartItemsFromServer: CartItem[] = data.map((item) => ({
                    id: item.sanPhamId, // Sử dụng sanPhamId làm id
                    title: item.tenSanPham,
                    subtitle: `${item.soLuong} items`,
                    price: `$${item.giaTien}`,
                    image: { uri: `http://${IP_ADDRESS}:8080/API_for_mobile/api${item.duongDanAnh}` },
                    quantity: item.soLuong,
                }));

                setCartItems(cartItemsFromServer); // Cập nhật vào CartContext
            } catch (err: any) {
                console.error("Lỗi khi lấy giỏ hàng:", err);
                alert(`Lỗi khi lấy giỏ hàng: ${err.message}`);
            }
        };

        fetchCartItems();
    }, [user, setCartItems]);

    const [deliveryMethod, setDeliveryMethod] = useState('Standard Delivery');
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [showError, setShowError] = useState(false);

    const totalCost = cartItems.reduce((total, item) => {
        const price = parseFloat(item.price.replace('$', '')) * item.quantity;
        return total + price;
    }, 0) - discount;

    const handleUpdateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const handleRemoveItem = async (id: number) => {
        try {
            const response = await fetch(`http://${IP_ADDRESS}:8080/API_for_mobile/api/checkmobile/giohang/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Lỗi khi xóa sản phẩm khỏi giỏ hàng: ${response.status} - ${errorText}`);
                throw new Error(`Không thể xóa sản phẩm: ${errorText}`);
            }

            setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
            alert('Xóa sản phẩm khỏi giỏ hàng thành công!');
        } catch (err: any) {
            console.error("Lỗi khi xóa sản phẩm:", err);
            alert(`Lỗi khi xóa sản phẩm: ${err.message}`);
        }
    };

    const applyPromoCode = () => {
        if (promoCode === 'DISCOUNT10') {
            setDiscount(2);
            Alert.alert('Success', 'Promo code applied successfully!');
        } else {
            setDiscount(0);
            Alert.alert('Invalid', 'This promo code is not valid.');
        }
    };

    const handlePayment = () => {
        const isSuccess = Math.random() > 0.5;
        if (isSuccess) {
            setPaymentStatus('success');
            router.push('/orderaccept');
        } else {
            setPaymentStatus('failed');
            setShowError(true);
        }
    };

    const handleTryAgain = () => {
        setShowError(false);
        setPaymentStatus('pending');
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.myCart, { opacity: blurAnim }]}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>My Cart</Text>
                </View>
                {cartItems.length === 0 ? (
                    <View style={styles.emptyCart}>
                        <Text style={styles.emptyCartText}>Your cart is empty</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.cartItems}>
                        {cartItems.map((item, index) => (
                            <CartItemComponent
                                key={index}
                                item={item}
                                onRemove={handleRemoveItem}
                                onUpdateQuantity={handleUpdateQuantity}
                            />
                        ))}
                    </ScrollView>
                )}
                {cartItems.length > 0 && (
                    <TouchableOpacity style={styles.checkoutButton} onPress={() => setShowCheckout(true)}>
                        <Text style={styles.checkoutButtonText}>Go to Checkout</Text>
                        <View style={styles.checkoutPrice}>
                            <Text style={styles.checkoutPriceText}>${totalCost.toFixed(2)}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {showCheckout && (
                <TouchableWithoutFeedback
                    onPress={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowCheckout(false);
                        }
                    }}
                >
                    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <Text style={styles.headerText}>Checkout</Text>
                            </View>

                            <ScrollView style={styles.content}>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Delivery</Text>
                                    <TouchableOpacity
                                        style={styles.rowEnd}
                                        onPress={() =>
                                            setDeliveryMethod(
                                                deliveryMethod === 'Standard Delivery' ? 'Express Delivery' : 'Standard Delivery'
                                            )
                                        }
                                    >
                                        <Text style={styles.value}>{deliveryMethod}</Text>
                                        <FontAwesome name="angle-right" size={20} color="gray" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Payment</Text>
                                    <TouchableOpacity
                                        style={styles.rowEnd}
                                        onPress={() =>
                                            setPaymentMethod(paymentMethod === 'Credit Card' ? 'PayPal' : 'Credit Card')
                                        }
                                    >
                                        <Text style={styles.value}>{paymentMethod}</Text>
                                        <FontAwesome name="angle-right" size={20} color="gray" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.label}>Promo Code</Text>
                                    <View style={styles.rowEnd}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter code"
                                            value={promoCode}
                                            onChangeText={setPromoCode}
                                        />
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

                            <TouchableOpacity style={styles.button} onPress={handlePayment}>
                                <Text style={styles.buttonText}>Place Order</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            )}

            {showError && (
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.closeIconContainer}
                            onPress={() => router.push('/(tabs)')}
                        >
                            <AntDesign name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>

                        <View style={styles.iconContainer}>
                            <Image
                                source={require('../../assets/images/order-failed.png')}
                                style={styles.imageIcon}
                            />
                        </View>
                        <Text style={styles.title}>Oops! Order Failed</Text>
                        <Text style={styles.subtitle}>Something went terribly wrong</Text>

                        <TouchableOpacity style={styles.button} onPress={handleTryAgain}>
                            <Text style={styles.buttonText}>Please Try Again</Text>
                        </TouchableOpacity>
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
    emptyCart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emptyCartText: {
        fontSize: 18,
        color: '#6B7280',
    },
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
        marginLeft: 100,
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
        textAlign: 'center',
    },
    closeIconContainer: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    cost: {
        color: '#181725',
        fontSize: 16,
        marginRight: -130,
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
        padding: 8,
    },
    myCart: { flex: 1 },
    closeprice: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
    },
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
        marginLeft: 38,
    },
    checkoutButtonText: { color: 'white', fontSize: 16, paddingLeft: 45 },
    checkoutPrice: { backgroundColor: 'darkgreen', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, width: "30%" },
    checkoutPriceText: { color: 'white' },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
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
});

export default App;