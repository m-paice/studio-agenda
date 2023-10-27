import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-alert";
import { Home } from "./views/Home";

import "react-datepicker/dist/react-datepicker.css";
import { AlertTemplate } from "./components/AlertTemplate";

const router = createBrowserRouter([
  {
    path: "/:id",
    element: <Home />,
  },
]);

function App() {
  return (
    <Provider template={AlertTemplate} position="top right" timeout={5000}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
