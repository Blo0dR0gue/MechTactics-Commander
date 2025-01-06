import './styles/main.scss';
import { HashRouter, Route, Routes } from 'react-router';

import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<div>Test</div>}></Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
