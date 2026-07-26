import { Header } from './features/Header';
import { IconResourceLoader } from './features/icons/IconResourceLoader';
import { MainBoardContainer } from './features/MainBoardContainer';
import { SubHeader } from './features/SubHeader';
import { TeamMembersContainer } from './features/TeamMembersContainer';

export const App = () => {
  return (
    <div className="grid gap-2">
      <IconResourceLoader />
      <div className="p-2 sticky top-0 z-10">
        <Header />
      </div>
      <div className="p-2 px-6">
        <SubHeader />
      </div>
      <MainBoardContainer />
      <TeamMembersContainer />
    </div>
  );
};
