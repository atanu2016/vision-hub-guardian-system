
import React from 'react';
import CameraCard from './CameraCard';
import { Camera } from '@/types/camera';

interface CameraGridProps {
  cameras: Camera[];
  title?: string;
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, title }) => {
  return (
    <div className="space-y-4">
      {title && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex-1 ml-4 border-t border-gray-200 dark:border-gray-800"></div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {cameras.map((camera) => (
          <div key={camera.id} className="relative">
            <CameraCard camera={camera} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CameraGrid;
