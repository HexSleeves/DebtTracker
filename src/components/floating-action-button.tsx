"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useMemo, useState } from "react";

export interface ActionItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  color: string;
  onClick?: (context: FloatingActionContext) => void;
}

export interface FloatingActionContext {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (hoveredIndex: number | null) => void;
}

export interface FloatingActionButtonProps {
  actionItems: ActionItem[];
}

const getActionPosition = (index: number, total: number) => {
  const radius = 80;
  const startAngle = Math.PI; // Start from left (180 degrees)
  const endAngle = Math.PI / 2; // End at right (90 degrees)
  const angle = startAngle - (index / (total - 1)) * (startAngle - endAngle);

  return {
    x: Math.cos(angle) * radius,
    y: -Math.abs(Math.sin(angle)) * radius, // Negative Y to go upward
  };
};

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actionItems = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const context: FloatingActionContext = useMemo(() => {
    return {
      isOpen,
      setIsOpen,
      hoveredIndex,
      setHoveredIndex,
    };
  }, [isOpen, hoveredIndex]);

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {/* Action Items */}
      <AnimatePresence>
        {isOpen &&
          actionItems.map((item, index) => {
            const position = getActionPosition(index, actionItems.length);

            const ActionButton = (
              <motion.button
                className={`${item.color} focus:ring-opacity-50 relative transform rounded-full p-3 text-white shadow-lg transition-all duration-200 focus:ring-2 focus:ring-white focus:outline-none`}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick(context);
                  }
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon}
              </motion.button>
            );

            return (
              <motion.div
                key={item.label}
                className="absolute"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: position.x,
                  y: position.y,
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.05,
                }}
                style={{
                  transformOrigin: "center",
                  zIndex: 100 + (actionItems.length - index), // Higher z-index for leftmost buttons
                }}
              >
                {item.href ? (
                  <Link href={item.href} onClick={() => setIsOpen(false)}>
                    {ActionButton}
                  </Link>
                ) : (
                  ActionButton
                )}

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-1 text-sm whitespace-nowrap text-white shadow-lg"
                      style={{ zIndex: 9999 }}
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      {item.label}
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-900" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className="focus:ring-opacity-50 relative z-10 rounded-full bg-indigo-600 p-4 text-white shadow-lg transition-all duration-200 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        onClick={toggleMenu}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isOpen ? 45 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <Plus size={24} />
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-opacity-20 fixed inset-0 -z-10 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionButton;
