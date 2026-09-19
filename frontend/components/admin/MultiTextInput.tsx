"use client";

import { useState } from "react";

interface MultiTextInputProps {
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiTextInput({
  value,
  onChange,
  placeholder = "Type and press Enter...",
}: MultiTextInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();

      // Prevent duplicates
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }

      setInput("");
    }

    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeValue = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 focus-within:border-blue-500 dark:border-gray-700 dark:bg-gray-900">
        {value.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          >
            {item}

            <button
              type="button"
              onClick={() => removeValue(index)}
              className="ml-1 text-blue-500 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent px-1 py-1 text-sm outline-none"
        />
      </div>
    </div>
  );
}
