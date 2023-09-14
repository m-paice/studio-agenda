import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./views/Home";

import "react-datepicker/dist/react-datepicker.css";

const router = createBrowserRouter([
  {
    path: "/:id",
    element: <Home />,
  },
]);

function App() {
  return (
    <div>
      {" "}
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
