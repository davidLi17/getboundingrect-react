import { Card } from "../types";

export const generateCards = (count = 5): Card[] => {
  const colors = [
    {
      bg: "bg-red-50",
      border: "border-red-400",
      badge: "bg-red-100 text-red-700",
    },
    {
      bg: "bg-blue-50",
      border: "border-blue-400",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      bg: "bg-green-50",
      border: "border-green-400",
      badge: "bg-green-100 text-green-700",
    },
    {
      bg: "bg-purple-50",
      border: "border-purple-400",
      badge: "bg-purple-100 text-purple-700",
    },
    {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      badge: "bg-yellow-100 text-yellow-700",
    },
  ];

  return Array.from({ length: count }, (_, i) => {
    const color = colors[i % colors.length];
    return {
      id: i + 1,
      title: `卡片 #${i + 1}`,
      description: `这是第 ${
        i + 1
      } 个演示卡片，用来展示 getBoundingClientRect() API`,
      icon: [
        "fa-box",
        "fa-cube",
        "fa-layer-group",
        "fa-square",
        "fa-rectangle",
      ][i % 5] as any,
      ...color,
    };
  });
};
