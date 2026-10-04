import { useAtom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useMemo, useCallback } from "react";

import { IconAdd } from "../libs/icons/Add";
import { IconGroup } from "../libs/icons/Group";
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
  const teamsCount = useAtomValue(teamsCountAtom);
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
    <div className="@container flex flex-col gap-2 p-2">
      <div className="rounded-box bg-base-200 flex items-center gap-2 p-1">
        <div className="tooltip tooltip-bottom" data-tip="チーム数">
          <div className="flex items-center">
            <button
              className="btn btn-ghost btn-xs btn-square"
              aria-label="チームを減らす"
              disabled={teamsCount <= 2}
              onClick={() => changeTeamsCount("-")}
            >
              <span className="size-4 fill-current">
                <IconRemove />
              </span>
            </button>
            <span className="flex items-center gap-1 px-1 text-sm font-bold">
              <span className="size-4 fill-current opacity-70">
                <IconGroup />
              </span>
              {teamsCount}
            </span>
            <button
              className="btn btn-ghost btn-xs btn-square"
              aria-label="チームを増やす"
              disabled={teamsCount >= 4}
              onClick={() => changeTeamsCount("+")}
            >
              <span className="size-4 fill-current">
                <IconAdd />
              </span>
            </button>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ShuffleButton onClick={onShuffleButtonClicked} />
          <OpenEditMembersButton />
        </div>
      </div>

      <div
        className="grid items-start gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 9rem), 1fr))" }}
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
    </div>
  );
};
