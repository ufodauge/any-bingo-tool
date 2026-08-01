import { IconDelete } from "../../libs/icons/Delete";
import {
  useSetMarkerColors,
  useMarkerColorsValue,
  useDefaultMarkerColorOption,
  useSetDefaultMarkerColorOption,
} from "../store/colors/colors";

export const MarkerColorSetters = () => {
  const setMarkerColors = useSetMarkerColors();
  const markerColors = useMarkerColorsValue();
  const defaultMarkerColorOption = useDefaultMarkerColorOption();
  const setDefaultMarkerColorOption = useSetDefaultMarkerColorOption();

  const updateColor = (index: number, value: string) => {
    if (setMarkerColors({ action: "try-update", index, value }) === false) {
      console.error("Failed to update colors");
    }
  };
  const removeColor = (index: number) => {
    if (setMarkerColors({ action: "try-remove", index }) === false) {
      console.error("Failed to remove color.");
    }
  };

  return (
    <>
      <fieldset className="fieldset grid grid-cols-[1fr_auto] items-center gap-2">
        <legend className="fieldset-legend">デフォルト色</legend>
        <span
          className={`${"size-10 rounded-full border-2 border-neutral-300"} ${
            defaultMarkerColorOption.hidden ? "bg-base-300" : "bg-base-100"
          }`}
        />
        <label className="label">
          <input
            type="checkbox"
            className="toggle"
            checked={defaultMarkerColorOption.hidden}
            onChange={(e) =>
              setDefaultMarkerColorOption({
                hidden: e.currentTarget.checked,
              })
            }
          />
          アイコンを隠す
        </label>
      </fieldset>
      <fieldset className="grid max-h-48 gap-2 overflow-y-scroll">
        <legend className="fieldset-legend">その他の色</legend>
        {markerColors.map((color, index) => (
          <div key={index} className="grid grid-cols-[auto_1fr] items-center gap-2">
            <input
              type="color"
              className="reset-input-color size-10 rounded-full border-2 border-neutral-300"
              value={color}
              onChange={(e) => updateColor(index, e.target.value)}
            />
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <input
                type="text"
                className="input"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
              />
              <button
                className="btn btn-sm btn-error btn-circle fill-current p-1"
                onClick={() => removeColor(index)}
                disabled={markerColors.length <= 1}
              >
                <IconDelete />
              </button>
            </div>
          </div>
        ))}
      </fieldset>
    </>
  );
};
