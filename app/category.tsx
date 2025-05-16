import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCart } from './contexts/CartContext';
import { useUser } from './contexts/UserContext';
import SanPhamService from '../services/sanphamservice';
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
  const { addToCart } = useCart();
  const { user } = useUser();

  const categoryTitle: string = title ? decodeURIComponent(title as string) : "Products";
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchProducts = async () => {
    try {
      if (!idLoai) {
        console.error("Missing idLoai parameter");
        return;
      }
      const id = parseInt(idLoai as string);
      const data: Product[] = await SanPhamService.getSanPhamByIdLoai(id);
      setProducts(data);
    } catch (error: any) {
      console.error("Error fetching products:", error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [idLoai]);

  // Nhóm sản phẩm theo donVi
  const productsByDonVi = products.reduce((acc, product) => {
    (acc[product.donVi] = acc[product.donVi] || []).push(product);
    return acc;
  }, {} as { [key: string]: Product[] });

  // Lọc sản phẩm theo searchQuery
  const filteredProductsByDonVi = Object.entries(productsByDonVi).map(([donVi, items]) => ({
    donVi,
    data: items.filter(product =>
      product.tenSanPham.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(group => group.data.length > 0);

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
      const response = await fetch(`${baseurl}/sanphammanger/themgiohang`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể thêm vào giỏ hàng: ${errorText}`);
      }

      const result = await response.json();
      console.log("Thêm vào giỏ hàng thành công:", result);

      const productData = {
        id: product.id,
        title: product.tenSanPham,
        subtitle: `${product.soLuong} ${product.donVi}`,
        price: `$${product.giaTien}`,
        image: { uri: `${baseurl}${product.duongDanAnh}` },
        quantity: result.soLuong,
      };
      addToCart(productData);

      alert("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (err: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      alert(`Lỗi khi thêm vào giỏ hàng: ${err.message}`);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        console.log("Navigating to product detail with ID:", item.id);
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
              <Text style={styles.sectionHeader}></Text> {/* Ẩn tiêu đề donVi */}
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
  // Style cho phần tiêu đề và nút điều hướng trên cùng
  titleicon: {
    flexDirection: 'row', // Sắp xếp các phần tử theo hàng ngang
    justifyContent: 'space-between', // Phân bố khoảng cách đều giữa các phần tử
    alignItems: 'center', // Căn giữa theo chiều dọc
    padding: 10, // Padding 10px quanh các cạnh
  },

  // Style cho container chính của màn hình
  container: {
    flex: 1, // Chiếm toàn bộ chiều cao màn hình
    backgroundColor: '#EC870E', // Màu nền trắng
    padding: 10, // Padding 10px quanh các cạnh
  },

  // Style cho tiêu đề danh mục
  header: {
    fontSize: 28, // Kích thước chữ 22px
    fontWeight: 'bold', // Chữ in đậm
    textAlign: 'center', // Căn giữa văn bản
    marginBottom: 10, // Khoảng cách dưới 10px
  },

  // Style cho container tìm kiếm
  searchContainer: {
    flexDirection: 'row', // Sắp xếp icon và input theo hàng ngang
    alignItems: 'center', // Căn giữa theo chiều dọc
    backgroundColor: '#f0f0f0', // Màu nền xám nhạt
    borderRadius: 10, // Bo góc 10px
    paddingHorizontal: 10, // Padding ngang 10px
    marginBottom: 10, // Khoảng cách dưới 10px
  },

  // Style cho icon tìm kiếm
  searchIcon: {
    marginRight: 10, // Khoảng cách phải 10px
  },

  // Style cho ô nhập liệu tìm kiếm
  searchInput: {
    flex: 1, // Chiếm toàn bộ không gian còn lại
    height: 40, // Chiều cao 40px
    fontSize: 16, // Kích thước chữ 16px
  },

  // Style cho container của mỗi nhóm sản phẩm
  groupContainer: {
    marginBottom: 20, // Khoảng cách dưới 20px giữa các nhóm
  },

  // Style cho tiêu đề nhóm (đã ẩn)
  sectionHeader: {
    fontSize: 18, // Kích thước chữ 18px
    fontWeight: 'bold', // Chữ in đậm
    paddingVertical: 5, // Padding dọc 5px
    paddingHorizontal: 10, // Padding ngang 10px
    color: '#333', // Màu chữ xám đậm
    display: 'none', // Ẩn tiêu đề (theo yêu cầu)
  },

  // Style cho wrapper của các cột trong FlatList
  row: {
    justifyContent: 'space-between', // Phân bố khoảng cách đều giữa các cột
  },

  // Style cho thẻ sản phẩm
  productCard: {
    flex: 1, // Chiếm không gian theo tỷ lệ
    backgroundColor: '#FFFBD1', // Màu nền xám nhạt
    borderRadius: 10, // Bo góc 10px
    padding: 10, // Padding 10px quanh các cạnh
    margin: 5, // Margin 5px quanh các cạnh
    alignItems: 'center', // Căn giữa nội dung
    shadowColor: '#000', // Màu bóng đổ (đen)
    shadowOffset: { width: 0, height: 2 }, // Độ lệch bóng (chiều cao 2px)
    shadowOpacity: 0.2, // Độ mờ bóng
    shadowRadius: 4, // Bán kính bóng
    elevation: 3, // Độ nâng cho Android
  },

  // Style cho container của hình ảnh
  imageContainer: {
    width: 145, // Chiều rộng cố định 100px
    height: 130, // Chiều cao cố định 100px
    borderRadius: 10, // Bo góc 10px
    overflow: 'hidden', // Ẩn phần vượt ra ngoài khung
    borderWidth: 1,
    borderColor: '#000000',
  },

  // Style cho hình ảnh
  image: {
    width: '100%', // Chiếm toàn bộ chiều rộng container
    height: '100%', // Chiếm toàn bộ chiều cao container
    resizeMode: 'cover', // Co dãn lấp đầy khung, cắt bớt nếu cần
  },

  // Style cho tên sản phẩm
  name: {
    fontSize: 16, // Kích thước chữ 16px
    fontWeight: 'bold', // Chữ in đậm
    textAlign: 'center', // Căn giữa văn bản
    marginTop: 5, // Khoảng cách trên 5px
  },

  // Style cho số lượng và đơn vị
  size: {
    fontSize: 14, // Kích thước chữ 14px
    color: 'gray', // Màu chữ xám
  },

  // Style cho footer của thẻ sản phẩm
  footer: {
    flexDirection: 'row', // Sắp xếp giá và nút theo hàng ngang
    justifyContent: 'space-between', // Phân bố khoảng cách đều
    alignItems: 'center', // Căn giữa theo chiều dọc
    width: '100%', // Chiếm toàn bộ chiều rộng
    marginTop: 5, // Khoảng cách trên 10px
  },

  // Style cho giá tiền
  price: {
    fontSize: 16, // Kích thước chữ 16px
    fontWeight: 'bold', // Chữ in đậm
    color: '#008080', // Màu xanh lá
  },

  // Style cho nút thêm vào giỏ hàng
  addButton: {
    backgroundColor: '#008080', // Màu nền xanh lá
    padding: 8, // Padding 8px quanh các cạnh
    borderRadius: 5, // Bo góc 5px
    shadowColor: '#000', // Màu bóng đổ (đen)
    shadowOffset: { width: 0, height: 5 }, // Độ lệch bóng (chiều cao 2px)
  },

  // Style cho container khi không có sản phẩm
  emptyContainer: {
    flex: 1, // Chiếm toàn bộ không gian
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
    marginTop: 20, // Khoảng cách trên 20px
  },

  // Style cho thông báo khi không có sản phẩm
  emptyText: {
    fontSize: 16, // Kích thước chữ 16px
    color: 'gray', // Màu chữ xám
  },
});
export default CategoryScreen;