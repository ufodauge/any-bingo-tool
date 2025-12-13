import { Header } from './features/Header';
import { MainBoard } from './features/MainBoard';

export const App = () => {
  return (
    <div className="grid gap-2">
      <div className="p-2 sticky top-0">
        <Header />
      </div>
      <MainBoard />
    </div>
  );
};
