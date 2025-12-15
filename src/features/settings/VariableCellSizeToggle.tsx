import { useAtom } from 'jotai';
import { variableCellSizeAtom } from '../store/boardOptions';

export const VariableCellSizeToggle = () => {
  const [variableCellSize, setVariableCellSize] = useAtom(variableCellSizeAtom);
  return (
    <label className="label">
      <input
        type="checkbox"
        className="toggle"
        checked={variableCellSize}
        onChange={(e) => setVariableCellSize(e.currentTarget.checked)}
      ></input>
      セルのサイズをランダム化
    </label>
  );
};
