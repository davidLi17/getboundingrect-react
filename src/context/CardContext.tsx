import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BoundingRect } from '../types';

interface CardVisibilityState {
  [cardId: number]: {
    rect: BoundingRect;
    isInViewport: boolean;
  };
}

interface CardContextType {
  cardVisibility: CardVisibilityState;
  updateCardVisibility: (cardId: number, rect: BoundingRect, isInViewport: boolean) => void;
  hoveredCard: { id: number; rect: BoundingRect } | null;
  setHoveredCard: (card: { id: number; rect: BoundingRect } | null) => void;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

interface CardProviderProps {
  children: ReactNode;
}

export const CardProvider: React.FC<CardProviderProps> = ({ children }) => {
  const [cardVisibility, setCardVisibility] = useState<CardVisibilityState>({});
  const [hoveredCard, setHoveredCard] = useState<{ id: number; rect: BoundingRect } | null>(null);

  const updateCardVisibility = useCallback((cardId: number, rect: BoundingRect, isInViewport: boolean) => {
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: { rect, isInViewport }
    }));
  }, []);

  const value = {
    cardVisibility,
    updateCardVisibility,
    hoveredCard,
    setHoveredCard
  };

  return (
    <CardContext.Provider value={value}>
      {children}
    </CardContext.Provider>
  );
};

export const useCardContext = () => {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCardContext must be used within a CardProvider');
  }
  return context;
};