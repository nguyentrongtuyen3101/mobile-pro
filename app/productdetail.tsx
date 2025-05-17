// ProductPage.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useCart } from './contexts/CartContext';
import { useFavourites } from './contexts/FavouriteContext';
import { useUser } from './contexts/UserContext';
import SanPhamService from '../services/sanphamservice';
import { addToCart } from '../services/muasamservice'; // Import addToCart
import baseurl from '../baseurl';

interface Product {
  id: number;
  loai: string;
  tenSanPham: string;
  moTa: string;
  giaTien: number;
  duongDanAnh: string;
  soLuong: number;
}

interface FavouriteItem {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  image: any;
}

const ProductPage: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { addToCart: addToCartContext } = useCart();
  const { addToFavourites, removeFromFavourites, favouriteItems } = useFavourites();
  const { user } = useUser();

  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Không tìm thấy ID sản phẩm');
        setLoading(false);
        return;
      }

      try {
        const data: Product = await SanPhamService.getSanPhamById(Number(productId));
        setProduct(data);
        setLiked(favouriteItems.some((item) => item.title === data.tenSanPham));
      } catch (err: any) {
        setError(`Lỗi khi lấy thông tin sản phẩm: ${err.message}`);
        console.error('Chi tiết lỗi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, favouriteItems]);

  const handleLikePress = () => {
    if (!product) return;

    const productData: FavouriteItem = {
      id: product.id,
      title: product.tenSanPham,
      subtitle: `${product.soLuong} items`,
      price: `$${product.giaTien}`,
      image: { uri: `${baseurl}${product.duongDanAnh}` },
    };

    if (liked) {
      removeFromFavourites(product.tenSanPham);
    } else {
      addToFavourites(productData);
    }
    setLiked(!liked);
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToBasket = async () => {
    if (!product) return;

    if (!user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      router.push('/login');
      return;
    }

    const request = {
      sanPhamId: product.id,
      soLuong: quantity,
    };

    try {
      const success = await addToCart(request); // Sử dụng hàm từ muasamservice
      if (success) {
        const productData = {
          id: product.id,
          title: product.tenSanPham,
          subtitle: `${product.soLuong} items`,
          price: `$${product.giaTien}`,
          image: { uri: `${baseurl}${product.duongDanAnh}` },
          quantity,
        };
        addToCartContext(productData); // Đồng bộ với CartContext
        alert('Đã thêm sản phẩm vào giỏ hàng!');
        router.push('/mycart');
      } else {
        throw new Error('Không thể thêm vào giỏ hàng');
      }
    } catch (err: any) {
      console.error('Lỗi khi thêm vào giỏ hàng:', err.message);
      alert(`Lỗi khi thêm vào giỏ hàng: ${err.message}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy sản phẩm'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <FontAwesome name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.productTitle}>Product</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Feather name="upload" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${baseurl}${product.duongDanAnh}` }}
            style={styles.productImage}
            onError={() => console.log('Lỗi tải hình ảnh')}
          />
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View>
              <Text style={styles.productTitle}>{product.tenSanPham}</Text>
              <Text style={styles.productSubtitle}>{product.soLuong} items</Text>
            </View>
            <TouchableOpacity onPress={handleLikePress}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={24}
                color={liked ? 'red' : 'gray'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.productPriceContainer}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={handleDecreaseQuantity}>
                <Text style={styles.quantityButton}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={handleIncreaseQuantity}>
                <Text style={styles.quantityButton}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.productPrice}>${product.giaTien}</Text>
          </View>
        </View>

        <View style={styles.productDetails}>
          <View style={[styles.detailSection, styles.detailCard]}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Product Detail</Text>
            </View>
            <Text style={styles.detailText}>{product.moTa || 'Không có mô tả.'}</Text>
          </View>

          <View style={[styles.detailSection, styles.detailCard]}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Nutritions</Text>
            </View>
            <Text style={styles.detailText}>100gr</Text>
          </View>

          <View style={[styles.detailSection, styles.detailCard]}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Review</Text>
            </View>
            <View style={styles.reviewStars}>
              {[...Array(5)].map((_, i) => (
                <FontAwesome key={i} name="star" size={20} color="#FFD700" />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.addToBasketContainer}>
        <TouchableOpacity style={styles.addToBasketButton} onPress={handleAddToBasket}>
          <Text style={styles.addToBasketText}>Add To Basket</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Style cho màn hình chi tiết sản phẩm
const styles = StyleSheet.create({
    // Container chính của màn hình
    container: {
        backgroundColor: '#000', // Màu nền xám nhạt cho toàn màn hình
        flex: 1, // Chiếm toàn bộ không gian
    },

    // Thanh tiêu đề (header) của màn hình
    header: {
        flexDirection: 'row', // Sắp xếp ngang các phần tử
        justifyContent: 'space-between', // Phân bố đều khoảng cách
        alignItems: 'center', // Căn giữa theo chiều dọc
        padding: 16, // Padding 16px quanh các cạnh
        backgroundColor: '#EC870E', // Nền trắng cho header
        shadowColor: '#000', // Đổ bóng: màu đen
        shadowOffset: { width: 0, height: 2 }, // Độ lệch bóng
        shadowOpacity: 0.1, // Độ mờ bóng
        shadowRadius: 4, // Bán kính bóng
        elevation: 2, // Đổ bóng cho Android
    },

    // Các icon trong header (bên phải)
    headerIcons: {
        flexDirection: 'row', // Sắp xếp ngang các icon
        alignItems: 'center', // Căn giữa theo chiều dọc
        gap: 8, // Khoảng cách giữa các icon
    },

    // Khung chứa ảnh sản phẩm
    imageContainer: {
        width: '100%', // Chiều rộng cố định cho khung ảnh
        height: 250, // Chiều cao cố định cho khung ảnh
        borderRadius: 0, // Bo góc khung ảnh
        borderWidth: 1, // Viền 1px
        borderColor: '#000', // Màu viền xám nhạt
        backgroundColor: '#FFF', // Nền trắng cho khung ảnh
        justifyContent: 'center', // Căn giữa theo chiều dọc
        alignItems: 'center', // Căn giữa theo chiều ngang
        alignSelf: 'center', // Căn giữa khung ảnh trong màn hình
        marginVertical: 0, // Khoảng cách trên/dưới 16px
        overflow: 'hidden', // Ẩn phần vượt ra ngoài khung
        shadowColor: '#000', // Đổ bóng: màu đen
        shadowOffset: { width: 0, height: 2 }, // Độ lệch bóng
        shadowOpacity: 0.2, // Độ mờ bóng
        shadowRadius: 4, // Bán kính bóng
        elevation: 3, // Đổ bóng cho Android
    },

    // Ảnh sản phẩm bên trong khung
    productImage: {
        width: '100%', // Chiếm toàn bộ chiều rộng khung
        height: '100%', // Chiếm toàn bộ chiều cao khung
        resizeMode: 'cover', // Co dãn lấp đầy khung, không thừa không thiếu
    },

    // Phần thông tin sản phẩm (tên, số lượng, giá, nút yêu thích)
    productInfo: {
        padding: 16, // Padding 16px quanh các cạnh
        backgroundColor: '#FCE0A6', // Nền trắng cho phần thông tin
        borderRadius: 20, // Bo góc 10px
        marginHorizontal: 22, // Margin ngang 16px
        shadowColor: '#000', // Đổ bóng: màu đen
        shadowOffset: { width: 0, height: 2 }, // Độ lệch bóng
        shadowOpacity: 0.1, // Độ mờ bóng
        shadowRadius: 4, // Bán kính bóng
        elevation: 2, // Đổ bóng cho Android
        marginTop:20,
    },

    // Tiêu đề và nút yêu thích trong phần thông tin sản phẩm
    productHeader: {
        flexDirection: 'row', // Sắp xếp ngang
        justifyContent: 'space-between', // Phân bố đều khoảng cách
        alignItems: 'center', // Căn giữa theo chiều dọc
    },

    // Tiêu đề sản phẩm (tên sản phẩm)
    productTitle: {
        fontSize: 24, // Kích thước chữ 24px
        fontWeight: 'bold', // Chữ in đậm
        color: '#333', // Màu chữ xám đậm
    },

    // Phụ đề sản phẩm (số lượng)
    productSubtitle: {
        color: '#6B7280', // Màu xám
        fontSize: 16, // Kích thước chữ 16px
        marginTop: 4, // Khoảng cách trên 4px
    },

    // Container chứa giá và số lượng sản phẩm
    productPriceContainer: {
        flexDirection: 'row', // Sắp xếp ngang
        justifyContent: 'space-between', // Phân bố đều khoảng cách
        alignItems: 'center', // Căn giữa theo chiều dọc
        marginTop: 16, // Khoảng cách trên 16px
    },

    // Container chứa nút tăng/giảm số lượng
    quantityContainer: {
        flexDirection: 'row', // Sắp xếp ngang
        alignItems: 'center', // Căn giữa theo chiều dọc
        gap: 16, // Khoảng cách giữa các phần tử
    },

    // Nút tăng/giảm số lượng
    quantityButton: {
        fontSize: 24, // Kích thước chữ 24px
        color: '#00676B', // Màu xanh lá, đồng bộ với nút Add To Basket
        fontWeight: 'bold', // Chữ in đậm
    },

    // Hiển thị số lượng sản phẩm
    quantityText: {
        fontSize: 20, // Kích thước chữ 20px
        borderWidth: 1, // Viền 1px
        borderColor: '#E5E7EB', // Màu viền xám nhạt
        paddingHorizontal: 16, // Padding ngang 16px
        paddingVertical: 4, // Padding dọc 4px
        borderRadius: 8, // Bo góc 8px
        color: '#333', // Màu chữ xám đậm
    },

    // Giá sản phẩm
    productPrice: {
        fontSize: 24, // Kích thước chữ 24px
        fontWeight: 'bold', // Chữ in đậm
        color: '#00676B', // Màu xanh lá
    },

    // Container chứa các mục chi tiết sản phẩm (Product Detail, Nutritions, Review)
    productDetails: {
        padding: 16, // Padding 16px quanh các cạnh
        flexDirection: 'column', // Sắp xếp dọc các mục
    },

    // Mỗi mục chi tiết (Product Detail, Nutritions, Review)
    detailSection: {
        flexDirection: 'column', // Sắp xếp dọc nội dung (tiêu đề và nội dung)
        padding: 16, // Padding 16px quanh các cạnh
        marginVertical: 5, // Khoảng cách trên/dưới giảm xuống 5px để các mục gần nhau hơn
        minHeight: 100, // Chiều cao tối thiểu để các mục đều nhau
        marginHorizontal: 5,
    },

    // Hiệu ứng thẻ cho các mục chi tiết
    detailCard: {
        backgroundColor: '#FCE0A6', // Nền trắng cho từng mục
        borderRadius: 20, // Bo góc 10px
        shadowColor: '#000', // Đổ bóng: màu đen
        shadowOffset: { width: 0, height: 2 }, // Độ lệch bóng
        shadowOpacity: 0.2, // Độ mờ bóng
        shadowRadius: 4, // Bán kính bóng
        elevation: 3, // Đổ bóng cho Android
    },

    // Tiêu đề của mục chi tiết
    detailHeader: {
        flexDirection: 'row', // Sắp xếp ngang
        justifyContent: 'space-between', // Phân bố đều khoảng cách
        alignItems: 'center', // Căn giữa theo chiều dọc
    },

    // Tiêu đề của mỗi mục chi tiết (Product Detail, Nutritions, Review)
    detailTitle: {
        fontSize: 18, // Kích thước chữ 18px
        fontWeight: '600', // Chữ in đậm vừa
        color: '#333', // Màu chữ xám đậm
    },

    // Phụ đề trong mục chi tiết (ví dụ: "100gr" trong Nutritions)
    detailSubtitle: {
        color: '#6B7280', // Màu xám
        fontSize: 14, // Kích thước chữ 14px
    },

    // Nội dung văn bản trong mục chi tiết (mô tả sản phẩm)
    detailText: {
        color: '#6B7280', // Màu xám
        marginTop: 10, // Khoảng cách trên 10px
        fontSize: 14, // Kích thước chữ 14px
    },

    // Các ngôi sao đánh giá trong mục Review
    reviewStars: {
        flexDirection: 'row', // Sắp xếp ngang các ngôi sao
        alignItems: 'center', // Căn giữa theo chiều dọc
        marginTop: 10, // Khoảng cách trên 10px
    },

    // Container chứa nút "Add To Basket"
    addToBasketContainer: {
        padding: 16, // Padding 16px quanh các cạnh
        backgroundColor: '#EC870E', // Nền trắng cho phần nút
        shadowColor: '#000', // Đổ bóng: màu đen
        shadowOffset: { width: 0, height: -2 }, // Độ lệch bóng (hướng lên trên)
        shadowOpacity: 0.1, // Độ mờ bóng
        shadowRadius: 4, // Bán kính bóng
        elevation: 2, // Đổ bóng cho Android
    },

    // Nút "Add To Basket"
    addToBasketButton: {
        backgroundColor: '#00676B', // Màu xanh lá
        paddingVertical: 16, // Padding dọc 16px
        borderRadius: 8, // Bo góc 8px
        alignItems: 'center', // Căn giữa nội dung
        shadowColor: '#000', // Đổ bóng: màu đen
        shadowOffset: { width: 0, height: 2 }, // Độ lệch bóng
        shadowOpacity: 0.3, // Độ mờ bóng
        shadowRadius: 3, // Bán kính bóng
        elevation: 3, // Đổ bóng cho Android
    },

    // Văn bản trong nút "Add To Basket"
    addToBasketText: {
        color: '#FFFFFF', // Màu chữ trắng
        fontSize: 18, // Kích thước chữ 18px
        fontWeight: '600', // Chữ in đậm vừa
    },

    // Văn bản hiển thị khi đang loading
    loadingText: {
        fontSize: 16, // Kích thước chữ 16px
        color: '#666', // Màu xám cho text loading
        textAlign: 'center', // Căn giữa văn bản
        marginTop: 20, // Khoảng cách trên 20px
    },

    // Văn bản hiển thị khi có lỗi
    errorText: {
        fontSize: 16, // Kích thước chữ 16px
        color: '#FF0000', // Màu đỏ cho text lỗi
        textAlign: 'center', // Căn giữa văn bản
        marginTop: 20, // Khoảng cách trên 20px
    },
});

export default ProductPage;