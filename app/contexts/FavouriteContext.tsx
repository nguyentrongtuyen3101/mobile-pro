import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FavouriteItem {
    title: string;
    subtitle: string;
    price: string;
    image: any;
}

interface FavouriteContextValue {
    favouriteItems: FavouriteItem[];
    addToFavourites: (item: FavouriteItem) => void;
    removeFromFavourites: (title: string) => void;
}

const FavouriteContext = createContext<FavouriteContextValue | undefined>(undefined);

interface FavouriteProviderProps {
    children: ReactNode;
}

export const FavouriteProvider: React.FC<FavouriteProviderProps> = ({ children }) => {
    const [favouriteItems, setFavouriteItems] = useState<FavouriteItem[]>([]);

    const addToFavourites = (item: FavouriteItem) => {
        setFavouriteItems((prevItems) => {
            // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
            const existingItem = prevItems.find((favItem) => favItem.title === item.title);
            if (!existingItem) {
                return [...prevItems, item];
            }
            return prevItems; // Nếu đã có, không thêm lại
        });
    };

    const removeFromFavourites = (title: string) => {
        setFavouriteItems((prevItems) => prevItems.filter((item) => item.title !== title));
    };

    return (
        <FavouriteContext.Provider value={{ favouriteItems, addToFavourites, removeFromFavourites }}>
            {children}
        </FavouriteContext.Provider>
    );
};

export const useFavourites = (): FavouriteContextValue => {
    const context = useContext(FavouriteContext);
    if (!context) {
        throw new Error('useFavourites must be used within a FavouriteProvider');
    }
    return context;
};