import { useAtom } from 'jotai';
import { IconRefresh } from '../../libs/icons/Refresh';
import { useSetColorIndices } from '../store/colors/indicies';
import { useSeedNumberValue, useSeedNumberReducer } from '../store/seed';
import { seedVisibleAtom } from '../store/seedVisiblity';
import { IconVisible } from '../../libs/icons/Visible';
import { IconInvisible } from '../../libs/icons/Invisible';

export const SeedInput = () => {
  const seed = useSeedNumberValue();
  const setSeed = useSeedNumberReducer();
  const setColorIndices = useSetColorIndices();
  const [seedVisible, setSeedVisible] = useAtom(seedVisibleAtom);

  return (
    <div className="join">
      <div>
        <div className="grid justify-items-end items-center">
          <input
            type="number"
            className={`input input-sm join-item row-end-1 col-end-1 transition-[width] ease-out ${
              seedVisible ? '' : 'text-transparent w-12'
            }`}
            placeholder="seed? (123456)"
            value={seed}
            onChange={(e) =>
              setSeed({ action: 'set', value: e.currentTarget.valueAsNumber })
            }
          />
          <div className="pr-4 row-end-1 col-end-1 z-10 grid">
            <label className="swap">
              <input
                type="checkbox"
                checked={seedVisible}
                onChange={(e) => setSeedVisible(e.currentTarget.checked)}
              />
              <span className="swap-on fill-current size-4">
                <IconVisible />
              </span>
              <span className="swap-off fill-current size-4">
                <IconInvisible />
              </span>
            </label>
          </div>
        </div>
      </div>
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
