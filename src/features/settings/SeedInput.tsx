import { useAtom } from "jotai";

import { IconInvisible } from "../../libs/icons/Invisible";
import { IconRefresh } from "../../libs/icons/Refresh";
import { IconVisible } from "../../libs/icons/Visible";
import { useSetColorIndices } from "../store/colors/indices";
import { useSeedNumberValue, useSeedNumberReducer } from "../store/seed";
import { seedVisibleAtom } from "../store/seedVisibility";

export const SeedInput = () => {
  const seed = useSeedNumberValue();
  const setSeed = useSeedNumberReducer();
  const setColorIndices = useSetColorIndices();
  const [seedVisible, setSeedVisible] = useAtom(seedVisibleAtom);

  return (
    <div className="join">
      <div>
        <div className="grid items-center justify-items-end">
          <input
            type="number"
            className={`input input-sm join-item col-end-1 row-end-1 transition-[width] ease-out ${
              seedVisible ? "" : "w-12 text-transparent"
            }`}
            placeholder="seed? (123456)"
            value={seed}
            onChange={(e) => setSeed({ action: "set", value: e.currentTarget.valueAsNumber })}
          />
          <div className="z-10 col-end-1 row-end-1 grid pr-4">
            <label className="swap">
              <input
                type="checkbox"
                checked={seedVisible}
                onChange={(e) => setSeedVisible(e.currentTarget.checked)}
              />
              <span className="swap-on size-4 fill-current">
                <IconVisible />
              </span>
              <span className="swap-off size-4 fill-current">
                <IconInvisible />
              </span>
            </label>
          </div>
        </div>
      </div>
      <button
        className="btn join-item btn-primary btn-sm"
        onClick={() => {
          setSeed({ action: "randomize" });
          setColorIndices({ action: "clear" });
        }}
      >
        <span className="size-4 fill-current stroke-current">
          <IconRefresh />
        </span>
      </button>
    </div>
  );
};
