import { IconRefresh } from '../../libs/icons/Refresh';

type Props = {
  onClick: () => void;
};

export const ShuffleButton = ({ onClick }: Props) => (
  <button
    className="btn btn-primary btn-sm btn-circle"
    onClick={onClick}
    aria-label="チーム分けをシャッフル"
  >
    <span className="fill-current stroke-current size-4">
      <IconRefresh />
    </span>
  </button>
);
