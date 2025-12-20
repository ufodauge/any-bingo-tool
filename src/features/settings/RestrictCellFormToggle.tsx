import { useAtom } from 'jotai';
import { cellSizeModeAtom } from '../store/boardOptions';

export const RestrictCellFormToggle = () => {
  const [cellSizeMode, setCellSizeMode] = useAtom(cellSizeModeAtom);
  return (
    <label className="label select-none">
      <input
        type="checkbox"
        className="toggle"
        disabled={cellSizeMode === 'normal'}
        checked={cellSizeMode === 'random'}
        onChange={(e) =>
          setCellSizeMode(e.currentTarget.checked ? 'random' : 'random-square')
        }
      ></input>
      形状・サイズ制限をなくす
    </label>
  );
};
