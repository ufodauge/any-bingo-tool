import { IconDelete } from '../../libs/icons/Delete';
import {
  useSetMarkerColors,
  useMarkerColorsValue,
  useDefaultMarkerColorOption,
  useSetDefaultMarkerColorOption,
} from '../store/colors/colors';

export const MarkerColorSetters = () => {
  const setMarkerColors = useSetMarkerColors();
  const markerColors = useMarkerColorsValue();
  const defaultMarkerColorOption = useDefaultMarkerColorOption();
  const setDefaultMarkerColorOption = useSetDefaultMarkerColorOption();

  const updateColor = (index: number, value: string) => {
    if (setMarkerColors({ action: 'try-update', index, value }) === false) {
      console.error('Failed to update colors');
    }
  };
  const removeColor = (index: number) => {
    if (setMarkerColors({ action: 'try-remove', index }) === false) {
      console.error('Failed to remove color.');
    }
  };

  return (
    <>
      <fieldset className="fieldset grid grid-cols-[1fr_auto] gap-2 items-center">
        <legend className="fieldset-legend">デフォルト色</legend>
        <span
          className={`${'size-10 border-2 rounded-full border-neutral-300'} ${
            defaultMarkerColorOption.hidden ? 'bg-base-300' : 'bg-base-100'
          }`}
        />
        <label className="label">
          <input
            type="checkbox"
            className="toggle"
            checked={defaultMarkerColorOption.hidden}
            onChange={(e) =>
              setDefaultMarkerColorOption((v) => ({
                ...v,
                hidden: e.currentTarget.checked,
              }))
            }
          />
          アイコンを隠す
        </label>
      </fieldset>
      <fieldset className="grid gap-2 max-h-48 overflow-y-scroll">
        <legend className="fieldset-legend">その他の色</legend>
        {markerColors.map((color, index) => (
          <div
            key={index}
            className="grid grid-cols-[auto_1fr] gap-2 items-center"
          >
            <input
              type="color"
              className="rounded-full size-10 reset-input-color border-2 border-neutral-300"
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
                className="btn btn-sm fill-current btn-error btn-circle p-1"
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
