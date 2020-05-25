import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const loadedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (loadedProducts) {
        setProducts(JSON.parse(loadedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const data = [...products, product];

      const searchProduct = data.findIndex(item => item.id === product.id);

      if (searchProduct >= 0) {
        data[searchProduct].quantity += 1;
      } else {
        data.push({ ...product, quantity: 1 });
      }

      setProducts(data);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(data),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const incrementCart = [...products];

      const searchProduct = incrementCart.findIndex(item => item.id === id);

      if (searchProduct >= 0) {
        incrementCart[searchProduct].quantity += 1;

        setProducts(incrementCart);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementCard = [...products];

      const searchProduct = decrementCard.findIndex(item => item.id === id);

      if (searchProduct >= 0) {
        decrementCard[searchProduct].quantity -= 1;

        setProducts(decrementCard);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
