import { useAtom } from 'jotai';
import { allowSameElementOccurenceAtom } from '../store/board';

export const SampleRandomizedCopyToggle = () => {
  const [allowSameOccurence, setAllowSameOccurence] = useAtom(
    allowSameElementOccurenceAtom
  );

  return (
    <label className="label select-none">
      <input
        type="checkbox"
        className="toggle"
        checked={allowSameOccurence}
        onChange={(e) => setAllowSameOccurence(e.currentTarget.checked)}
      ></input>
      同じ要素の出現を許す
    </label>
  );
};
