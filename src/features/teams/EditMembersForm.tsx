import { useAtom } from 'jotai';
import { teamMembersAtom } from '../store/teamMembers';
import { IconDelete } from '../../libs/icons/Delete';
import { useState } from 'react';

export const EditMembersForm = ({ closeSelf }: { closeSelf: () => void }) => {
  const [allMembers, setAllMembers] = useAtom(teamMembersAtom);
  const [tempAllMembers, setTempAllMembers] = useState(allMembers);

  return (
    <form
      className="grid gap-6"
      action={(data) => {
        type Member = (typeof allMembers)[number];

        setAllMembers((prev) => {
          const newValues: Member[] = data
            .entries()
            .filter(([k]) => k.endsWith(':id'))
            .map(([k, id]) => {
              const [indexStr] = k.split(':');

              const enabled =
                data.get(`${indexStr}:enabled`)?.toString() === 'on';
              const name = data.get(`${indexStr}:name`)?.toString();

              const member = prev.find((v) => v.id === id);
              if (member === undefined) {
                return {
                  id: id.toString(),
                  index: 0,
                  enabled: enabled,
                  name: name ?? '(name)',
                } satisfies Member;
              }

              return {
                ...member,
                index: member.index,
                enabled: enabled,
                name: name ?? '(name)',
              };
            })
            .toArray();

          return newValues;
        });

        closeSelf();
      }}
    >
      <h2 className="text-2xl font-bold">メンバーの編集</h2>
      <div className="grid gap-2 overflow-y-visible max-h-[40svh] overflow-auto">
        {tempAllMembers.map((v, i) => (
          <div
            key={`${v.name}-${i}`}
            className="grid grid-cols-[auto_1fr_auto] gap-2 items-center"
          >
            <input name={`${i}:id`} value={v.id} hidden readOnly />
            <input
              type="checkbox"
              className="checkbox"
              name={`${i}:enabled`}
              defaultChecked={v.enabled}
            />
            <input
              type="text"
              name={`${i}:name`}
              defaultValue={v.name}
              className="input bg-transparent"
            />
            <button
              className="btn btn-error btn-circle"
              type="button"
              onClick={() =>
                setTempAllMembers((prev) => prev.filter((_, j) => i !== j))
              }
            >
              <span className="fill-current size-4">
                <IconDelete />
              </span>
            </button>
          </div>
        ))}
      </div>
      <div className="px-4 grid">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            setTempAllMembers((prev) => [
              ...prev,
              {
                enabled: true,
                id: crypto.randomUUID(),
                index: 0,
                name: '(name)',
              },
            ])
          }
        >
          メンバーを追加
        </button>
        <div className="divider"></div>
        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <button type="submit" className="btn btn-secondary">
            キャンセル
          </button>
          <button type="submit" className="btn btn-primary">
            変更を保存
          </button>
        </div>
      </div>
    </form>
  );
};
