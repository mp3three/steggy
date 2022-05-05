import 'antd/dist/antd.dark.min.css';
import './styles.css';

import { ConfigProvider } from 'antd';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './components';

ConfigProvider.config({
  theme: {
    // primaryColor: '#ff0000',
  },
});

const root = ReactDOM.createRoot(
  document.querySelector('#root') as HTMLElement,
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
);
