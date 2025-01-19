import App from "../App";
import Challenges from "../pages/Challenges";
import Courses from "../pages/Courses";
import TaskPage from "../pages/Task";
import CourseDashboard from "../pages/Tasks";
import { createBrowserRouter } from 'react-router-dom';
import React from "react";
import LoginPage from "../pages/Login";
import HomePage from "../pages/Home";
import AdminPanel from "../pages/Admin";
import UnAuthenticated from "../pages/OAuthLogin";
import OAuthCallback from "../pages/OAuthCallback";
import ProtectedRoute from "./ProtectedRoute";
import OAuthLogin from "../pages/OAuthLogin";


const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '',
                element: <HomePage />,
            },
            {
                path: 'courses',
                element: <ProtectedRoute><Courses /></ProtectedRoute>,
            },
            {
                path: 'course/:id',
                element: <ProtectedRoute><CourseDashboard /></ProtectedRoute>,
            },
            {
                path: 'task/:id',
                element: <ProtectedRoute><TaskPage /></ProtectedRoute>,
            },
            {
                path: 'tasks/:id',
                element: <ProtectedRoute><Challenges /></ProtectedRoute>,
            },
            {  
                path: 'admin',
                element: <ProtectedRoute><AdminPanel /></ProtectedRoute>,
            },
        ],
    },
    {
        path: "/login",
        element: <OAuthLogin />,
    },{
        path: "/oauth/callback",
        element: <OAuthCallback/>,
    },

]);

export default router;
