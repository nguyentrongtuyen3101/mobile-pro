import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import baseurl from '../baseurl';

// Định nghĩa kiểu dữ liệu cho giỏ hàng
interface GioHangItem {
  id: number;
  accountId: number;
  sanPhamId: number;
  tenSanPham: string;
  duongDanAnh: string;
  giaTien: number;
  soLuong: number;
}

// Định nghĩa kiểu dữ liệu cho lỗi từ API
interface ErrorResponse {
  message: string;
}

interface CartItem {
  id: number; // Sử dụng sanPhamId làm id
  title: string;
  subtitle: string;
  price: string;
  image: any;
  quantity: number;
}

interface AddCartRequest {
  sanPhamId: number;
  soLuong: number;
}

// Gọi API để thêm sản phẩm vào giỏ hàng
export const addToCart = async (request: AddCartRequest): Promise<boolean> => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    console.error('Không tìm thấy token trong AsyncStorage');
    throw new Error('Không tìm thấy token');
  }

  console.log('Token gửi đi:', token); // Thêm log để debug token

  try {
    const response = await fetch(`${baseurl}/sanphammagager/themgiohang`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    const data: any = await response.json(); // Sử dụng any để tránh lỗi ép kiểu

    if (!response.ok) {
      console.error('Lỗi từ server khi thêm vào giỏ hàng:', (data as ErrorResponse).message || 'Không xác định');
      throw new Error((data as ErrorResponse).message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }

    console.log('Thêm vào giỏ hàng thành công:', data);
    return true;
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    return false;
  }
};

// Gọi API để lấy danh sách giỏ hàng
export const getCartItems = async (): Promise<CartItem[] | null> => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    console.error('Không tìm thấy token trong AsyncStorage');
    return null;
  }

  console.log('Token gửi đi:', token); // Thêm log để debug token

  try {
    const response = await fetch(`${baseurl}/sanphammagager/giohang`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data: any = await response.json(); // Sử dụng any để tránh lỗi ép kiểu

    if (!response.ok) {
      console.error('Lỗi từ server khi lấy giỏ hàng:', (data as ErrorResponse).message || 'Không xác định');
      throw new Error((data as ErrorResponse).message || 'Không thể lấy giỏ hàng');
    }

    const cartItems: CartItem[] = (data as GioHangItem[]).map((item) => ({
      id: item.id, // Sử dụng id của GioHang (không phải sanPhamId)
      title: item.tenSanPham,
      subtitle: `${item.soLuong} items`,
      price: `$${item.giaTien}`,
      image: { uri: `${baseurl}${item.duongDanAnh}` }, // Điều chỉnh URI ảnh
      quantity: item.soLuong,
    }));

    console.log('Danh sách giỏ hàng:', cartItems);
    return cartItems;
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    return null;
  }
};

// Gọi API để xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (gioHangId: number): Promise<boolean> => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) {
    console.error('Không tìm thấy token trong AsyncStorage');
    return false;
  }

  console.log('Token gửi đi:', token); // Thêm log để debug token

  try {
    const response = await fetch(`${baseurl}/sanphammagager/xoagiohang?id=${gioHangId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data: any = await response.json(); // Sử dụng any để tránh lỗi ép kiểu

    if (!response.ok) {
      console.error('Lỗi từ server khi xóa giỏ hàng:', (data as ErrorResponse).message || 'Không xác định');
      throw new Error((data as ErrorResponse).message || 'Không thể xóa sản phẩm khỏi giỏ hàng');
    }

    console.log('Xóa sản phẩm khỏi giỏ hàng thành công:', data);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    return false;
  }
};