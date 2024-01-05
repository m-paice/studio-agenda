import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Home } from "./views/Home";

const router = createBrowserRouter([
  {
    path: "/:id",
    element: <Home />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
