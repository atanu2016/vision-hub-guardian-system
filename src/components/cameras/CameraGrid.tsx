
import React from 'react';
import CameraCard from './CameraCard';
import { Camera } from '@/types/camera';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2 } from 'lucide-react';

interface CameraGridProps {
  cameras: Camera[];
  title?: string;
  onDeleteCamera?: (id: string) => void;
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, title, onDeleteCamera }) => {
  const [cameraToDelete, setCameraToDelete] = React.useState<Camera | null>(null);

  const handleDeleteClick = (camera: Camera) => {
    setCameraToDelete(camera);
  };

  const confirmDelete = () => {
    if (cameraToDelete && onDeleteCamera) {
      onDeleteCamera(cameraToDelete.id);
      setCameraToDelete(null);
    }
  };

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
            {onDeleteCamera && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute top-2 right-2 rounded-full w-8 h-8 p-1 bg-background/80 backdrop-blur-sm"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick(camera)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
      
      <AlertDialog open={!!cameraToDelete} onOpenChange={(open) => !open && setCameraToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Camera</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {cameraToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CameraGrid;
