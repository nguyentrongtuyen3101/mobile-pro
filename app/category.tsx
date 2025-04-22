import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCart } from './contexts/CartContext';
import { useUser } from './contexts/UserContext'; // Thêm useUser
import IP_ADDRESS from '../ipv4';

interface Product {
    id: number;
    loai: string;
    tenSanPham: string;
    moTa: string;
    giaTien: number;
    duongDanAnh: string;
    soLuong: number;
}

const CategoryScreen = () => {
    const { title } = useLocalSearchParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { user } = useUser(); // Thêm useUser

    const categoryTitle: string = title ? decodeURIComponent(title as string) : "Products";
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const loaiMap: Record<string, string> = {
        "Frash Fruits & Vegetable": "RAU_CU_QUA",
        "Dairy & Eggs": "TRUNG_SUA",
        "Cooking Oil & Ghee": "DAU_AN",
        "Meat & Fish": "THIT_CA",
        "Bakery & Snacks": "BANH_MI_DO_AN_NHE",
        "Beverages": "DO_UONG",
    };

    const fetchProducts = async () => {
        try {
            const loai = loaiMap[categoryTitle];
            if (!loai) {
                console.error("Invalid category title:", categoryTitle);
                return;
            }
            const response = await fetch(`http://${IP_ADDRESS}:8080/API_for_mobile/api/checkmobile/sanpham/theoloai?loai=${loai}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch products: ${errorText}`);
            }
            const data: Product[] = await response.json();
            console.log("Fetched products:", data);
            setProducts(data);
        } catch (error: any) {
            console.error("Error fetching products:", error.message);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [categoryTitle]);

    const filteredProducts = products.filter((product) =>
        product.tenSanPham.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddToCart = async (product: Product) => {
        if (!user) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            router.push("/login");
            return;
        }

        const cartData = {
            accountId: parseInt(user.id),
            sanPhamId: product.id,
            soLuong: 1,
        };

        try {
            const response = await fetch(`http://${IP_ADDRESS}:8080/API_for_mobile/api/checkmobile/themgiohang`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cartData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Lỗi khi gọi API thêm giỏ hàng: ${response.status} - ${errorText}`);
                throw new Error(`Không thể thêm vào giỏ hàng: ${errorText}`);
            }

            const result = await response.json();
            console.log("Thêm vào giỏ hàng thành công:", result);

            const productData = {
                id: product.id,
                title: product.tenSanPham,
                subtitle: `${product.soLuong} items`,
                price: `$${product.giaTien}`,
                image: { uri: `http://${IP_ADDRESS}:8080/API_for_mobile/api${product.duongDanAnh}` },
                quantity: result.soLuong,
            };
            addToCart(productData);

            alert("Đã thêm sản phẩm vào giỏ hàng!");
        } catch (err: any) {
            console.error("Lỗi khi thêm vào giỏ hàng:", err);
            alert(`Lỗi khi thêm vào giỏ hàng: ${err.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleicon}>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign name="left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.header}>{categoryTitle}</Text>
                <TouchableOpacity onPress={() => router.push('/mycart')}>
                    <AntDesign name="right" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <AntDesign name="search1" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={({ item }: { item: Product }) => (
                    <TouchableOpacity
                        style={styles.productCard}
                        onPress={() => {
                            console.log("Navigating to product detail with ID:", item.id);
                            router.push({
                                pathname: '/productdetail',
                                params: {
                                    id: item.id,
                                },
                            });
                        }}
                    >
                        <Image
                            source={{ uri: `http://${IP_ADDRESS}:8080/API_for_mobile/api${item.duongDanAnh}` }}
                            style={styles.image}
                        />
                        <Text style={styles.name}>{item.tenSanPham}</Text>
                        <Text style={styles.size}>{item.soLuong} items</Text>
                        <View style={styles.footer}>
                            <Text style={styles.price}>${item.giaTien}</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => handleAddToCart(item)}
                            >
                                <FontAwesome name="plus" size={16} color="white" />
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
    titleicon: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    productCard: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
    },
    size: {
        fontSize: 14,
        color: 'gray',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#53B175',
    },
    addButton: {
        backgroundColor: '#53B175',
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

export default CategoryScreen;