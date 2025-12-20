import { TeamMemberInput } from './TeamMemberInput';

type TeamColumnProps = {
  teamNumber: number;
  color?: string;
  members: Array<{ name: string; originalIndex: number }>;
  onMemberNameChange: (originalIndex: number, name: string) => void;
};

export const TeamColumn = ({
  teamNumber,
  members,
  color,
  onMemberNameChange,
}: TeamColumnProps) => {
  return (
    <div className="grid gap-2">
      <span
        className={`label font-bold`}
        style={{
          color,
        }}
      >
        チーム {teamNumber}
      </span>
      {members.map((member) => (
        <TeamMemberInput
          key={member.originalIndex}
          value={member.name}
          onChange={(newName) =>
            onMemberNameChange(member.originalIndex, newName)
          }
        />
      ))}
    </div>
  );
};
