import { GridSizeSelector } from './settings/GridSizeSelector';
import { MarkerColorSetters } from './settings/MarkerColorSetters';
import { RestrictCellFormToggle } from './settings/RestrictCellFormToggle';
import { VariableCellSizeToggle } from './settings/VariableCellSizeToggle';
import { useSetMarkerColors } from './store/colors/colors';

export const SettingsForm = () => {
  const setMarkerColors = useSetMarkerColors();

  const addColor = () => {
    const value = `#${Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, '0')}`;
    if (setMarkerColors({ action: 'try-add', value }) === false) {
      console.error('failed to add color');
    }
  };

  return (
    <div className="grid gap-2">
      <h3 className="text-2xl font-bold">設定</h3>
      <div className="grid gap-2 px-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">マス目の数</legend>
          <div className="grid grid-cols-2 gap-2 items-center px-2">
            <div className="col-span-full">
              <GridSizeSelector />
            </div>
            <VariableCellSizeToggle />
            <RestrictCellFormToggle />
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">マーカーの色設定</legend>
          <div className="grid gap-2 px-2">
            <MarkerColorSetters />
            <button className="btn btn-primary" onClick={addColor}>
              色を追加
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  );
};
