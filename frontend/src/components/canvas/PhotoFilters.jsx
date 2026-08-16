import React from 'react';

const PhotoFilters = ({ filter, setFilter }) => {
  const filters = [
    { value: 'none', label: 'No Filter' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'sepia', label: 'Sepia' },
    { value: 'invert', label: 'Invert' },
    { value: 'blur(2px)', label: 'Blur' },
    { value: 'brightness(1.2)', label: 'Bright' },
    { value: 'contrast(1.5)', label: 'High Contrast' },
  ];

  return (
    <div>
      <h3 className="font-bold mb-2">Photo Filters</h3>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-2 py-1 border rounded w-full"
      >
        {filters.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PhotoFilters;