import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot를 사용하여 루트 생성
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );
