import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFavourites } from '../contexts/FavouriteContext'; // Import FavouriteContext
import { useCart } from '../contexts/CartContext'; // Import CartContext
import { useRouter } from 'expo-router'; // Import useRouter để điều hướng

const FavouriteScreen: React.FC = () => {
    const { favouriteItems, removeFromFavourites } = useFavourites(); // Lấy danh sách yêu thích và hàm xóa
    const { addToCart } = useCart(); // Lấy hàm thêm vào giỏ hàng
    const router = useRouter(); // Sử dụng router để điều hướng

    // Hàm xử lý khi nhấn "Add All To Cart"
    const handleAddAllToCart = () => {
        favouriteItems.forEach((item) => {
            addToCart({
                ...item,
                quantity: 1, // Mặc định thêm 1 sản phẩm cho mỗi mục yêu thích
            });
        });
        router.push('/mycart'); // Điều hướng đến màn hình giỏ hàng sau khi thêm
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Favourite</Text>
            </View>

            {/* Items List */}
            <ScrollView style={styles.list}>
                {favouriteItems.length === 0 ? (
                    <Text style={styles.emptyText}>You have no favourite items</Text>
                ) : (
                    favouriteItems.map((item, index) => (
                        <View key={index} style={styles.item}>
                            <TouchableOpacity
                                style={styles.itemContent}
                                onPress={() =>
                                    router.push({
                                        pathname: '/productdetail',
                                        params: {
                                            title: item.title,
                                            subtitle: item.subtitle,
                                            price: item.price,
                                            image: item.title, // Truyền title để map hình ảnh trong productdetail
                                        },
                                    })
                                }
                            >
                                <Image source={item.image} style={styles.itemImage} />
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName}>{item.title}</Text>
                                    <Text style={styles.itemSize}>{item.subtitle}</Text>
                                </View>
                                <Text style={styles.itemPrice}>{item.price}</Text>
                                <AntDesign name="right" size={24} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => removeFromFavourites(item.title)}>
                                <AntDesign name="heart" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add All To Cart Button */}
            {favouriteItems.length > 0 && (
                <TouchableOpacity style={styles.addButton} onPress={handleAddAllToCart}>
                    <Text style={styles.addButtonText}>Add All To Cart</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        alignItems: 'center',
    },
    list: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemImage: {
        width: 50,
        height: 50,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 16,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemSize: {
        color: 'gray',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    addButton: {
        width: '80%',
        padding: 20,
        backgroundColor: '#53B175',
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        marginLeft: 38,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default FavouriteScreen;