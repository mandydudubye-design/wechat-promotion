// 简化版公众号选择器（不依赖Ant Design）

import React from 'react';
import { AppstoreOutlined } from '@ant-design/icons';
import type { Account } from '../types/account';
import './AccountSelectorSimple.css';

interface AccountSelectorProps {
  accounts: Account[];
  currentAccount: Account;
  onAccountChange: (account: Account) => void;
  showAvatar?: boolean;
}

const AccountSelectorSimple: React.FC<AccountSelectorProps> = ({
  accounts,
  currentAccount,
  onAccountChange,
  showAvatar = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleChange = (account: Account) => {
    onAccountChange(account);
    setIsOpen(false);
  };

  return (
    <div className="account-selector-simple">
      <div className="account-selector-label">
        <AppstoreOutlined />
        <span>选择公众号</span>
      </div>
      
      <div className="account-selector-dropdown">
        <div 
          className="account-selector-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          {showAvatar && (
            <img 
              src={currentAccount.avatar} 
              alt={currentAccount.accountName}
              className="account-selector-avatar"
            />
          )}
          <div className="account-selector-info">
            <div className="account-selector-name">{currentAccount.accountName}</div>
            <div className="account-selector-desc">{currentAccount.description}</div>
          </div>
          <div className={`account-selector-arrow ${isOpen ? 'open' : ''}`}>▼</div>
        </div>

        {isOpen && (
          <div className="account-selector-menu">
            {accounts.map(account => (
              <div
                key={account.id}
                className={`account-selector-option ${account.id === currentAccount.id ? 'selected' : ''}`}
                onClick={() => handleChange(account)}
              >
                {showAvatar && (
                  <img 
                    src={account.avatar} 
                    alt={account.accountName}
                    className="account-option-avatar"
                  />
                )}
                <div className="account-option-info">
                  <div className="account-option-name">{account.accountName}</div>
                  <div className="account-option-desc">{account.description}</div>
                </div>
                {account.id === currentAccount.id && (
                  <div className="account-option-check">✓</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSelectorSimple;
