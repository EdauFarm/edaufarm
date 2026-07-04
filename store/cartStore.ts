'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          // Prevent negative or zero quantities
          if (item.quantity <= 0) return state;

          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variant === item.variant
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += item.quantity;
            // Ensure quantity doesn't go negative
            if (newItems[existingIndex].quantity <= 0) {
              newItems[existingIndex].quantity = 1;
            }
            return { items: newItems };
          }

          return { items: [...state.items, item] };
        }),
      removeItem: (productId, variant) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variant === variant)
          ),
        })),
      updateQuantity: (productId, quantity, variant) =>
        set((state) => {
          // Prevent negative quantities - remove item if quantity is 0 or less
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) => !(item.productId === productId && item.variant === variant)
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId && item.variant === variant
                ? { ...item, quantity: Math.max(1, quantity) } // Ensure minimum quantity of 1
                : item
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      total: () => {
        const items = get().items;
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      itemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
