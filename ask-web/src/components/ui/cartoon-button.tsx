import React from 'react';

interface CartoonButtonProps {
  label: string;
  color?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function CartoonButton({ 
  label, 
  color = "bg-gray-400", 
  disabled = false, 
  onClick 
}: CartoonButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-3 rounded-lg font-medium text-white transition-all duration-200
        ${disabled 
          ? 'bg-blue-500 cursor-not-allowed transform scale-95' 
          : `${color} hover:opacity-80 hover:transform hover:scale-105 active:scale-95`
        }
        shadow-lg
      `}
    >
      {label}
    </button>
  );
} 