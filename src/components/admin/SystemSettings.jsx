import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';

const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">System Settings</h2>
        <p className="text-slate-600">Configure platform settings and preferences</p>
      </div>

      <div className="text-center py-12">
        <CogIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">System Settings</h3>
        <p className="text-slate-500">This component will contain platform configuration options</p>
      </div>
    </div>
  );
};

export default SystemSettings;
