import { atomWithStorage } from 'jotai/utils';

type Member = { name: string; index: number };

const memberInit: Member[] = ['jou', 'cho', 'haru', 'saru', 'hi'].map(
  (v, i) => ({
    name: v,
    index: i % 2,
  })
);

export const teamMembersAtom = atomWithStorage(
  'team:members',
  memberInit,
  undefined,
  {
    getOnInit: true,
  }
);
