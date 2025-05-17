
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LiveViewSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-video bg-vision-dark-900">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="p-2">
            <Skeleton className="h-6 w-32" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LiveViewSkeleton;
