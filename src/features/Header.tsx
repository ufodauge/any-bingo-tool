import { SeedInput } from './settings/SeedInput';
import { OpenSettingsButton } from './OpenSettingsButton';
import { ColorCounters } from './ColorCounters';
import { memo } from 'react';

export const Header = memo(function Header() {
  return (
    <div className="bg-base-200/50 backdrop-blur-md rounded-full grid grid-cols-[1fr_auto] py-2 px-6 items-center shadow-md">
      <div />
      <div className="flex gap-2">
        <div className="grid grid-flow-col-dense gap-8 px-4 items-center p-2">
          <ColorCounters />
        </div>
        <div
          className={
            'flex gap-2 items-center bg-base-100/60 shadow p-2 rounded-full transition-all ease-out'
          }
        >
          <SeedInput />
          <OpenSettingsButton />
        </div>
      </div>
    </div>
  );
});
