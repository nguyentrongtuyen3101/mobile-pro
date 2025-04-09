// Import thư viện `Tabs` từ `expo-router` để tạo thanh điều hướng dạng tab
import { Tabs } from "expo-router";
// Import FontAwesome để sử dụng các icon
import { FontAwesome } from "@expo/vector-icons";
// Import UserProvider từ UserContext
import { UserProvider } from "../contexts/UserContext";

// Component `TabLayout` chứa thanh điều hướng của ứng dụng
export default function TabLayout() {
  return (
      <Tabs>
        {/* Tab đầu tiên - Trang chính (Shop) */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Shop",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="shopping-bag" size={size} color={color} />
            ),
          }}
        />

        {/* Tab thứ hai - Trang Khám phá (Explore) */}
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="search" size={size} color={color} />
            ),
          }}
        />

        {/* Tab thứ ba - Giỏ hàng (Mycart) */}
        <Tabs.Screen
          name="mycart"
          options={{
            title: "Mycart",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="shopping-cart" size={size} color={color} />
            ),
          }}
        />

        {/* Tab thứ tư - Danh sách yêu thích (Favourite) */}
        <Tabs.Screen
          name="favourite"
          options={{
            title: "Favourite",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="heart" size={size} color={color} />
            ),
          }}
        />

        {/* Tab thứ năm - Tài khoản (Account) */}
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
  );
}