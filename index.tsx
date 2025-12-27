
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // 渲染完成后，移除 HTML 里的 loader
    if (typeof (window as any).hideAppLoader === 'function') {
      (window as any).hideAppLoader();
    } else {
      const loader = document.getElementById('app-loader');
      if (loader) loader.style.display = 'none';
    }
  } catch (error) {
    console.error('React Root Render Error:', error);
    const errorDisplay = document.getElementById('error-display');
    if (errorDisplay) {
      errorDisplay.style.display = 'block';
      errorDisplay.innerText = '渲染异常: ' + (error instanceof Error ? error.message : String(error));
    }
  }
}
