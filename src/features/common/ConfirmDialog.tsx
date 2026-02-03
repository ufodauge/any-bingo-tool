import type { PropsWithChildren, ReactNode } from 'react';

type Props<T extends string> = {
  selectives: [ReactNode, T][];
  onConfirmed: (result: T) => void;
};

export const ConfirmDialog = <T extends string = 'ok' | 'cancel'>({
  children,
  onConfirmed,
  selectives,
}: PropsWithChildren<Props<T>>) => {
  return (
    <dialog className="modal">
      <div className="modal-box">
        {children}
        <div className="modal-action">
          {selectives.map(([node, value]) => (
            <form method="dialog" className="modal-backdrop">
              <button
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
