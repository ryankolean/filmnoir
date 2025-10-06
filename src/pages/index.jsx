import Layout from "./Layout.jsx";

import Camera from "./Camera";

import Gallery from "./Gallery";

import Editor from "./Editor";

import Settings from "./Settings";

import Groups from "./Groups";

import DataManagement from "./DataManagement";

import Login from "./Login";

import SignUp from "./SignUp";

import ResetPassword from "./ResetPassword";

import AuthCallback from "./AuthCallback";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Camera: Camera,

    Gallery: Gallery,

    Editor: Editor,

    Settings: Settings,

    Groups: Groups,

    DataManagement: DataManagement,

    Login: Login,

    SignUp: SignUp,

    ResetPassword: ResetPassword,

    AuthCallback: AuthCallback,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    const isAuthPage = ['/Login', '/SignUp', '/ResetPassword', '/auth/callback'].includes(location.pathname);

    if (isAuthPage) {
        return (
            <Routes>
                <Route path="/Login" element={<Login />} />
                <Route path="/SignUp" element={<SignUp />} />
                <Route path="/ResetPassword" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
        );
    }

    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
                <Route path="/Camera" element={<ProtectedRoute><Camera /></ProtectedRoute>} />
                <Route path="/Gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
                <Route path="/Editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
                <Route path="/Settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/Groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                <Route path="/DataManagement" element={<ProtectedRoute><DataManagement /></ProtectedRoute>} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}