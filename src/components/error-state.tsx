import { Button, Card } from "@heroui/react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  homeHref?: string;
};

export const ErrorState = ({
  title = "Something went wrong",
  message,
  onRetry,
  homeHref,
}: ErrorStateProps) => {
  return (
    <div className="flex h-screen flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md border">
        <Card.Header className="flex flex-col items-center gap-3 pt-6 pb-2">
          <div className="bg-danger/10 text-danger flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <Card.Title className="text-center text-lg">{title}</Card.Title>
        </Card.Header>

        {message && (
          <Card.Content className="pb-2">
            <p className="text-muted-foreground text-center text-sm">
              {message}
            </p>
          </Card.Content>
        )}

        {(onRetry || homeHref) && (
          <Card.Footer className="flex justify-center gap-2 pb-6">
            {onRetry && (
              <Button size="sm" variant="secondary" onPress={onRetry}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Try again
              </Button>
            )}
            {homeHref && (
              <Link href={homeHref}>
                <Button size="sm" variant="tertiary">
                  <Home className="mr-1 h-3.5 w-3.5" />
                  Go home
                </Button>
              </Link>
            )}
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};
