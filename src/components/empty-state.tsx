import { Button, Card } from "@heroui/react";
import { type LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <Card
      variant="transparent"
      className={cn(
        "flex flex-1 flex-col items-center justify-center p-8 text-center duration-300",
        className,
      )}
    >
      <div className="bg-surface-secondary text-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <Icon size={32} strokeWidth={1.5} />
      </div>

      <h3 className="text-foreground text-xl font-semibold">{title}</h3>

      {description && (
        <p className="text-muted mt-2 max-w-sm text-sm">{description}</p>
      )}

      {action && (
        <Button className="mt-2" variant="secondary" onPress={action.onClick}>
          {action.label}
        </Button>
      )}
    </Card>
  );
};
