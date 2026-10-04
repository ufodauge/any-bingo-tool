import { IconDelete } from "../../libs/icons/Delete";
import {
  CONCEALED_COLOR,
  DEFAULT_COLOR,
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
      <fieldset className="fieldset grid grid-cols-[1fr_auto] items-start gap-2">
        <legend className="fieldset-legend">デフォルト色</legend>
        <span
          className="border-base-content/20 size-10 rounded-full border-2"
          style={{
            backgroundColor:
              defaultMarkerColorOption.hiddenBoardBits > 0 ? CONCEALED_COLOR : DEFAULT_COLOR,
          }}
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="label">
            アイコンを隠す (左)
            <input
              type="checkbox"
              className="checkbox"
              checked={(defaultMarkerColorOption.hiddenBoardBits & 0b01) > 0}
              onChange={(e) =>
                setDefaultMarkerColorOption({
                  ...defaultMarkerColorOption,
                  hiddenBoardBits: e.currentTarget.checked
                    ? defaultMarkerColorOption.hiddenBoardBits | 0b01
                    : defaultMarkerColorOption.hiddenBoardBits & ~0b01,
                })
              }
            />
          </label>
          <label className="label">
            アイコンを隠す (右)
            <input
              type="checkbox"
              className="checkbox"
              checked={(defaultMarkerColorOption.hiddenBoardBits & 0b10) > 0}
              onChange={(e) =>
                setDefaultMarkerColorOption({
                  ...defaultMarkerColorOption,
                  hiddenBoardBits: e.currentTarget.checked
                    ? defaultMarkerColorOption.hiddenBoardBits | 0b10
                    : defaultMarkerColorOption.hiddenBoardBits & ~0b10,
                })
              }
            />
          </label>
        </div>

        {/* <div className="grid grid-rows-2 gap-2">
          <label className="label">
            <input
              type="checkbox"
              className="toggle"
              checked={defaultMarkerColorOption.hiddenBoardBits > 0}
              onChange={(e) =>
                setDefaultMarkerColorOption({
                  hiddenBoardBits: e.currentTarget.checked ? 1 : 0,
                })
              }
            />
            アイコンを隠す
          </label>
          <label className="label pl-8">
            <input
              type="checkbox"
              className="toggle"
              checked={defaultMarkerColorOption.hiddenOnlyAdditionalBoard}
              disabled={defaultMarkerColorOption.hiddenBoardBits < 2}
              onChange={(e) =>
                setDefaultMarkerColorOption({
                  ...defaultMarkerColorOption,
                  hiddenOnlyAdditionalBoard: e.currentTarget.checked,
                })
              }
            />
            二枚目のパネルだけ隠す
          </label>
        </div> */}
      </fieldset>
      <fieldset className="grid max-h-48 gap-2 overflow-y-scroll">
        <legend className="fieldset-legend">その他の色</legend>
        {markerColors.map((color, index) => (
          <div key={index} className="grid grid-cols-[auto_1fr] items-center gap-2">
            <input
              type="color"
              className="reset-input-color border-base-content/20 size-10 rounded-full border-2"
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
