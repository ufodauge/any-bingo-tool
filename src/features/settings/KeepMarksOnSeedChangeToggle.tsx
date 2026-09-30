import { useAtom } from "jotai";

import { keepMarksOnSeedChangeAtom } from "../store/seed";

export const KeepMarksOnSeedChangeToggle = () => {
  const [keepMarks, setKeepMarks] = useAtom(keepMarksOnSeedChangeAtom);

  return (
    <label className="label select-none">
      <input
        type="checkbox"
        className="toggle"
        checked={keepMarks}
        onChange={(e) => setKeepMarks(e.currentTarget.checked)}
      ></input>
      シード変更時にリセットしない
    </label>
  );
};
