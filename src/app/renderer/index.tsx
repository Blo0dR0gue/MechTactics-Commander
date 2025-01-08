import './styles/main.scss';
import { HashRouter, Route, Routes } from 'react-router';

import React from 'react';
import ReactDOM from 'react-dom/client';
import UniverseCanvas from './map/components/UniverseCanvas';
import { Config } from './utils/Config';

Config.getInstance().buildCache();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<UniverseCanvas />}></Route>
    </Routes>
  </HashRouter>
);
