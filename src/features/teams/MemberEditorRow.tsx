import { IconDelete } from '../../libs/icons/Delete';
import type { Member } from '../store/teamMembers';

type Props = {
  member: Member;
  setMember: <Key extends keyof Member>(field: Key, value: Member[Key]) => void;
  removeMember: (id: string) => void;
};

export const MemberEditorRow = ({ member, setMember, removeMember }: Props) => {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
      <input
        type="checkbox"
        className="checkbox"
        checked={member.enabled}
        onChange={(e) => setMember('enabled', e.currentTarget.checked)}
      />
      <input
        type="text"
        className="input bg-transparent"
        value={member.name}
        onChange={(e) => setMember('name', e.currentTarget.value)}
      />

      <button
        className="btn btn-error btn-ghost btn-sm btn-circle"
        type="button"
        onClick={() => removeMember(member.id)}
      >
        <span className="fill-current size-4">
          <IconDelete />
        </span>
      </button>
    </div>
  );
};
