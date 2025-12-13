import { IconDelete } from '../../libs/icons/Delete';
import { useSetMarkerColors, useMarkerColorsValue, useDefaultMarkerColorOption, useSetDefaultMarkerColorOption } from '../store/colors/colors';

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
        <legend className="fieldset-legend">（デフォルト色）</legend>
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
      <div className="grid gap-2 max-h-48 overflow-y-scroll">
        {markerColors.map((color, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_auto] gap-2 items-center"
          >
            <div className="join">
              <input
                type="color"
                className="join-item h-10 reset-input-color border-2 border-neutral-300"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
              />
              <input
                type="text"
                className="input join-item"
                value={color}
                onChange={(e) => updateColor(index, e.target.value)}
              />
            </div>
            <button
              className="btn btn-sm fill-current btn-error btn-circle p-1"
              onClick={() => removeColor(index)}
              disabled={markerColors.length <= 1}
            >
              <IconDelete />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
