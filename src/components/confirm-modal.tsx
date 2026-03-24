import { AlertDialog, Button, Spinner, useOverlayState } from "@heroui/react";
import { type ReactNode } from "react";

const animationStyles = {
  backdrop: [
    "data-[entering]:duration-500",
    "data-[entering]:ease-[cubic-bezier(0.25,1,0.5,1)]",
    "data-[exiting]:duration-200",
    "data-[exiting]:ease-[cubic-bezier(0.5,0,0.75,0)]",
  ].join(" "),
  container: [
    "data-[entering]:animate-in",
    "data-[entering]:fade-in-0",
    "data-[entering]:slide-in-from-bottom-4",
    "data-[entering]:duration-500",
    "data-[entering]:ease-[cubic-bezier(0.25,1,0.5,1)]",
    "data-[exiting]:animate-out",
    "data-[exiting]:fade-out-0",
    "data-[exiting]:slide-out-to-bottom-2",
    "data-[exiting]:duration-200",
    "data-[exiting]:ease-[cubic-bezier(0.5,0,0.75,0)]",
  ].join(" "),
};

type ConfirmModalProps = {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: (close: () => void) => void;
  trigger?: ReactNode;
};

export const ConfirmModal = ({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  onConfirm,
  trigger,
}: ConfirmModalProps) => {
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
              </AlertDialog.Header>

              <AlertDialog.Body>
                <p className="text-sm text-slate-400">{description}</p>
              </AlertDialog.Body>

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
