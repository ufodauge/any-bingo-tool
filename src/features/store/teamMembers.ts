import { atomWithStorage } from 'jotai/utils';

export type Member = {
  name: string;
  index: number;
  enabled: boolean;
  id: string;
};

export const DEFAULT_NAMES: readonly string[] = [
  'アネモネ',
  'ヘリオトロープ',
  'ネモフィラ',
  'カラーリリィ',
  'マーガレット ソル',
  'マーガレット ルナ',
  'エーデルワイス',
  'サンフラワー',
];

const memberInit: Member[] = DEFAULT_NAMES.map((v, i) => ({
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
  },
);

export const teamsCountAtom = atomWithStorage('team:team-count', 2, undefined, {
  getOnInit: true,
});
