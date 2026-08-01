import type { PropsWithChildren, ReactNode, Ref } from "react";

type Props<T extends string> = {
  ref?: Ref<HTMLDialogElement>;
  selectees: [ReactNode, T][];
  onConfirmed: (result: T) => void;
};

export const ConfirmDialog = <T extends string = "ok" | "cancel">({
  children,
  onConfirmed,
  ref,
  selectees,
}: PropsWithChildren<Props<T>>) => {
  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box">
        {children}
        <div className="modal-action">
          {selectees.map(([node, value]) => (
            <form method="dialog" key={value}>
              <button
                type="submit"
                className="btn"
                onClick={() => {
                  onConfirmed(value);
                }}
              >
                {node}
              </button>
            </form>
          ))}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};
