import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type IconResourceItem = {
  id: string;
  url: string;
  label?: string;
};

type IconResourceJson = {
  icons: { id?: string; url: string; label?: string }[];
};

const baseUrl = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const DEFAULT_ICON_RESOURCE_URL = `${baseUrl}icons.json`;

export const iconResourceUrlAtom = atomWithStorage<string>(
  'icons:resource-url',
  DEFAULT_ICON_RESOURCE_URL,
  undefined,
  { getOnInit: true },
);

// 直近成功した取得結果。次回起動時はfetch完了を待たずに表示できるようにするためのキャッシュ
const cachedIconResourceItemsAtom = atomWithStorage<IconResourceItem[]>(
  'icons:resource-cache',
  [],
  undefined,
  { getOnInit: true },
);

export type IconResourceStatus =
  | { status: 'loading' }
  | { status: 'ready'; count: number }
  | { status: 'error'; message: string };

export const iconResourceStatusAtom = atom<IconResourceStatus>({
  status: 'loading',
});

export const iconResourceItemsAtom = atom((get) =>
  get(cachedIconResourceItemsAtom),
);

export const loadIconResourceAtom = atom(null, async (_get, set, url: string) => {
  set(iconResourceStatusAtom, { status: 'loading' });
  try {
    const resourceUrl = new URL(url, location.href).href;
    const res = await fetch(resourceUrl);
    if (!res.ok) {
      throw new Error(`リソースの取得に失敗しました（HTTP ${res.status}）`);
    }
    const json = (await res.json()) as IconResourceJson;
    if (!Array.isArray(json.icons)) {
      throw new Error('形式が不正です（"icons" が配列ではありません）');
    }
    const items = json.icons.map((icon, index) => {
      if (!icon.url) {
        throw new Error(`${index}番目の要素に "url" がありません`);
      }
      return {
        id: icon.id ?? icon.url,
        url: new URL(icon.url, resourceUrl).href,
        label: icon.label,
      };
    });
    if (items.length === 0) {
      throw new Error('アイコンが1件もありません');
    }

    set(cachedIconResourceItemsAtom, items);
    set(iconResourceStatusAtom, { status: 'ready', count: items.length });
  } catch (e) {
    set(iconResourceStatusAtom, {
      status: 'error',
      message: e instanceof Error ? e.message : String(e),
    });
  }
});
