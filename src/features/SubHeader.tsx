import { useAtom } from "jotai";
import { boardContainerSizeAtom } from "./store/boardSize";

export const SubHeader = () => {
  const [containerSize, setContainerSize] = useAtom(boardContainerSizeAtom);
  
  return (
    <div className="grid place-items-end">
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
