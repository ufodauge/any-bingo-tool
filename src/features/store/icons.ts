import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import imageData from '../../libs/images.json';

export type IconConfig = {
  pathImage: string;
  enabled: boolean;
  required: boolean;
  weight: number;
};

const DEFAULT_WEIGHT = 1;

const createDefaultIconConfig = (pathImage: string): IconConfig => ({
  pathImage,
  enabled: true,
  required: false,
  weight: DEFAULT_WEIGHT,
});

const storedIconConfigsAtom = atomWithStorage<IconConfig[]>(
  'icons:config',
  imageData.icons.map(createDefaultIconConfig),
  undefined,
  {
    getOnInit: true,
  },
);

// images.json 側の要素が増減しても保存済み設定と齟齬が出ないようにマージする
export const iconConfigsAtom = atom(
  (get) => {
    const stored = new Map(
      get(storedIconConfigsAtom).map((config) => [config.pathImage, config]),
    );
    return imageData.icons.map(
      (pathImage) => stored.get(pathImage) ?? createDefaultIconConfig(pathImage),
    );
  },
  (get, set, update: (prev: IconConfig[]) => IconConfig[]) => {
    set(storedIconConfigsAtom, update(get(iconConfigsAtom)));
  },
);
