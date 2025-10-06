import Layout from "./Layout.jsx";

import Camera from "./Camera";

import Gallery from "./Gallery";

import Editor from "./Editor";

import Settings from "./Settings";

import Groups from "./Groups";

import DataManagement from "./DataManagement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Camera: Camera,
    
    Gallery: Gallery,
    
    Editor: Editor,
    
    Settings: Settings,
    
    Groups: Groups,
    
    DataManagement: DataManagement,
    
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

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Camera />} />
                
                
                <Route path="/Camera" element={<Camera />} />
                
                <Route path="/Gallery" element={<Gallery />} />
                
                <Route path="/Editor" element={<Editor />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Groups" element={<Groups />} />
                
                <Route path="/DataManagement" element={<DataManagement />} />
                
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