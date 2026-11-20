const RestaurantCardSkeleton = () => {
  return (
    <div className="bento-card overflow-hidden animate-pulse flex flex-col justify-between">
      <div className="aspect-[16/10] bg-surface-elevated/80 w-full" />
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="h-4 bg-surface-elevated rounded-md w-3/4" />
          <div className="h-3 bg-surface-elevated/60 rounded-md w-1/2" />
        </div>
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
          <div className="h-3 bg-surface-elevated rounded-md w-16" />
          <div className="h-3 bg-surface-elevated rounded-md w-12" />
        </div>
      </div>
    </div>
  );
};

export default RestaurantCardSkeleton;
