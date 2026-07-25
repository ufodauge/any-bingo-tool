import { useState } from 'react';
import type { IconConfig } from '../store/icons';
import { iconLabel, iconUrl } from './iconDisplay';
import { IconConfigRow } from './IconConfigRow';

type Props = {
  iconConfigs: IconConfig[];
  setConfig: <Key extends keyof IconConfig>(
    pathImage: string,
    field: Key,
    value: IconConfig[Key],
  ) => void;
};

export const IconConfigGrid = ({ iconConfigs, setConfig }: Props) => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const selectedConfig =
    iconConfigs.find((config) => config.pathImage === selectedPath) ?? null;

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-[38svh] overflow-auto p-2 rounded-md bg-base-200/40">
        {iconConfigs.map((config) => {
          const isSelected = config.pathImage === selectedPath;
          return (
            <button
              key={config.pathImage}
              type="button"
              title={iconLabel(config.pathImage)}
              onClick={() => setSelectedPath(config.pathImage)}
              className={`relative flex items-center justify-center rounded-md p-1 border transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent hover:bg-base-300/60'
              } ${config.enabled ? '' : 'opacity-35'}`}
            >
              <img
                src={iconUrl(config.pathImage)}
                alt={iconLabel(config.pathImage)}
                className="size-8 object-scale-down"
                draggable={false}
              />
              {config.required && (
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-secondary" />
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-base-300 px-2 py-2 min-h-[4.5rem]">
        {selectedConfig ? (
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3">
            <div className="grid grid-cols-subgrid col-span-full items-center px-2 pb-1 text-xs font-bold">
              <span />
              <span>要素</span>
              <span>候補</span>
              <span>必須</span>
              <span>出現率</span>
            </div>
            <IconConfigRow
              config={selectedConfig}
              setConfig={(field, value) =>
                setConfig(selectedConfig.pathImage, field, value)
              }
            />
          </div>
        ) : (
          <p className="text-sm text-base-content/60 text-center py-4">
            アイコンをクリックすると、ここで設定を編集できます。
          </p>
        )}
      </div>
    </div>
  );
};
