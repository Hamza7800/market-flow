import { Spinner } from "@heroui/react";

export const LoadingState = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex h-full flex-1 flex-col items-center justify-center gap-3">
    <Spinner size="md" />
    <p className="text-muted-foreground animate-pulse text-sm">{label}</p>
  </div>
);
