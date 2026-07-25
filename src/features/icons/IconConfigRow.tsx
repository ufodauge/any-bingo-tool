import type { IconConfig } from '../store/icons';
import { iconLabel, iconUrl } from './iconDisplay';

type Props = {
  config: IconConfig;
  setConfig: <Key extends keyof IconConfig>(
    field: Key,
    value: IconConfig[Key],
  ) => void;
};

export const IconConfigRow = ({ config, setConfig }: Props) => {
  return (
    <div className="grid grid-cols-subgrid col-span-full gap-3 items-center px-2 py-1 rounded-md odd:bg-base-200/40">
      <img
        src={iconUrl(config.pathImage)}
        alt={iconLabel(config.pathImage)}
        className="size-8 object-scale-down"
        draggable={false}
      />
      <span className="text-sm truncate">{iconLabel(config.pathImage)}</span>
      <input
        type="checkbox"
        className="checkbox checkbox-sm"
        checked={config.enabled}
        onChange={(e) => {
          const enabled = e.currentTarget.checked;
          setConfig('enabled', enabled);
          if (!enabled) {
            setConfig('required', false);
          }
        }}
      />
      <input
        type="checkbox"
        className="checkbox checkbox-sm"
        checked={config.required}
        disabled={!config.enabled}
        onChange={(e) => {
          const required = e.currentTarget.checked;
          setConfig('required', required);
          if (required) {
            setConfig('enabled', true);
          }
        }}
      />
      <input
        type="number"
        className="input input-sm w-20 bg-transparent"
        value={config.weight}
        min={0}
        step={0.1}
        disabled={!config.enabled}
        onChange={(e) => {
          const value = e.currentTarget.valueAsNumber;
          setConfig('weight', Number.isFinite(value) ? Math.max(value, 0) : 0);
        }}
      />
    </div>
  );
};
