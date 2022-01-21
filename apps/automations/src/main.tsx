import 'antd/dist/antd.dark.min.css';

import { ConfigProvider } from 'antd';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { App } from './components';
ConfigProvider.config({
  theme: {
    // primaryColor: '#ff0000',
  },
});

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
  document.querySelector('#root'),
);
