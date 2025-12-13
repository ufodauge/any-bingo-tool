import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconSettings } from '../libs/icons/Settings';
import { SettingsForm } from './SettingsForm';

export const OpenSettingsButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="btn btn-primary btn-sm"
      >
        <span className="fill-current stroke-current size-4">
          <IconSettings />
        </span>
        <span>設定</span>
      </button>
      {createPortal(
        <dialog ref={dialogRef} className="modal">
          <div className="modal-box bg-base-100/80 backdrop-blur-md">
            <SettingsForm />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>,
        document.body
      )}
    </>
  );
};
