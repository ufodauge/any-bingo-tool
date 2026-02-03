import { useAtom } from 'jotai';
import { DEFAULT_NAMES, teamMembersAtom } from '../store/teamMembers';
import { MemberEditorRow } from './MemberEditorRow';

export const EditMembersForm = () => {
  const [allMembers, setAllMembers] = useAtom(teamMembersAtom);

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">メンバーの編集</h2>

      <div className="grid gap-2 overflow-y-visible max-h-[40svh] overflow-auto">
        {allMembers.map((field) => (
          <MemberEditorRow
            key={field.id}
            member={field}
            setMember={(key, value) =>
              setAllMembers((p) =>
                p.map((v) => (v.id === field.id ? { ...v, [key]: value } : v)),
              )
            }
            removeMember={(id) =>
              setAllMembers((p) => p.filter((v) => v.id !== id))
            }
          />
        ))}
      </div>

      <div className="px-4 grid">
        <button
          type="button"
          className="btn btn-soft"
          onClick={() =>
            setAllMembers((prev) => [
              ...prev,
              {
                enabled: true,
                id: crypto.randomUUID(),
                index: 0,
                name:
                  DEFAULT_NAMES.at(
                    Math.floor(Math.random() * DEFAULT_NAMES.length),
                  ) ?? '(name)',
              },
            ])
          }
        >
          メンバーを追加
        </button>
      </div>
    </div>
  );
};
