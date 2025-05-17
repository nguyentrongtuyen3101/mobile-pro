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
  Modal,
} from 'react-native';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import { getCartItems, addToCart, removeFromCart } from '../../services/muasamservice';

// Định nghĩa kiểu cho CartItem
interface CartItem {
  id: number; // Sử dụng id của GioHang
  title: string;
  subtitle: string;
  price: string;
  image: any;
  quantity: number;
}

// Định nghĩa props cho CartItem component
interface CartItemProps {
  item: CartItem;
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, newQuantity: number) => void;
  onToggleCheckbox: (id: number) => void;
  checked: boolean;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity, onToggleCheckbox, checked }) => {
  const price = parseFloat(item.price.replace('$', '')) * item.quantity;

  return (
    <View style={styles.cartItem}>
      <TouchableOpacity
        onPress={() => onToggleCheckbox(item.id)}
        style={styles.checkboxContainer}
        accessible={true}
        accessibilityLabel="Toggle item selection"
        accessibilityHint="Double tap to select or deselect this item"
      >
        <FontAwesome
          name={checked ? 'check-square-o' : 'square-o'}
          size={24}
          color={checked ? '#53B175' : '#B3B3B3'}
        />
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.title}</Text>
        <Text style={styles.itemDetailsText}>{item.subtitle}</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            accessible={true}
            accessibilityLabel="Decrease quantity"
            accessibilityHint="Tap to decrease item quantity"
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
            accessible={true}
            accessibilityLabel="Increase quantity"
            accessibilityHint="Tap to increase item quantity"
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.closeprice}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onRemove(item.id)}
          accessible={true}
          accessibilityLabel="Remove item"
          accessibilityHint="Double tap to remove this item from cart"
        >
          <FontAwesome name="close" size={24} color="#B3B3B3" />
        </TouchableOpacity>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const App = () => {
  const { cartItems, setCartItems } = useCart();
  const { user } = useUser();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
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

  // Gọi API để lấy giỏ hàng từ muasamservice
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) {
        console.log('User not logged in, cannot fetch cart items');
        return;
      }

      const items = await getCartItems();
      if (items) {
        setCartItems(items);
      } else {
        console.log('Không thể lấy giỏ hàng, items trả về null');
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

  const handleUpdateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    // TODO: Gọi API để cập nhật số lượng trên server (nếu có API update)
  };

  const handleRemoveItem = async (id: number) => {
    setSelectedItemId(id);
    setShowConfirmDelete(true); // Hiển thị popup xác nhận
  };

  const confirmDelete = async () => {
    if (selectedItemId !== null) {
      const success = await removeFromCart(selectedItemId);
      if (success) {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== selectedItemId));
        Alert.alert('Thành công', 'Xóa sản phẩm khỏi giỏ hàng thành công!');
      } else {
        Alert.alert('Lỗi', 'Không thể xóa sản phẩm khỏi giỏ hàng');
      }
      setShowConfirmDelete(false);
      setSelectedItemId(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setSelectedItemId(null);
  };

  const handleToggleCheckbox = (id: number) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(id)) {
      newCheckedItems.delete(id);
    } else {
      newCheckedItems.add(id);
    }
    setCheckedItems(newCheckedItems);
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
                onToggleCheckbox={handleToggleCheckbox}
                checked={checkedItems.has(item.id)}
              />
            ))}
          </ScrollView>
        )}
        {cartItems.length > 0 && (
          <View style={styles.checkoutContainer}>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => setShowCheckout(true)}
              accessible={true}
              accessibilityLabel="Go to checkout"
              accessibilityHint="Double tap to proceed to checkout"
            >
              <Text style={styles.checkoutButtonText}>Go to Checkout</Text>
              <View style={styles.checkoutPrice}>
                <Text style={styles.checkoutPriceText}>${totalCost.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Popup xác nhận xóa */}
      <Modal
        transparent={true}
        visible={showConfirmDelete}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <TouchableWithoutFeedback onPress={cancelDelete}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Bạn có chắc chắn muốn xóa sản phẩm này?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmDelete}
                  accessible={true}
                  accessibilityLabel="Confirm delete"
                  accessibilityHint="Double tap to confirm deletion"
                >
                  <Text style={styles.modalButtonText}>Xác nhận</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={cancelDelete}
                  accessible={true}
                  accessibilityLabel="Cancel delete"
                  accessibilityHint="Double tap to cancel deletion"
                >
                  <Text style={styles.modalButtonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
                    accessible={true}
                    accessibilityLabel="Change delivery method"
                    accessibilityHint="Double tap to toggle between Standard and Express Delivery"
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
                    accessible={true}
                    accessibilityLabel="Change payment method"
                    accessibilityHint="Double tap to toggle between Credit Card and PayPal"
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
                      accessible={true}
                      accessibilityLabel="Promo code input"
                      accessibilityHint="Enter your promo code and apply"
                    />
                    <TouchableOpacity
                      onPress={applyPromoCode}
                      accessible={true}
                      accessibilityLabel="Apply promo code"
                      accessibilityHint="Double tap to apply the entered promo code"
                    >
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

              <TouchableOpacity
                style={styles.button}
                onPress={handlePayment}
                accessible={true}
                accessibilityLabel="Place order"
                accessibilityHint="Double tap to place your order"
              >
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
              accessible={true}
              accessibilityLabel="Close error"
              accessibilityHint="Double tap to return to home"
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

            <TouchableOpacity
              style={styles.button}
              onPress={handleTryAgain}
              accessible={true}
              accessibilityLabel="Try again"
              accessibilityHint="Double tap to try the order again"
            >
              <Text style={styles.buttonText}>Please Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              accessible={true}
              accessibilityLabel="Back to home"
              accessibilityHint="Double tap to return to home screen"
            >
              <Text style={styles.linkText}>Back to home</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Container chính, bao bọc toàn bộ giao diện
  container: {
    flex: 1,
    backgroundColor: '#EC870E',
  },

  // Container chính của giỏ hàng, bao gồm header và nội dung
  myCart: {
    flex: 1,
  },

  // Header của màn hình giỏ hàng
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#945305',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  // Tiêu đề header
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  // Container chứa danh sách sản phẩm trong giỏ hàng
  cartItems: {
    padding: 16,
  },

  // Mỗi bản ghi sản phẩm trong giỏ hàng
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FEEBD0',
  },

  // Container cho checkbox chọn sản phẩm
  checkboxContainer: {
    marginRight: 12,
  },

  // Khung chứa hình ảnh sản phẩm
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
  },

  // Hình ảnh sản phẩm bên trong khung
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Container chứa thông tin sản phẩm
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },

  // Tên sản phẩm
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  // Mô tả sản phẩm
  itemDetailsText: {
    color: 'gray',
    marginBottom: 8,
  },

  // Container điều khiển số lượng
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },

  // Nút tăng/giảm số lượng
  quantityButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },

  // Văn bản trong nút tăng/giảm
  quantityButtonText: {
    fontSize: 16,
  },

  // Văn bản hiển thị số lượng
  quantityText: {
    marginHorizontal: 8,
    fontSize: 16,
  },

  // Container chứa nút xóa và giá
  closeprice: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
    marginRight: 12,
  },

  // Nút xóa sản phẩm
  deleteButton: {
    padding: 8,
  },

  // Giá sản phẩm
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Container checkout, nổi bật và tách biệt với layout
  checkoutContainer: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: '#008080', // Nền trắng trong suốt nhẹ
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    alignItems: 'center',
  },

  // Nút đi đến checkout
  checkoutButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#006241',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 350,
  },

  // Văn bản trên nút checkout
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    paddingLeft: 20,
  },

  // Container hiển thị giá trên nút checkout
  checkoutPrice: {
    backgroundColor: 'darkgreen',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    width: '35%',
    alignItems: 'center',
  },

  // Văn bản giá trên nút checkout
  checkoutPriceText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },

  // Overlay cho popup
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Dòng trong popup checkout
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 15,
  },

  // Nhãn trong popup
  label: {
    color: '#6b7280',
    fontSize: 16,
  },

  // Phần cuối dòng trong popup
  rowEnd: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Giá trị trong popup
  value: {
    color: '#181725',
    marginRight: 10,
    fontSize: 16,
  },

  // Ô nhập liệu trong popup
  input: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 14,
    width: 120,
    marginRight: 10,
  },

  // Văn bản "Apply" trong popup
  applyText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Nút trong popup
  button: {
    backgroundColor: '#53B175',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  // Văn bản trên nút
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Overlay cho modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Container modal
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },

  // Văn bản trong modal
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },

  // Container nút trong modal
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  // Nút trong modal
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },

  // Nút xác nhận trong modal
  confirmButton: {
    backgroundColor: '#ff4444',
  },

  // Nút hủy trong modal
  cancelButton: {
    backgroundColor: '#ccc',
  },

  // Văn bản trên nút modal
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },

  // Container rỗng khi giỏ hàng trống
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  // Văn bản khi giỏ hàng trống
  emptyCartText: {
    fontSize: 18,
    color: '#6B7280',
  },

  // Container biểu tượng trong lỗi
  iconContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hình ảnh biểu tượng lỗi
  imageIcon: {
    width: 130,
    height: 120,
    marginLeft: 100,
  },

  // Tiêu đề lỗi
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },

  // Phụ đề lỗi
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
  },

  // Liên kết văn bản
  linkText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },

  // Container đóng lỗi
  closeIconContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },

  // Giá trị tổng chi phí
  cost: {
    color: '#181725',
    fontSize: 16,
    marginRight: -130,
  },

  // Nội dung trong popup
  content: {
    marginBottom: 20,
  },

  // Thẻ popup
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
});

export default App;