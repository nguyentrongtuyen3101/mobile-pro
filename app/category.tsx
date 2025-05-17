// CategoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCart } from './contexts/CartContext';
import { useUser } from './contexts/UserContext';
import SanPhamService from '../services/sanphamservice';
import { addToCart } from '../services/muasamservice';
import baseurl from '../baseurl';

interface Product {
  id: number;
  tenSanPham: string;
  moTa: string;
  giaTien: number;
  duongDanAnh: string;
  soLuong: number;
  donVi: string;
}

const CategoryScreen = () => {
  const { title, idLoai } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart: addToCartContext } = useCart();
  const { user } = useUser();

  const categoryTitle: string = title ? decodeURIComponent(title as string) : 'Products';
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchProducts = async () => {
    try {
      if (!idLoai) {
        console.error('Missing idLoai parameter');
        return;
      }
      const id = parseInt(idLoai as string);
      const data: Product[] = await SanPhamService.getSanPhamByIdLoai(id);
      setProducts(data);
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [idLoai]);

  const productsByDonVi = products.reduce((acc, product) => {
    (acc[product.donVi] = acc[product.donVi] || []).push(product);
    return acc;
  }, {} as { [key: string]: Product[] });

  const filteredProductsByDonVi = Object.entries(productsByDonVi).map(([donVi, items]) => ({
    donVi,
    data: items.filter(product =>
      product.tenSanPham.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(group => group.data.length > 0);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      router.push('/login');
      return;
    }

    const request = {
      sanPhamId: product.id,
      soLuong: 1,
    };

    try {
      const success = await addToCart(request); // Sử dụng hàm từ muasamservice
      if (success) {
        const productData = {
          id: product.id,
          title: product.tenSanPham,
          subtitle: `${product.soLuong} ${product.donVi}`,
          price: `$${product.giaTien}`,
          image: { uri: `${baseurl}${product.duongDanAnh}` },
          quantity: 1,
        };
        addToCartContext(productData); // Đồng bộ với CartContext
        alert('Đã thêm sản phẩm vào giỏ hàng!');
      } else {
        throw new Error('Không thể thêm vào giỏ hàng');
      }
    } catch (err: any) {
      console.error('Lỗi khi thêm vào giỏ hàng:', err.message);
      alert(`Lỗi khi thêm vào giỏ hàng: ${err.message}`);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        console.log('Navigating to product detail with ID:', item.id);
        router.push({
          pathname: '/productdetail',
          params: { id: item.id },
        });
      }}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: `${baseurl}${item.duongDanAnh}` }} style={styles.image} />
      </View>
      <Text style={styles.name}>{item.tenSanPham}</Text>
      <Text style={styles.size}>{item.soLuong} {item.donVi}</Text>
      <View style={styles.footer}>
        <Text style={styles.price}>${item.giaTien}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
          <FontAwesome name="plus" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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

      <ScrollView>
        {filteredProductsByDonVi.length > 0 ? (
          filteredProductsByDonVi.map((group, index) => (
            <View key={index} style={styles.groupContainer}>
              <Text style={styles.sectionHeader}></Text>
              <FlatList
                data={group.data}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                renderItem={renderProduct}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found.</Text>
          </View>
        )}
      </ScrollView>
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
        backgroundColor: '#EC870E',
        padding: 10,
    },
    header: {
        fontSize: 28,
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
    groupContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingVertical: 5,
        paddingHorizontal: 10,
        color: '#333',
        display: 'none',
    },
    row: {
        justifyContent: 'space-between',
    },
    productCard: {
        flex: 1,
        backgroundColor: '#FFFBD1',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        width: 145,
        height: 130,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#000000',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
        marginTop: 5,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#008080',
    },
    addButton: {
        backgroundColor: '#008080',
        padding: 8,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
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