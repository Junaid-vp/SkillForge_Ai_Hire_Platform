import { createBrowserRouter } from "react-router-dom";
import Home from "./Home/Home";
import SignUp from "./Authentication/SignUp";
import RollSelection from "./Pages/RollSelection";
import Login from "./Authentication/Login";
import Dashboard from "./Pages/Dashboard";
import DashboardLayout from "./Components/DashBoardLayort";
import CreateInterview from "./Pages/CreateInterview";
import DeveloperList from "./Pages/DeveloperList";
import ScheduledInterview from "./Pages/SheduledInterview";
import TaskLibraryList from "./Pages/TaskList";
import TaskLibraryEdit from "./Pages/TaskEdit";
import TaskPreview from "./Pages/TaskPreview";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/rollselection",
    element: <RollSelection />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index:true,
        element: <Dashboard />,

      },{
        path:'/dashboard/create-interview',
        element:<CreateInterview/>
      },
      {
        path:'/dashboard/developers',
        element:<DeveloperList/>
      },
      {
        path:'/dashboard/schedule',
        element:<ScheduledInterview/>

      },
      {
        path:'/dashboard/task-library',
        element:<TaskLibraryList/>
      },
      {
       path:'/dashboard/task-create',
       element:<TaskLibraryEdit/>

      },
       {
       path:'/dashboard/task-edit/:id',
       element:<TaskLibraryEdit/>
      },
      {
        path:'/dashboard/task-preview/:id',
        element:<TaskPreview/>
      }
    ],
  },
]);