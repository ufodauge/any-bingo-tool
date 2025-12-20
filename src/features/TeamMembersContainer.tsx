import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { teamMembersAtom } from './store/teamMembers';
import { shuffleArray } from '../libs/random';
import { IconRefresh } from '../libs/icons/Refresh';

// 定数を定義（マジックナンバーの排除）
const TEAM_COUNT = 2;
const RANDOM_SEED_MULTIPLIER = 1000000;

export const TeamMembersContainer = () => {
  const [allMembers, setAllMembers] = useAtom(teamMembersAtom);

  // メンバーをチームごとにグループ化
  // 同時に「元の配列でのインデックス」を保持し、更新時に特定できるようにする
  const teams = useMemo(() => {
    return allMembers.reduce((acc, member, originalIndex) => {
      const teamId = member.index;
      acc[teamId] ??= [];

      acc[teamId].push({
        ...member,
        originalIndex, // 重要: 更新操作のために元の位置を覚えておく
      });

      return acc;
    }, [] as Array<{ name: string; index: number; originalIndex: number }[]>);
  }, [allMembers]);

  // ハンドラー: メンバーの名前変更
  const handleNameChange = (targetOriginalIndex: number, newName: string) => {
    setAllMembers((prev) =>
      prev.map((member, index) =>
        index === targetOriginalIndex ? { ...member, name: newName } : member
      )
    );
  };

  // ハンドラー: チームシャッフル
  const handleShuffle = () => {
    setAllMembers((prev) => {
      // 0, 1, 0, 1... のような均等なチーム割り当て配列を作成
      const balancedIndices = Array.from(
        { length: prev.length },
        (_, i) => i % TEAM_COUNT
      );

      const shuffledIndices = shuffleArray(
        balancedIndices,
        Math.random() * RANDOM_SEED_MULTIPLIER
      );

      return shuffledIndices.map((newTeamIndex, i) => ({
        ...prev[i],
        index: newTeamIndex,
      }));
    });
  };

  return (
    <div className="grid place-items-center">
      <div
        className="grid gap-8 items-start"
        style={{
          // チーム数に応じて列を動的に生成 + リフレッシュボタン用の列
          gridTemplateColumns: `repeat(${teams.length}, 1fr) auto`,
        }}
      >
        {teams.map((members, teamIndex) => (
          <div key={`team-col-${teamIndex}`} className="grid gap-2">
            <span className="label">チーム {teamIndex + 1}</span>

            {members.map((member) => (
              <input
                key={`member-${member.originalIndex}`} // キーを一意にするため元のインデックスを使用
                type="text"
                placeholder="member?"
                className="input input-sm"
                value={member.name}
                onChange={(e) =>
                  handleNameChange(member.originalIndex, e.currentTarget.value)
                }
              />
            ))}
          </div>
        ))}

        {/* シャッフルボタンエリア */}
        <div className="grid">
          <button
            className="btn btn-primary"
            onClick={handleShuffle}
            aria-label="チーム分けをシャッフル"
          >
            <span className="fill-current stroke-current size-4">
              <IconRefresh />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
