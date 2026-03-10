// 优化版公众号选择器组件

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppstoreOutlined, CheckOutlined } from '@ant-design/icons';
import type { Account } from '../types/account';
import './AccountSelectorOptimized.css';

interface AccountSelectorOptimizedProps {
  accounts: Account[];
  currentAccount: Account;
  onAccountChange: (account: Account) => void;
}

const AccountSelectorOptimized: React.FC<AccountSelectorOptimizedProps> = ({
  accounts,
  currentAccount,
  onAccountChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 计算下拉菜单位置
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  // 处理滚动和窗口大小变化
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const handleChange = (account: Account) => {
    onAccountChange(account);
    setIsOpen(false);
  };

  return (
    <div className="account-selector-optimized" ref={dropdownRef}>
      <div className="selector-label">
        <AppstoreOutlined />
        <span>选择公众号</span>
      </div>
      
      <div className="selector-dropdown">
        <div 
          className="selector-trigger"
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
        >
          <img 
            src={currentAccount.avatar} 
            alt={currentAccount.accountName}
            className="selector-avatar"
          />
          <div className="selector-info">
            <div className="selector-name">{currentAccount.accountName}</div>
            <div className="selector-desc">{currentAccount.description}</div>
          </div>
          <div className={`selector-arrow ${isOpen ? 'open' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {isOpen && createPortal(
          <div 
            className="selector-menu"
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 99999
            }}
          >
            {accounts.map((account, index) => (
              <div
                key={account.id}
                className={`selector-option ${account.id === currentAccount.id ? 'selected' : ''}`}
                onClick={() => handleChange(account)}
                style={{
                  animation: `fadeInUp 200ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms both`
                }}
              >
                <img 
                  src={account.avatar} 
                  alt={account.accountName}
                  className="option-avatar"
                />
                <div className="option-info">
                  <div className="option-name">{account.accountName}</div>
                  <div className="option-desc">{account.description}</div>
                </div>
                {account.id === currentAccount.id && (
                  <div className="option-check">
                    <CheckOutlined />
                  </div>
                )}
              </div>
            ))}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default AccountSelectorOptimized;
