import React from 'react';
import { CaptionStyle } from '../types';

interface CaptionStylerProps {
  style: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
}

export const CaptionStyler: React.FC<CaptionStylerProps> = ({
  style,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Caption Style</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Size
          </label>
          <input
            type="range"
            min="16"
            max="48"
            value={style.fontSize}
            onChange={(e) => onChange({ ...style, fontSize: Number(e.target.value) })}
            className="w-full"
          />
          <span className="text-sm text-gray-500">{style.fontSize}px</span>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <select
            value={style.position}
            onChange={(e) => onChange({ ...style, position: e.target.value as 'top' | 'bottom' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>
    </div>
  );
};