import { useAtom } from 'jotai';
import { boardContainerSizeAtom } from './store/boardSize';
import { useBoardCount, useSetBoardCount } from './store/boardCount';
import { isBoardCount } from './store/schemas';

export const SubHeader = () => {
  const [containerSize, setContainerSize] = useAtom(boardContainerSizeAtom);
  const boardCount = useBoardCount();
  const setBoardCount = useSetBoardCount();

  return (
    <div className="grid place-items-end grid-flow-col-dense justify-end items-center gap-2">
      <select
        className="select min-w-30"
        name="boardCount"
        id="boardCount"
        value={boardCount}
        onChange={(e) => {
          const value = Number(e.currentTarget.value);
          if (isBoardCount(value)) {
            setBoardCount(value);
          }
        }}
      >
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>
      <label>
        <input
          type="range"
          className="range range-sm"
          value={containerSize}
          min={20}
          max={80}
          onChange={(e) => setContainerSize(e.currentTarget.valueAsNumber)}
        />
      </label>
    </div>
  );
};
