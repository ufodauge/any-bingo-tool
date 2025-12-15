import { atom } from 'jotai';
import { getCurrentQueryParams } from '../../libs/getCurrentQueryParams';

const variableCellSizePrimitiveAtom = atom<boolean>();
export const variableCellSizeAtom = atom(
  (get) => {
    const primitive = get(variableCellSizePrimitiveAtom);
    const queryParams = getCurrentQueryParams();
    const raw = queryParams.get('random-cell-size');

    if (raw) {
      return raw === 'true';
    }

    return primitive ?? false;
  },
  (_get, set, bool: boolean) => {
    const queryParams = getCurrentQueryParams();
    queryParams.set('random-cell-size', bool.toString());
    const paramsStr = [...queryParams.entries()]
      .map((v) => v.join('='))
      .join('&');

    history.replaceState(
      history.state,
      '',
      `${document.location.pathname}?${paramsStr}`
    );

    set(variableCellSizePrimitiveAtom, bool);
  }
);
