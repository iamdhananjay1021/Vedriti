import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PujaKit } from '../data/mockData';

export const MAX_QTY_PER_ITEM = 20;

export interface CartLine {
  kit: PujaKit;
  quantity: number;
}

interface CartContextType {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (kit: PujaKit, quantity?: number) => boolean;
  setQuantity: (kitId: string, quantity: number) => void;
  remove: (kitId: string) => void;
  clear: () => void;
  syncWithCatalog: (kits: PujaKit[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const limitFor = (kit: PujaKit) => Math.max(0, Math.min(MAX_QTY_PER_ITEM, kit.stockQuantity));

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback(
    (kit: PujaKit, quantity = 1) => {
      const limit = limitFor(kit);
      if (!kit.inStock || limit === 0) return false;
      const existing = lines.find((l) => l.kit.id === kit.id);
      if (existing && existing.quantity >= limit) return false;
      setLines((prev) => {
        const current = prev.find((l) => l.kit.id === kit.id);
        if (current) {
          return prev.map((l) => (l.kit.id === kit.id ? { kit, quantity: Math.min(limit, l.quantity + quantity) } : l));
        }
        return [...prev, { kit, quantity: Math.min(limit, quantity) }];
      });
      return true;
    },
    [lines]
  );

  const setQuantity = useCallback((kitId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.kit.id === kitId ? { ...l, quantity: Math.min(limitFor(l.kit), quantity) } : l))
        .filter((l) => l.quantity > 0)
    );
  }, []);

  const remove = useCallback((kitId: string) => {
    setLines((prev) => prev.filter((l) => l.kit.id !== kitId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const syncWithCatalog = useCallback((kits: PujaKit[]) => {
    setLines((prev) =>
      prev
        .map((l) => {
          const fresh = kits.find((k) => k.id === l.kit.id);
          if (!fresh) return null;
          return { kit: fresh, quantity: Math.min(limitFor(fresh), l.quantity) };
        })
        .filter((l): l is CartLine => Boolean(l && l.quantity > 0))
    );
  }, []);

  const value = useMemo(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.kit.price, 0);
    return { lines, count, subtotal, add, setQuantity, remove, clear, syncWithCatalog };
  }, [lines, add, setQuantity, remove, clear, syncWithCatalog]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
