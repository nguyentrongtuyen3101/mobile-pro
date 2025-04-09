import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from './contexts/CartContext';

// Định nghĩa kiểu cho item
interface Item {
    title: string;
    subtitle: string;
    price: string;
    image: any;
}

const AllProducts: React.FC = () => {
    const router = useRouter();
    const { title, items } = useLocalSearchParams();
    const { addToCart } = useCart();

    // Parse items từ JSON string về mảng object
    const parsedItems: Item[] = items ? JSON.parse(items as string) : [];

    // State để lưu từ khóa tìm kiếm
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Lọc danh sách sản phẩm dựa trên từ khóa tìm kiếm
    const filteredItems = parsedItems.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Hàm xử lý khi nhấn nút "add"
    const handleAddToCart = (item: Item) => {
        addToCart(item);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Text style={styles.header}>{title as string}</Text>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
            </View>

            {/* Danh sách sản phẩm */}
            <FlatList
                data={filteredItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            router.push({
                                pathname: '/productdetail',
                                params: {
                                    title: item.title,
                                    price: item.price,
                                    image: item.title,
                                    subtitle: item.subtitle,
                                },
                            })
                        }
                    >
                        <Image source={item.image} style={styles.cardImage} />
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                        <View style={styles.cardFooter}>
                            <Text style={styles.cardPrice}>{item.price}</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => handleAddToCart(item)}
                            >
                                <Ionicons name="add" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No products found.</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    card: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    cardImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    cardSubtitle: {
        fontSize: 14,
        color: 'gray',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B00',
    },
    addButton: {
        backgroundColor: '#FF6B00',
        padding: 8,
        borderRadius: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
});

export default AllProducts;