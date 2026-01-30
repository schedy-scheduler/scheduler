import { Route, Routes as RoutesComponent } from "react-router-dom";
import { Scheduler } from "./pages";
import { Success } from "./pages/success";

export const Routes: React.FC = () => {
  return (
    <RoutesComponent>
      <Route path="/:slug" element={<Scheduler />} />
      <Route path="/:slug/success" element={<Success />} />
    </RoutesComponent>
  );
};
