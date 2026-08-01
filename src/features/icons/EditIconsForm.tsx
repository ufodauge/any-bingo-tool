import { useAtomValue, useSetAtom } from "jotai";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ConfirmDialog } from "../common/ConfirmDialog";
import { iconResourceStatusAtom } from "../store/iconResource";
import { iconConfigsAtom, iconConfigsWithResourceAtom, resetIconConfigsAtom } from "../store/icons";
import { IconConfigGrid } from "./IconConfigGrid";
import { IconConfigRow } from "./IconConfigRow";

type ViewMode = "list" | "grid";

export const EditIconsForm = () => {
  const iconConfigs = useAtomValue(iconConfigsWithResourceAtom);
  const setIconConfigs = useSetAtom(iconConfigsAtom);
  const resourceStatus = useAtomValue(iconResourceStatusAtom);
  const resetIconConfigs = useSetAtom(resetIconConfigsAtom);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const resetDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">出現する要素の設定</h2>
      <p className="text-base-content/70 px-2 text-sm">
        「候補」を外した要素は盤面に出現しません。「必須」を付けた要素は盤面に必ず1つ出現します。「出現率」は候補の中での選ばれやすさの比率です（大きいほど出現しやすくなります）。
      </p>

      {resourceStatus.status === "error" && (
        <p className="text-error px-2 text-sm">
          アイコンセットの読み込みに失敗したため、前回読み込めた内容を表示しています（
          {resourceStatus.message}）。
        </p>
      )}

      {iconConfigs.length === 0 ? (
        <p className="text-base-content/60 px-2 py-6 text-center text-sm">
          {resourceStatus.status === "loading"
            ? "アイコンセットを読み込んでいます…"
            : "アイコンがありません。設定画面から読み込み元のURLを確認してください。"}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 px-2">
            <div role="tablist" className="tabs tabs-box tabs-sm">
              <button
                type="button"
                role="tab"
                className={`tab ${viewMode === "list" ? "tab-active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                リスト表示
              </button>
              <button
                type="button"
                role="tab"
                className={`tab ${viewMode === "grid" ? "tab-active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                グリッド表示
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                className="btn btn-xs btn-soft"
                onClick={() => setIconConfigs((prev) => prev.map((c) => ({ ...c, enabled: true })))}
              >
                すべて候補にする
              </button>
              <button
                type="button"
                className="btn btn-xs btn-soft"
                onClick={() =>
                  setIconConfigs((prev) =>
                    prev.map((c) => ({
                      ...c,
                      enabled: false,
                      required: false,
                    })),
                  )
                }
              >
                すべて候補から外す
              </button>
              <button
                type="button"
                className="btn btn-xs btn-soft"
                onClick={() =>
                  setIconConfigs((prev) => prev.map((c) => ({ ...c, required: false })))
                }
              >
                必須をすべて解除
              </button>
              <button
                type="button"
                className="btn btn-xs btn-soft btn-error"
                onClick={() => resetDialogRef.current?.showModal()}
              >
                初期設定に戻す
              </button>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="grid max-h-[45svh] grid-cols-[auto_1fr_auto_auto_auto] gap-3 overflow-auto px-2">
              <div className="bg-base-100/90 sticky top-0 col-span-full grid grid-cols-subgrid items-center px-2 pb-1 text-xs font-bold backdrop-blur">
                <span />
                <span>要素</span>
                <span>候補</span>
                <span>必須</span>
                <span>出現率</span>
              </div>
              {iconConfigs.map((config) => (
                <IconConfigRow
                  key={config.pathImage}
                  config={config}
                  setConfig={(field, value) =>
                    setIconConfigs((prev) =>
                      prev.map((c) =>
                        c.pathImage === config.pathImage ? { ...c, [field]: value } : c,
                      ),
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <IconConfigGrid
              iconConfigs={iconConfigs}
              setConfigForSelection={(pathImages, field, value) => {
                const targets = new Set(pathImages);
                setIconConfigs((prev) =>
                  prev.map((c) => (targets.has(c.pathImage) ? { ...c, [field]: value } : c)),
                );
              }}
            />
          )}
        </>
      )}

      {createPortal(
        <ConfirmDialog
          ref={resetDialogRef}
          selectees={[
            ["戻す", "reset"],
            ["キャンセル", "cancel"],
          ]}
          onConfirmed={(result) => {
            if (result === "reset") {
              resetIconConfigs();
            }
          }}
        >
          <p>すべての要素の設定（候補・必須・出現率）を初期状態に戻します。よろしいですか？</p>
        </ConfirmDialog>,
        document.body,
      )}
    </div>
  );
};
