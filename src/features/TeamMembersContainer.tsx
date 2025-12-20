import { useAtom } from 'jotai';
import { useMemo, useCallback } from 'react';
import { teamMembersAtom } from './store/teamMembers';
import { shuffleArray } from '../libs/random';
import { TeamColumn } from './teams/TeamColumn';
import { ShuffleButton } from './teams/ShuffleButton';
import { OpenEditMembersButton } from './teams/OpenEditMembersButton';
import { useMarkerColorsValue } from './store/colors/colors';

const TEAM_COUNT = 2;
const RANDOM_SEED_MULTIPLIER = 1000000;

export const TeamMembersContainer = () => {
  const [allMembers, setAllMembers] = useAtom(teamMembersAtom);
  const colors = useMarkerColorsValue();

  const teams = useMemo(() => {
    return allMembers
      .filter((v) => v.enabled)
      .reduce((acc, member, originalIndex) => {
        const teamId = member.index;
        acc[teamId] ??= [];
        acc[teamId].push({ ...member, originalIndex });
        return acc;
      }, [] as Array<{ name: string; index: number; originalIndex: number }[]>);
  }, [allMembers]);

  const handleNameChange = useCallback(
    (targetIndex: number, newName: string) => {
      setAllMembers((prev) =>
        prev.map((member, i) =>
          i === targetIndex ? { ...member, name: newName } : member
        )
      );
    },
    [setAllMembers]
  );

  const handleShuffle = useCallback(() => {
    setAllMembers((prev) => {
      const grouped = Object.groupBy(prev, (v) =>
        v.enabled ? 'enabled' : 'disabled'
      );

      const enableds = grouped.enabled ?? [];
      const disableds = grouped.disabled ?? [];

      const balancedIndices = Array.from(
        { length: enableds.length },
        (_, i) => i % TEAM_COUNT
      );
      const shuffled = shuffleArray(
        balancedIndices,
        Math.random() * RANDOM_SEED_MULTIPLIER
      );
      return [
        ...shuffled.map((newTeamIndex, i) => ({
          ...enableds[i],
          index: newTeamIndex,
        })),
        ...disableds,
      ];
    });
  }, [setAllMembers]);

  return (
    <div className="grid place-items-center">
      <div
        className="grid gap-8 items-start"
        style={{ gridTemplateColumns: `repeat(${teams.length}, 1fr) auto` }}
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

        <div className="grid gap-2">
          <ShuffleButton onClick={handleShuffle} />
          <OpenEditMembersButton />
        </div>
      </div>
    </div>
  );
};
