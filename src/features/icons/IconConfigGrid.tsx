import { useState } from "react";

import type { IconConfig, IconConfigWithResource } from "../store/icons";

type Props = {
  iconConfigs: IconConfigWithResource[];
  setConfigForSelection: <Key extends keyof IconConfig>(
    pathImages: string[],
    field: Key,
    value: IconConfig[Key],
  ) => void;
};

export const IconConfigGrid = ({ iconConfigs, setConfigForSelection }: Props) => {
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  const toggleSelected = (pathImage: string) =>
    setSelectedPaths((prev) =>
      prev.includes(pathImage) ? prev.filter((p) => p !== pathImage) : [...prev, pathImage],
    );

  const selectedConfigs = iconConfigs.filter((config) => selectedPaths.includes(config.pathImage));
  const allEnabled = selectedConfigs.every((c) => c.enabled);
  const enabledMixed = !allEnabled && selectedConfigs.some((c) => c.enabled);
  const allRequired = selectedConfigs.every((c) => c.required);
  const requiredMixed = !allRequired && selectedConfigs.some((c) => c.required);
  const weightValues = new Set(selectedConfigs.map((c) => c.weight));
  const weightMixed = weightValues.size > 1;

  return (
    <div className="grid gap-3">
      <div className="bg-base-200/40 grid max-h-[34svh] grid-cols-8 gap-2 overflow-auto rounded-md p-2 sm:grid-cols-10">
        {iconConfigs.map((config) => {
          const isSelected = selectedPaths.includes(config.pathImage);
          return (
            <button
              key={config.pathImage}
              type="button"
              title={config.label}
              onClick={() => toggleSelected(config.pathImage)}
              className={`relative flex items-center justify-center rounded-md border p-1 transition-colors ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "hover:bg-base-300/60 border-transparent"
              } ${config.enabled ? "" : "opacity-35"}`}
            >
              <img
                src={config.url}
                alt={config.label}
                className="size-8 object-scale-down"
                draggable={false}
              />
              {config.required && (
                <span className="bg-secondary absolute -top-1 -right-1 size-2 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="border-base-300 grid min-h-[5.5rem] gap-2 rounded-md border px-3 py-2">
        {selectedConfigs.length > 0 ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1">
                {selectedConfigs.map((config) => (
                  <button
                    key={config.pathImage}
                    type="button"
                    title={`${config.label}（クリックで選択解除）`}
                    onClick={() => toggleSelected(config.pathImage)}
                    className="border-primary/40 hover:border-error hover:bg-error/10 relative rounded-md border p-0.5"
                  >
                    <img
                      src={config.url}
                      alt={config.label}
                      className="size-6 object-scale-down"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-xs btn-ghost shrink-0"
                onClick={() => setSelectedPaths([])}
              >
                選択を解除
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
              <span className="text-base-content/70 text-sm">
                {selectedConfigs.length}件選択中の設定をまとめて変更
              </span>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={allEnabled}
                  ref={(el) => {
                    if (el) el.indeterminate = enabledMixed;
                  }}
                  onChange={(e) => {
                    const enabled = e.currentTarget.checked;
                    setConfigForSelection(selectedPaths, "enabled", enabled);
                    if (!enabled) {
                      setConfigForSelection(selectedPaths, "required", false);
                    }
                  }}
                />
                候補にする
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={allRequired}
                  ref={(el) => {
                    if (el) el.indeterminate = requiredMixed;
                  }}
                  onChange={(e) => {
                    const required = e.currentTarget.checked;
                    setConfigForSelection(selectedPaths, "required", required);
                    if (required) {
                      setConfigForSelection(selectedPaths, "enabled", true);
                    }
                  }}
                />
                必須にする
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                出現率
                <input
                  type="number"
                  className="input input-sm w-24 bg-transparent"
                  value={weightMixed ? "" : (selectedConfigs[0]?.weight ?? 1)}
                  placeholder={weightMixed ? "複数の値" : undefined}
                  min={0}
                  step={0.1}
                  onChange={(e) => {
                    const value = e.currentTarget.valueAsNumber;
                    setConfigForSelection(
                      selectedPaths,
                      "weight",
                      Number.isFinite(value) ? Math.max(value, 0) : 0,
                    );
                  }}
                />
              </label>
            </div>
          </>
        ) : (
          <p className="text-base-content/60 py-6 text-center text-sm">
            アイコンをクリックすると、ここで設定を編集できます（複数選択可）。
          </p>
        )}
      </div>
    </div>
  );
};
