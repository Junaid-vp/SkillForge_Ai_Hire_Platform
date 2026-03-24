import { createBrowserRouter } from "react-router-dom";
import Home from "./Home/Home";
import SignUp from "./HR/Authentication/SignUp";
import RollSelection from "./Home/RollSelection";
import Login from "./HR/Authentication/Login";
import Dashboard from "./HR/Pages/Dashboard";
import DashboardLayout from "./HR/Components/DashBoardLayort";
import CreateInterview from "./HR/Pages/CreateInterview";
import DeveloperList from "./HR/Pages/DeveloperList";
import ScheduledInterview from "./HR/Pages/SheduledInterview";
import TaskLibraryList from "./HR/Pages/TaskList";
import TaskLibraryEdit from "./HR/Pages/TaskEdit";
import TaskPreview from "./HR/Pages/TaskPreview";
import DevLogin from "./Dev/Auth/DevLogin";
import DevDashBoard from "./Dev/Page/DevDashBoard";
import Settings from "./HR/Pages/Settings";


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
      },
      {
    path:"/dashboard/settings",
    element:<Settings/>
  }
    ]
  },
  {
    path:"/devLogin",
    element:<DevLogin/>
  },
  {
    path:'/devDashboard',
    element:<DevDashBoard/>
  },
  
]);