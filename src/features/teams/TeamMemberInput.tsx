type TeamMemberInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export const TeamMemberInput = ({ value, onChange }: TeamMemberInputProps) => (
  <input
    type="text"
    placeholder="member?"
    className="input input-sm bg-base-100 w-full"
    value={value}
    onChange={(e) => onChange(e.currentTarget.value)}
  />
);
