import { atomWithStorage } from 'jotai/utils';

type Member = { name: string; index: number; enabled: boolean; id: string };

const memberInit: Member[] = [
  'アネモネ',
  'ヘリオトロープ',
  'ネモフィラ',
  'カラーリリィ',
  'マーガレット ソル',
  'マーガレット ルナ',
  'エーデルワイス',
  'サンフラワー',
].map((v, i) => ({
  name: v,
  index: i % 2,
  enabled: i < 4,
  id: crypto.randomUUID(),
}));

export const teamMembersAtom = atomWithStorage(
  'team:members',
  memberInit,
  undefined,
  {
    getOnInit: true,
  }
);
