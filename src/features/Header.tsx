import { useAtomValue } from "jotai";
import { Fragment, memo } from "react";

import { OpenSettingsButton } from "./OpenSettingsButton";
import { SeedInput } from "./settings/SeedInput";
import { useBoardCount } from "./store/boardCount";
import { seedScopeAtom } from "./store/seed";

const BOARD_LABELS = ["左", "右"];

export const Header = memo(function Header() {
  const seedScope = useAtomValue(seedScopeAtom);
  const boardCount = useBoardCount();

  return (
    <div className="bg-base-200/50 grid grid-cols-[1fr_auto] items-center rounded-full px-6 py-2 shadow-md backdrop-blur-md">
      <div />
      <div className="flex gap-2">
        <div
          className={
            "bg-base-100/60 flex items-center gap-2 rounded-full p-2 shadow transition-all ease-out"
          }
        >
          {seedScope === "per-board" ? (
            Array.from({ length: boardCount }, (_, i) => {
              const label = boardCount > 1 ? BOARD_LABELS[i] : undefined;
              return (
                <Fragment key={i}>
                  {label && <span className="pl-2 text-sm">{label}</span>}
                  <SeedInput boardIndex={i} label={label} />
                </Fragment>
              );
            })
          ) : (
            <SeedInput />
          )}
          <OpenSettingsButton />
        </div>
      </div>
    </div>
  );
});
