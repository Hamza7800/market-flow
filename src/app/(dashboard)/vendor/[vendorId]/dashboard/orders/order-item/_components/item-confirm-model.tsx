import { animationStyles } from "@/lib/consts/constants";
import { AlertDialog, Button, Spinner, useOverlayState } from "@heroui/react";
import { type ReactNode } from "react";

type StatusConfirmModalProps = {
  title: string;
  description: string;
  content: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: (close: () => void) => void;
  trigger?: ReactNode;
};

export const StatusConfirmModal = ({
  title,
  description,
  content,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  onConfirm,
  trigger,
}: StatusConfirmModalProps) => {
  const state = useOverlayState();

  return (
    <>
      <AlertDialog isOpen={state.isOpen} onOpenChange={state.setOpen}>
        {trigger ? (
          <div onClick={() => state.open()}>{trigger}</div>
        ) : (
          <Button onPress={() => state.open()}>Open</Button>
        )}
        <AlertDialog.Backdrop className={animationStyles.backdrop}>
          <AlertDialog.Container className={animationStyles.container}>
            <AlertDialog.Dialog className="sm:max-w-[420px]">
              <AlertDialog.CloseTrigger />

              <AlertDialog.Header>
                <AlertDialog.Heading>{title}</AlertDialog.Heading>
                <AlertDialog.Heading>{description}</AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body>{content}</AlertDialog.Body>

              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary" isPending={isLoading}>
                  {cancelText}
                </Button>

                <Button
                  isPending={isLoading}
                  onPress={() => onConfirm(state.close)}
                >
                  {({ isPending }) => (
                    <>
                      {isPending ? <Spinner color="current" size="sm" /> : null}
                      {confirmText}
                    </>
                  )}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
};
