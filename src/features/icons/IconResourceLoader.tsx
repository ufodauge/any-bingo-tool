import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { iconResourceUrlAtom, loadIconResourceAtom } from '../store/iconResource';

export const IconResourceLoader = () => {
  const url = useAtomValue(iconResourceUrlAtom);
  const loadIconResource = useSetAtom(loadIconResourceAtom);

  useEffect(() => {
    loadIconResource(url);
  }, [url, loadIconResource]);

  return null;
};
