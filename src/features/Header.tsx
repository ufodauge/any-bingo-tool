import { memo } from "react";

import { ColorCounters } from "./ColorCounters";
import { OpenSettingsButton } from "./OpenSettingsButton";
import { SeedInput } from "./settings/SeedInput";

export const Header = memo(function Header() {
  return (
    <div className="bg-base-200/50 grid grid-cols-[1fr_auto] items-center rounded-full px-6 py-2 shadow-md backdrop-blur-md">
      <div />
      <div className="flex gap-2">
        <div className="grid grid-flow-col-dense items-center gap-8 p-2 px-4">
          <ColorCounters />
        </div>
        <div
          className={
            "bg-base-100/60 flex items-center gap-2 rounded-full p-2 shadow transition-all ease-out"
          }
        >
          <SeedInput />
          <OpenSettingsButton />
        </div>
      </div>
    </div>
  );
});
