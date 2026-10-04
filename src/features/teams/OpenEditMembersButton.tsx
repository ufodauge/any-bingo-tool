import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import { IconEdit } from "../../libs/icons/Edit";
import { EditMembersForm } from "./EditMembersForm";

export const OpenEditMembersButton = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [key, setKey] = useState(crypto.randomUUID());

  return (
    <>
      <div className="tooltip tooltip-bottom" data-tip="メンバーを編集">
        <button
          aria-label="メンバーを編集"
          onClick={() => {
            dialogRef.current?.showModal();
            setKey(crypto.randomUUID());
          }}
          className="btn btn-primary btn-sm btn-square"
        >
          <span className="size-5 fill-current">
            <IconEdit />
          </span>
        </button>
      </div>
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
