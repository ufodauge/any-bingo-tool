import { useAtomValue } from "jotai";

import { useSetSeedScope } from "../store/reroll";
import { seedScopeAtom } from "../store/seed";

export const SeedScopeToggle = () => {
  const seedScope = useAtomValue(seedScopeAtom);
  const setSeedScope = useSetSeedScope();

  return (
    <label className="label select-none">
      <input
        type="checkbox"
        className="toggle"
        checked={seedScope === "per-board"}
        onChange={(e) => setSeedScope(e.currentTarget.checked ? "per-board" : "shared")}
      ></input>
      ボードごとにシードを持つ
    </label>
  );
};
