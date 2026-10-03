import { Header } from "./features/Header";
import { IconResourceLoader } from "./features/icons/IconResourceLoader";
import { MainBoardContainer } from "./features/MainBoardContainer";
import { TeamMembersContainer } from "./features/TeamMembersContainer";

export const App = () => {
  return (
    // 画面全体を 1 画面に収めるサイズコンテナ。配置は index.css の .app-layout (コンテナクエリ) で切り替える
    <div className="app-root">
      <div className="app-layout">
        <IconResourceLoader />
        <div className="app-header min-w-0 p-2">
          <Header />
        </div>
        <div className="app-board min-h-0 min-w-0">
          <MainBoardContainer />
        </div>
        <div className="app-team min-h-0 min-w-0 overflow-hidden">
          <TeamMembersContainer />
        </div>
      </div>
    </div>
  );
};
