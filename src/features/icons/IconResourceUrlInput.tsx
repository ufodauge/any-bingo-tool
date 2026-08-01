import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";

import {
  DEFAULT_ICON_RESOURCE_URL,
  iconResourceStatusAtom,
  iconResourceUrlAtom,
} from "../store/iconResource";

export const IconResourceUrlInput = () => {
  const [resourceUrl, setResourceUrl] = useAtom(iconResourceUrlAtom);
  const status = useAtomValue(iconResourceStatusAtom);
  const [draft, setDraft] = useState(resourceUrl);

  const commit = () => {
    const value = draft.trim();
    if (value === "") {
      setDraft(resourceUrl);
      return;
    }
    setResourceUrl(value);
  };

  return (
    <div className="grid gap-1.5">
      <div className="join">
        <input
          type="text"
          className="input input-sm join-item min-w-0 flex-1"
          placeholder="アイコンセットのJSON URL"
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
        />
        <button
          type="button"
          className="btn join-item btn-sm btn-soft"
          onClick={() => {
            setDraft(DEFAULT_ICON_RESOURCE_URL);
            setResourceUrl(DEFAULT_ICON_RESOURCE_URL);
          }}
        >
          既定に戻す
        </button>
      </div>
      <p
        className={`px-1 text-xs ${status.status === "error" ? "text-error" : "text-base-content/60"}`}
      >
        {status.status === "loading" && "読み込み中…"}
        {status.status === "ready" && `${status.count}件のアイコンを読み込みました`}
        {status.status === "error" && `読み込みエラー: ${status.message}`}
      </p>
    </div>
  );
};
