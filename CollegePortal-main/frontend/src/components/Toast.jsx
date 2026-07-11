import React from 'react';
import { useApp } from '../context/AppContext';

const icons = {
  success: '✅',
  error: '❌',
  default: 'ℹ️',
};

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className={`toast ${toast.type}`}>
      <span>{icons[toast.type] || icons.default}</span>
      <span>{toast.message}</span>
    </div>
  );
}
