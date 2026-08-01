import { useAtom } from "jotai";

import { allowSameElementOccurrenceAtom } from "../store/board";

export const SampleRandomizedCopyToggle = () => {
  const [allowSameOccurrence, setAllowSameOccurrence] = useAtom(allowSameElementOccurrenceAtom);

  return (
    <label className="label select-none">
      <input
        type="checkbox"
        className="toggle"
        checked={allowSameOccurrence}
        onChange={(e) => setAllowSameOccurrence(e.currentTarget.checked)}
      ></input>
      同じ要素の出現を許す
    </label>
  );
};
