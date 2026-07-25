import { useAtom } from 'jotai';
import { iconConfigsAtom } from '../store/icons';
import { IconConfigRow } from './IconConfigRow';

export const EditIconsForm = () => {
  const [iconConfigs, setIconConfigs] = useAtom(iconConfigsAtom);

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">出現する要素の設定</h2>
      <p className="text-sm text-base-content/70 px-2">
        「候補」を外した要素は盤面に出現しません。「必須」を付けた要素は盤面に必ず1つ出現します。「出現率」は候補の中での選ばれやすさの比率です（大きいほど出現しやすくなります）。
      </p>

      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 max-h-[50svh] overflow-auto px-2">
        <div className="grid grid-cols-subgrid col-span-full items-center px-2 pb-1 text-xs font-bold sticky top-0 bg-base-100/90 backdrop-blur">
          <span />
          <span>要素</span>
          <span>候補</span>
          <span>必須</span>
          <span>出現率</span>
        </div>
        {iconConfigs.map((config) => (
          <IconConfigRow
            key={config.pathImage}
            config={config}
            setConfig={(field, value) =>
              setIconConfigs((prev) =>
                prev.map((c) =>
                  c.pathImage === config.pathImage
                    ? { ...c, [field]: value }
                    : c,
                ),
              )
            }
          />
        ))}
      </div>
    </div>
  );
};
