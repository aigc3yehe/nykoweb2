import React from 'react';
import styles from './StatePrompt.module.css';
import emptyDataIcon from '../assets/empty_data.svg';

interface StatePromptProps {
  message: string;
  action?: {
    text: string;
    onClick: () => void;
    loading?: boolean;
  };
  showIcon?: boolean;
}

const StatePrompt: React.FC<StatePromptProps> = ({ message, action, showIcon = true }) => {
  return (
    <div className={styles.statePrompt}>
      {showIcon && <img src={emptyDataIcon} alt="State icon" width={80} height={80} />}
      <span className={styles.message}>{message}</span>
      {action && (
        <button 
          className={styles.actionButton}
          onClick={action.onClick}
          disabled={action.loading}
        >
          {action.loading ? 'Processing...' : action.text}
        </button>
      )}
    </div>
  );
};

export default StatePrompt; 