import { IconRefresh } from '../../libs/icons/Refresh';
import { useSetColorIndices } from '../store/colors/indicies';
import { useSeedNumberValue, useSeedNumberReducer } from '../store/seed';

export const SeedInput = () => {
  const seed = useSeedNumberValue();
  const setSeed = useSeedNumberReducer();
  const setColorIndices = useSetColorIndices();

  return (
    <div className="join">
      <input
        type="number"
        className="input input-sm join-item"
        placeholder="seed? (123456)"
        value={seed}
        onChange={(e) =>
          setSeed({ action: 'set', value: e.currentTarget.valueAsNumber })
        }
      />
      <button
        className="btn join-item btn-primary btn-sm"
        onClick={() => {
          setSeed({ action: 'randomise' });
          setColorIndices({ action: 'clear' });
        }}
      >
        <span className="fill-current stroke-current size-4">
          <IconRefresh />
        </span>
      </button>
    </div>
  );
};
