import { useAtom } from 'jotai';
import { useMemo, useCallback } from 'react';
import { teamMembersAtom, teamsCountAtom } from './store/teamMembers';
import { shuffleArray } from '../libs/random';
import { TeamColumn } from './teams/TeamColumn';
import { ShuffleButton } from './teams/ShuffleButton';
import { OpenEditMembersButton } from './teams/OpenEditMembersButton';
import { useMarkerColorsValue } from './store/colors/colors';
import { IconAdd } from '../libs/icons/Add';
import { IconRemove } from '../libs/icons/Remove';
import { useAtomCallback } from 'jotai/utils';

const RANDOM_SEED_MULTIPLIER = 1000000;

export const TeamMembersContainer = () => {
  const [allMembers, setAllMembers] = useAtom(teamMembersAtom);
  const colors = useMarkerColorsValue();

  const teams = useMemo(() => {
    return allMembers
      .filter((v) => v.enabled)
      .reduce(
        (acc, member, originalIndex) => {
          const teamId = member.index;
          acc[teamId] ??= [];
          acc[teamId].push({ ...member, originalIndex });
          return acc;
        },
        [] as Array<{ name: string; index: number; originalIndex: number }[]>,
      );
  }, [allMembers]);

  const shuffleTeamMembers = useAtomCallback(
    useCallback((_, set, teamsCount: number) => {
      set(teamMembersAtom, (prev) => {
        const grouped = Object.groupBy(prev, (v) =>
          v.enabled ? 'enabled' : 'disabled',
        );

        const enableds = grouped.enabled ?? [];
        const disableds = grouped.disabled ?? [];

        const balancedIndices = Array.from(
          { length: enableds.length },
          (_, i) => i % teamsCount,
        );
        const shuffled = shuffleArray(
          balancedIndices,
          Math.random() * RANDOM_SEED_MULTIPLIER,
        );
        return [
          ...shuffled.map((newTeamIndex, i) => ({
            ...enableds[i],
            index: newTeamIndex,
          })),
          ...disableds,
        ];
      });
    }, []),
  );

  const changeTeamsCount = useAtomCallback(
    useCallback(
      (get, set, act: '+' | '-') => {
        const currentTeamsCount = get(teamsCountAtom);
        const newTeamsCount =
          act === '+'
            ? currentTeamsCount > 3
              ? currentTeamsCount
              : currentTeamsCount + 1
            : currentTeamsCount < 3
              ? currentTeamsCount
              : currentTeamsCount - 1;

        if (newTeamsCount === currentTeamsCount) {
          return;
        }

        set(teamsCountAtom, newTeamsCount);
        shuffleTeamMembers(newTeamsCount);
      },
      [shuffleTeamMembers],
    ),
  );

  const handleNameChange = useCallback(
    (targetIndex: number, newName: string) => {
      setAllMembers((prev) =>
        prev.map((member, i) =>
          i === targetIndex ? { ...member, name: newName } : member,
        ),
      );
    },
    [setAllMembers],
  );

  const onShuffleButtonClicked = useAtomCallback(
    useCallback(
      (get) => shuffleTeamMembers(get(teamsCountAtom)),
      [shuffleTeamMembers],
    ),
  );

  return (
    <div className="grid px-16 grid-cols-[1fr_auto] gap-8">
      <div
        className="grid gap-8 justify-center"
        style={{
          gridTemplateColumns: `repeat(${teams.length}, 1fr)`,
        }}
      >
        {teams.map((members, i) => (
          <TeamColumn
            key={`team-${i}`}
            teamNumber={i + 1}
            color={colors.at(i)}
            members={members}
            onMemberNameChange={handleNameChange}
          />
        ))}
      </div>

      <div className="grid gap-2 place-content-start">
        <div className="join join-horizontal">
          <button
            className="btn join-item btn-primary btn-xs"
            onClick={() => changeTeamsCount('-')}
          >
            <span className="fill-current size-4">
              <IconRemove />
            </span>
          </button>
          <button
            className="btn join-item btn-primary btn-xs"
            onClick={() => changeTeamsCount('+')}
          >
            <span className="fill-current size-4">
              <IconAdd />
            </span>
          </button>
        </div>
        <ShuffleButton onClick={onShuffleButtonClicked} />
        <OpenEditMembersButton />
      </div>
    </div>
  );
};
