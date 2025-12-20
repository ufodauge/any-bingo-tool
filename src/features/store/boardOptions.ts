import { atom } from 'jotai';
import { getCurrentQueryParams } from '../../libs/getCurrentQueryParams';

const cellSizeModes = ['normal', 'random-square', 'random'] as const;
type CellSizeMode = (typeof cellSizeModes)[number];
const isCellSizeModes = (str: string): str is CellSizeMode =>
  cellSizeModes.includes(str as never);

const cellSizeModePrimitiveAtom = atom<CellSizeMode>('normal');
export const cellSizeModeAtom = atom(
  (get) => {
    const primitive = get(cellSizeModePrimitiveAtom);
    const queryParams = getCurrentQueryParams();
    const raw = queryParams.get('cell-size-mode');

    if (raw) {
      return isCellSizeModes(raw) ? raw : 'normal';
    }

    return primitive ?? 'normal';
  },
  (_get, set, mode: CellSizeMode) => {
    const queryParams = getCurrentQueryParams();
    queryParams.set('cell-size-mode', mode);
    const paramsStr = [...queryParams.entries()]
      .map((v) => v.join('='))
      .join('&');

    history.replaceState(
      history.state,
      '',
      `${document.location.pathname}?${paramsStr}`
    );

    set(cellSizeModePrimitiveAtom, mode);
  }
);
