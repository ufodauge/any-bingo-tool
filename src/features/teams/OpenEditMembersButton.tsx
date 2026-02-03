import { createPortal } from 'react-dom';
import { IconSettings } from '../../libs/icons/Settings';
import { useRef, useState } from 'react';
import { EditMembersForm } from './EditMembersForm';

export const OpenEditMembersButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [key, setKey] = useState(crypto.randomUUID());

  return (
    <>
      <button
        onClick={() => {
          dialogRef.current?.showModal();
          setKey(crypto.randomUUID());
        }}
        className="btn btn-primary btn-sm btn-circle"
      >
        <span className="fill-current size-4">
          <IconSettings />
        </span>
      </button>
      {createPortal(
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box bg-base-100/90 backdrop-blur-lg">
            <EditMembersForm key={key} />
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
