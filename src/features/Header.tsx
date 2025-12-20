import { SeedInput } from './settings/SeedInput';
import { OpenSettingsButton } from './OpenSettingsButton';
import { ColorCounter } from './ColorCounter';

export const Header = () => {
  return (
    <div className="bg-base-200/50 backdrop-blur-md rounded-full grid grid-cols-[1fr_auto] py-2 px-6 items-center shadow-md">
      <div>
        <a className="btn bg-base-100/60 btn-lg"></a>
      </div>
      <div className="flex gap-2">
        <div className="flex gap-2 px-4 items-center bg-base-100/60 shadow p-2 rounded-full">
          <ColorCounter />
        </div>
        <div className="flex gap-2 items-center bg-base-100/60 shadow p-2 rounded-full">
          <SeedInput />
          <OpenSettingsButton />
        </div>
      </div>
    </div>
  );
};
