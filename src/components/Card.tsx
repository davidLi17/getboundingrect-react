import React, { useRef, useEffect, memo, useCallback } from "react";
import { Card as CardType, BoundingRect } from "../types";
import { useElementPosition } from "../hooks/useElementPosition";
import { useCardContext } from "../context/CardContext";

interface CardProps {
  card: CardType;
  onClick: (cardId: number, rect: BoundingRect) => void;
}

export const Card = memo<CardProps>(({ card, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const position = useElementPosition(cardRef);
  const { updateCardVisibility, setHoveredCard } = useCardContext();

  useEffect(() => {
    if (position) {
      updateCardVisibility(card.id, position.rect, position.isInViewport);
    }
  }, [position, card.id, updateCardVisibility]);

  const handleMouseEnter = useCallback(() => {
    if (position) {
      setHoveredCard({ id: card.id, rect: position.rect });
    }
  }, [position, card.id, setHoveredCard]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCard(null);
  }, [setHoveredCard]);

  const handleClick = useCallback(() => {
    if (position) {
      onClick(card.id, position.rect);
    }
  }, [position, card.id, onClick]);

  // 从 position 中解构，如果 position 为 null 则使用默认值
  const rect = position?.rect ?? {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  };
  const isInViewport = position?.isInViewport ?? false;
  const status = position?.status ?? "检测中...";

  return (
    <div
      ref={cardRef}
      className={`card-item ${card.bg} border-l-4 ${
        card.border
      } p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all ${
        isInViewport ? "in-viewport" : "out-viewport"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <i className={`fas ${card.icon} text-2xl`}></i>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">{card.title}</h3>
            <span className={`${card.badge} text-xs px-2 py-1 rounded`}>
              ID: {card.id}
            </span>
          </div>
          <p className="text-gray-700 text-sm mb-3">{card.description}</p>

          <div className="bg-white bg-opacity-60 p-3 rounded text-xs position-indicator">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-red-600">
                <strong>top:</strong>{" "}
                <span className="top-val">{Math.round(rect.top)}</span>px
              </div>
              <div className="text-blue-600">
                <strong>left:</strong>{" "}
                <span className="left-val">{Math.round(rect.left)}</span>px
              </div>
              <div className="text-green-600">
                <strong>bottom:</strong>{" "}
                <span className="bottom-val">{Math.round(rect.bottom)}</span>px
              </div>
              <div className="text-purple-600">
                <strong>right:</strong>{" "}
                <span className="right-val">{Math.round(rect.right)}</span>px
              </div>
              <div className="text-yellow-600">
                <strong>width:</strong>{" "}
                <span className="width-val">{Math.round(rect.width)}</span>px
              </div>
              <div className="text-indigo-600">
                <strong>height:</strong>{" "}
                <span className="height-val">{Math.round(rect.height)}</span>px
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-300 text-gray-600">
              <p>
                📊 状态: <strong className="status">{status}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
