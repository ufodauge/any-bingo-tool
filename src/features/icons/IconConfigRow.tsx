import type { IconConfig, IconConfigWithResource } from "../store/icons";

type Props = {
  config: IconConfigWithResource;
  setConfig: <Key extends keyof IconConfig>(field: Key, value: IconConfig[Key]) => void;
};

export const IconConfigRow = ({ config, setConfig }: Props) => {
  return (
    <div className="odd:bg-base-200/40 col-span-full grid grid-cols-subgrid items-center gap-3 rounded-md px-2 py-1">
      <img
        src={config.url}
        alt={config.label}
        className="size-8 object-scale-down"
        draggable={false}
      />
      <span className="truncate text-sm">{config.label}</span>
      <input
        type="checkbox"
        className="checkbox checkbox-sm"
        checked={config.enabled}
        onChange={(e) => {
          const enabled = e.currentTarget.checked;
          setConfig("enabled", enabled);
          if (!enabled) {
            setConfig("required", false);
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
          setConfig("required", required);
          if (required) {
            setConfig("enabled", true);
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
          setConfig("weight", Number.isFinite(value) ? Math.max(value, 0) : 0);
        }}
      />
    </div>
  );
};
