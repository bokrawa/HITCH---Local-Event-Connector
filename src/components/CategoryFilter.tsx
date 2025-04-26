import React from 'react';
import { Tag } from 'lucide-react';

interface CategoryFilterProps {
  categories: { name: string; count: number }[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory,
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center text-sm font-medium text-gray-700">
        <Tag className="h-4 w-4 mr-2" />
        <span>Categories</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(({ name, count }) => (
          <button
            key={name}
            onClick={() => onToggleCategory(name)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategories.includes(name)
                ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{name}</span>
            <span className="ml-2 text-xs opacity-75">({count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}