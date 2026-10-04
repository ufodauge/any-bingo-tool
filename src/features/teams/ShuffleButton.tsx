import { IconShuffle } from "../../libs/icons/Shuffle";

type Props = {
  onClick: () => void;
};

export const ShuffleButton = ({ onClick }: Props) => (
  <div className="tooltip tooltip-bottom" data-tip="チーム分けをシャッフル">
    <button
      className="btn btn-sm btn-primary btn-square"
      onClick={onClick}
      aria-label="チーム分けをシャッフル"
    >
      <span className="size-5 fill-current">
        <IconShuffle />
      </span>
    </button>
  </div>
);
