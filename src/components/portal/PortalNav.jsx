import { useEffect, useState } from 'react';
import { getToken, getStoredUser, logout } from '../../lib/portalApi';

export default function PortalNav() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = '/portal/login';
      return;
    }
    setUser(getStoredUser());
    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
      <div className="flex gap-6 text-sm font-medium">
        <a href="/portal/dashboard" className="text-slate-700 hover:text-primary">
          My courses
        </a>
        {user?.role === 'admin' && (
          <a href="/admin/progress" className="text-slate-700 hover:text-primary">
            Admin: progress
          </a>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-500">{user?.name}</span>
        <button
          onClick={async () => {
            await logout();
            window.location.href = '/portal/login';
          }}
          className="font-medium text-slate-500 hover:text-red-600"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
