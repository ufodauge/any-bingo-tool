import { TeamMemberInput } from "./TeamMemberInput";

type TeamColumnProps = {
  teamNumber: number;
  color?: string;
  members: Array<{ name: string; originalIndex: number }>;
  onMemberNameChange: (originalIndex: number, name: string) => void;
};

export const TeamColumn = ({ teamNumber, members, color, onMemberNameChange }: TeamColumnProps) => {
  return (
    <section
      className="bg-base-200 grid gap-2 rounded-md p-2 outline-3"
      style={{ outlineColor: `oklch(from ${color} l c h / 0.5)` }}
    >
      <header className="flex items-center justify-between rounded-md text-sm font-bold">
        <span>チーム {teamNumber}</span>
        <span className="badge badge-sm badge-neutral">{members.length}</span>
      </header>
      {members.map((member) => (
        <TeamMemberInput
          key={member.originalIndex}
          value={member.name}
          onChange={(newName) => onMemberNameChange(member.originalIndex, newName)}
        />
      ))}
    </section>
  );
};
