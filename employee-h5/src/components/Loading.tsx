// 加载状态组件
import React from 'react';
import './Loading.css';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ text = '加载中...', fullScreen = false }) => {
  return (
    <div className={`loading-wrapper ${fullScreen ? 'full-screen' : ''}`}>
      <div className="loading-spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default Loading;