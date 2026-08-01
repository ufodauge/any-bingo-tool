import { useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useMemo, useCallback } from "react";

import { IconAdd } from "../libs/icons/Add";
import { IconRemove } from "../libs/icons/Remove";
import { shuffleArray } from "../libs/random";
import { useMarkerColorsValue } from "./store/colors/colors";
import { teamMembersAtom, teamsCountAtom } from "./store/teamMembers";
import { OpenEditMembersButton } from "./teams/OpenEditMembersButton";
import { ShuffleButton } from "./teams/ShuffleButton";
import { TeamColumn } from "./teams/TeamColumn";

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
        const grouped = Object.groupBy(prev, (v) => (v.enabled ? "enabled" : "disabled"));

        const enables = grouped.enabled ?? [];
        const disables = grouped.disabled ?? [];

        const balancedIndices = Array.from({ length: enables.length }, (_, i) => i % teamsCount);
        const shuffled = shuffleArray(balancedIndices, Math.random() * RANDOM_SEED_MULTIPLIER);
        return [
          ...shuffled.map((newTeamIndex, i) => ({
            ...enables[i],
            index: newTeamIndex,
          })),
          ...disables,
        ];
      });
    }, []),
  );

  const changeTeamsCount = useAtomCallback(
    useCallback(
      (get, set, act: "+" | "-") => {
        const currentTeamsCount = get(teamsCountAtom);
        const newTeamsCount =
          act === "+"
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
        prev.map((member, i) => (i === targetIndex ? { ...member, name: newName } : member)),
      );
    },
    [setAllMembers],
  );

  const onShuffleButtonClicked = useAtomCallback(
    useCallback((get) => shuffleTeamMembers(get(teamsCountAtom)), [shuffleTeamMembers]),
  );

  return (
    <div className="grid grid-cols-[1fr_auto] gap-8 px-16">
      <div
        className="grid items-start justify-center gap-8"
        style={{
          gridTemplateColumns: `repeat(${teams.length}, minmax(12rem, auto))`,
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

      <div className="grid place-content-start gap-2">
        <div className="join join-horizontal">
          <button
            className="btn join-item btn-primary btn-xs"
            onClick={() => changeTeamsCount("-")}
          >
            <span className="size-4 fill-current">
              <IconRemove />
            </span>
          </button>
          <button
            className="btn join-item btn-primary btn-xs"
            onClick={() => changeTeamsCount("+")}
          >
            <span className="size-4 fill-current">
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
