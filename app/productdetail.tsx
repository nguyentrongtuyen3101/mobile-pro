import React, { useState } from 'react';
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

// Map hình ảnh - Sử dụng key chữ thường để chuẩn hóa
const imageMap: Record<string, any> = {
    'apple': require('../assets/images/apple.png'),
    'carrot': require('../assets/images/coka.png'),
    'coca cola': require('../assets/images/coka.png'),
    'orange juice': require('../assets/images/coka.png'),
    'organic bananas': require('../assets/images/banana.png'),
    'red apple': require('../assets/images/apple.png'),
    'bell pepper red': require('../assets/images/bell_pepper.png'),
    'ginger': require('../assets/images/ginger.png'),
    'beef bone': require('../assets/images/beefBone.png'),
    'broiler chicken': require('../assets/images/boiler_chicken.png'),
};

const ProductPage: React.FC = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { addToFavourites, removeFromFavourites, favouriteItems } = useFavourites();

    // Xử lý các giá trị params để đảm bảo chúng là string
    const title = Array.isArray(params.title) ? params.title[0] : params.title || 'Unknown Product';
    const subtitle = Array.isArray(params.subtitle) ? params.subtitle[0] : params.subtitle || '';
    const price = Array.isArray(params.price) ? params.price[0] : params.price || '$0.00';
    const imageKeyRaw = Array.isArray(params.image) ? params.image[0] : params.image || 'red apple';

    // Chuẩn hóa imageKey: bỏ khoảng trắng thừa và chuyển về chữ thường
    const imageKey = imageKeyRaw.trim().toLowerCase();
    const finalImageKey = isNaN(Number(imageKey)) ? imageKey : title.toLowerCase();

    // Debug
    console.log('imageKeyRaw:', imageKeyRaw);
    console.log('finalImageKey:', finalImageKey);
    console.log('imageMap[finalImageKey]:', imageMap[finalImageKey]);
    console.log('Available keys in imageMap:', Object.keys(imageMap));

    const [liked, setLiked] = useState(favouriteItems.some((item) => item.title === title));
    const [quantity, setQuantity] = useState(1);

    // Lấy ảnh từ map, nếu không có thì dùng ảnh mặc định
    const imageSource = imageMap[finalImageKey] || require('../assets/images/apple.png');

    // Hàm xử lý khi nhấn nút thích
    const handleLikePress = () => {
        const product = {
            title,
            subtitle,
            price,
            image: imageSource,
        };

        if (liked) {
            removeFromFavourites(title);
        } else {
            addToFavourites(product);
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
        const product = {
            title,
            subtitle,
            price,
            image: imageSource,
            quantity,
        };
        addToCart(product);
        router.push('/mycart');
    };

    // Hàm xử lý quay lại màn hình trước đó
    const handleGoBack = () => {
        router.back();
    };

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
                    <Image source={imageSource} style={styles.productImage} />
                </View>
                {/* Product Info */}
                <View style={styles.productInfo}>
                    <View style={styles.productHeader}>
                        <View>
                            <Text style={styles.productTitle}>{title}</Text>
                            <Text style={styles.productSubtitle}>{subtitle}</Text>
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
                        <Text style={styles.productPrice}>{price}</Text>
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
                                Apples Are Nutritious. Apples May Be Good For Weight Loss.
                                Apples May Be Good For Your Heart. As Part Of A Healthful And Varied Diet.
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
    imageContainer: {
        padding: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
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