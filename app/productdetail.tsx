import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from './contexts/CartContext';
import { useFavourites } from './contexts/FavouriteContext';
import IP_ADDRESS from '../ipv4';

// Định nghĩa kiểu cho sản phẩm từ API
interface Product {
    id: number;
    loai: string;
    tenSanPham: string;
    moTa: string;
    giaTien: number;
    duongDanAnh: string;
    soLuong: number;
}

const ProductPage: React.FC = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { addToFavourites, removeFromFavourites, favouriteItems } = useFavourites();

    // Lấy id từ params
    const productId = Array.isArray(params.id) ? params.id[0] : params.id;

    // State để lưu thông tin sản phẩm từ API
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State cho số lượng và trạng thái yêu thích
    const [liked, setLiked] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Gọi API để lấy chi tiết sản phẩm
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setError('Không tìm thấy ID sản phẩm');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://${IP_ADDRESS}:8080/API_for_mobile/api/checkmobile/sanphamchitiet/${productId}`);
                if (!response.ok) {
                    throw new Error('Không tìm thấy sản phẩm');
                }
                const data: Product = await response.json();
                setProduct(data);

                // Kiểm tra sản phẩm có trong danh sách yêu thích không
                setLiked(favouriteItems.some((item) => item.title === data.tenSanPham));
            } catch (err) {
                setError('Lỗi khi lấy thông tin sản phẩm');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, favouriteItems]);

    // Hàm xử lý khi nhấn nút thích
    const handleLikePress = () => {
        if (!product) return;

        const productData = {
            title: product.tenSanPham,
            subtitle: `${product.soLuong} items`,
            price: `$${product.giaTien}`,
            image: { uri: `http://${IP_ADDRESS}:8080/API_for_mobile/api${product.duongDanAnh}` },
        };

        if (liked) {
            removeFromFavourites(product.tenSanPham);
        } else {
            addToFavourites(productData);
        }
        setLiked(!liked);
    };

    // Hàm xử lý tăng số lượng
    const handleIncreaseQuantity = () => {
        setQuantity((prev) => prev + 1);
    };

    // Hàm xử lý giảm số lượng
    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    // Hàm xử lý thêm sản phẩm vào giỏ hàng
    const handleAddToBasket = () => {
        if (!product) return;

        const productData = {
            title: product.tenSanPham,
            subtitle: `${product.soLuong} items`,
            price: `$${product.giaTien}`,
            image: { uri: `http://${IP_ADDRESS}:8080/API_for_mobile/api${product.duongDanAnh}` },
            quantity,
        };
        addToCart(productData);
        router.push('/mycart');
    };

    // Hàm xử lý quay lại màn hình trước đó
    const handleGoBack = () => {
        router.back();
    };

    // Hiển thị khi đang tải
    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Đang tải...</Text>
            </View>
        );
    }

    // Hiển thị khi có lỗi
    if (error || !product) {
        return (
            <View style={styles.container}>
                <Text>{error || 'Không tìm thấy sản phẩm'}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
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
                {/* Product Image */}
                <View style={styles.imagedaidien}>
                    <Image
                        source={{ uri: `http://${IP_ADDRESS}:8080/API_for_mobile/api${product.duongDanAnh}` }}
                        style={styles.productImage}
                        onError={() => console.log('Lỗi tải hình ảnh')}
                    />
                </View>
                {/* Product Info */}
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

                {/* Product Details */}
                <View style={styles.productDetails}>
                    <View style={styles.detailSection}>
                        <View style={styles.productdetail}>
                            <View style={styles.detailHeader}>
                                <Text style={styles.detailTitle}>Product Detail</Text>
                            </View>
                            <Text style={styles.detailText}>
                                {product.moTa || 'Không có mô tả.'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.detailTitle}>Nutritions</Text>
                        <Text style={styles.detailSubtitle}>100gr</Text>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.detailTitle}>Review</Text>
                        <View style={styles.reviewStars}>
                            {[...Array(5)].map((_, i) => (
                                <FontAwesome key={i} name="star" size={20} color="#FFD700" />
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Add to Basket Button */}
            <View style={styles.addToBasketContainer}>
                <TouchableOpacity style={styles.addToBasketButton} onPress={handleAddToBasket}>
                    <Text style={styles.addToBasketText}>Add To Basket</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    productdetail: {
        flexDirection: 'column',
    },
    imagedaidien: {
        backgroundColor: 'white',
    },
    productImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    container: {
        backgroundColor: '#F9FAFB',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    productInfo: {
        padding: 16,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    productSubtitle: {
        color: '#6B7280',
    },
    productPriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    quantityButton: {
        fontSize: 24,
    },
    quantityText: {
        fontSize: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 8,
    },
    productPrice: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    productDetails: {
        padding: 16,
        flexDirection: 'column',
    },
    detailSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
        marginTop: 16,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    detailSubtitle: {
        color: '#6B7280',
    },
    detailText: {
        color: '#6B7280',
        marginTop: 10,
    },
    reviewStars: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addToBasketContainer: {
        padding: 16,
    },
    addToBasketButton: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    addToBasketText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default ProductPage;