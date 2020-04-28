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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@GoMarketPLace:product');

      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      setProducts(state => {
        const checkExist = state.find(p => p.id === product.id);

        if (checkExist) {
          checkExist.quantity = +1;

          return state.map(p => {
            if (p.id === product.id) {
              return { ...product, quantity: checkExist.quantity };
            }
            return { ...product, quantity: 1 };
          });
        }
        return [...state, { ...product, quantity: 1 }];
      });

      await AsyncStorage.setItem(
        '@GoMarketPLace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const addNewProduct = await products.map(p => {
        if (p.id === id) {
          return { ...p, quantity: p.quantity + 1 };
        }
        return p;
      });

      await setProducts(addNewProduct);

      await AsyncStorage.setItem(
        '@GoMarketPLace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementProduct = await products.map(p => {
        if (p.id === id) {
          return { ...p, quantity: p.quantity - 1 };
        }
        return p;
      });

      setProducts(decrementProduct);

      await AsyncStorage.setItem(
        '@GoMarketPLace:products',
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
