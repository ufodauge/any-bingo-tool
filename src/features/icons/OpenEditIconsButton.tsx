import { createPortal } from 'react-dom';
import { useRef, useState } from 'react';
import { EditIconsForm } from './EditIconsForm';

export const OpenEditIconsButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [key, setKey] = useState(crypto.randomUUID());

  return (
    <>
      <button
        type="button"
        onClick={() => {
          dialogRef.current?.showModal();
          setKey(crypto.randomUUID());
        }}
        className="btn btn-soft btn-sm"
      >
        出現要素を編集
      </button>
      {createPortal(
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box bg-base-100/90 backdrop-blur-lg max-w-2xl">
            <EditIconsForm key={key} />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>,
        document.body,
      )}
    </>
  );
};
