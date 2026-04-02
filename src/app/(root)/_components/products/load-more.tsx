import { Button, Spinner } from "@heroui/react";

export function LoadMoreButton({
  hasMore,
  isLoading,
  onClick,
}: {
  hasMore: boolean;
  isLoading?: boolean;
  onClick: () => void;
}) {
  // const [isPending, startTransition] = useTransition();

  if (!hasMore) return null;

  return (
    <div className="mx-auto mt-10 flex justify-center">
      <Button
        // variant="flat"
        size="lg"
        isPending={isLoading || isLoading}
        onPress={onClick}
        className="min-w-[160px]"
      >
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : null}
            Load more
          </>
        )}
      </Button>
    </div>
  );
}
