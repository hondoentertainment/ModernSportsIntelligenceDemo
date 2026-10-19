import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Eye, EyeOff, Loader2, Lock, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFriendlyAuthMessage } from '../lib/utils/authErrors';
import { validateAuthUsername } from '../lib/authCredentials';
import PasswordRulesHint from './PasswordRulesHint';
import { supabase } from '../lib/supabase';

/**
 * Signed-in username and password changes. Username writes go to the caller's
 * own profiles row. If that column is not deployed yet, password change still
 * works and the username save explains that.
 */
const AccountCredentialsForm: React.FC = () => {
  const { user, isDemoMode, updateUsername, changePassword } = useAuth();
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const metadataUsername = typeof user?.user_metadata?.username === 'string' ? user.user_metadata.username : '';
  const userId = user?.id;

  useEffect(() => {
    setUsername(metadataUsername);
    if (isDemoMode || !userId) return;

    let cancelled = false;
    void supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const row = data as { username?: string | null };
        if (typeof row.username === 'string' && row.username) setUsername(row.username);
      });
    return () => {
      cancelled = true;
    };
  }, [metadataUsername, userId, isDemoMode]);

  const saveUsername = async (event: React.FormEvent) => {
    event.preventDefault();
    setUsernameError('');
    setUsernameMessage('');
    const parsed = validateAuthUsername(username);
    if (!parsed.ok) {
      setUsernameError(parsed.error);
      return;
    }
    setUsernameSaving(true);
    try {
      const { error } = await updateUsername(parsed.username);
      if (error) {
        setUsernameError(getFriendlyAuthMessage(error));
        return;
      }
      setUsername(parsed.username);
      setUsernameMessage(isDemoMode ? 'Username saved on this demo session.' : 'Username updated.');
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : 'Could not update username. Please try again.');
    } finally {
      setUsernameSaving(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (nextPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await changePassword(currentPassword, nextPassword);
      if (error) {
        setPasswordError(getFriendlyAuthMessage(error));
        return;
      }
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
      setPasswordMessage(isDemoMode ? 'Password change simulated in demo mode.' : 'Password updated.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not update the password. Please try again.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const sessionEnded = (message: string) => /session has expired|sign in to continue|sign in again/i.test(message);

  return (
    <section className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-8">
      <h2 className="text-xl font-bold flex items-center gap-3">
        <Shield className="text-brand-teal" size={20} />
        Account security
      </h2>

      <form onSubmit={saveUsername} className="space-y-3">
        <label htmlFor="account-username" className="block text-slate-400 text-[10px] uppercase font-black tracking-widest">
          Username
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="account-username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={event => setUsername(event.target.value)}
            aria-invalid={usernameError ? true : undefined}
            aria-describedby={usernameError ? 'account-username-error' : undefined}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-brand-lime"
            placeholder="cardcollector99"
          />
          <button
            type="submit"
            disabled={usernameSaving}
            aria-busy={usernameSaving}
            className="min-h-[44px] px-6 py-3 rounded-xl bg-brand-lime text-brand-charcoal font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {usernameSaving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
            {usernameSaving ? 'Saving username' : 'Save username'}
          </button>
        </div>
        <p className="text-slate-500 text-xs">3-20 characters. Letters, numbers, and underscores. Not case-sensitive.</p>
        {usernameError ? (
          <p id="account-username-error" role="alert" className="text-red-400 text-sm">
            {usernameError}
            {sessionEnded(usernameError) ? (
              <> <Link to="/login" className="text-brand-lime underline">Sign in</Link></>
            ) : null}
          </p>
        ) : null}
        {usernameMessage ? (
          <p className="text-brand-lime text-sm flex items-center gap-2"><Check size={16} /> {usernameMessage}</p>
        ) : null}
      </form>

      <form onSubmit={savePassword} className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock size={16} className="text-brand-teal" />
          Change password
        </h3>
        <label htmlFor="account-current-password" className="block text-slate-400 text-[10px] uppercase font-black tracking-widest">
          Current password
        </label>
        <input
          id="account-current-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={currentPassword}
          onChange={event => setCurrentPassword(event.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-brand-lime"
          required
        />
        <label htmlFor="account-new-password" className="block text-slate-400 text-[10px] uppercase font-black tracking-widest">
          New password
        </label>
        <div className="relative">
          <input
            id="account-new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={nextPassword}
            onChange={event => setNextPassword(event.target.value)}
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordError ? 'account-password-rules account-password-error' : 'account-password-rules'}
            className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-brand-lime"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(value => !value)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[44px] min-h-[44px] text-slate-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <label htmlFor="account-confirm-password" className="block text-slate-400 text-[10px] uppercase font-black tracking-widest">
          Confirm new password
        </label>
        <input
          id="account-confirm-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-hidden focus:border-brand-lime"
          required
        />
        <PasswordRulesHint id="account-password-rules" password={nextPassword} />
        <button
          type="submit"
          disabled={passwordSaving}
          aria-busy={passwordSaving}
          className="min-h-[44px] px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold disabled:opacity-50 flex items-center gap-2"
        >
          {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
          {passwordSaving ? 'Updating password' : 'Update password'}
        </button>
        <p className="text-slate-500 text-xs">Google sign-in stays available on the login page.</p>
        {passwordError ? (
          <p id="account-password-error" role="alert" className="text-red-400 text-sm">
            {passwordError}
            {sessionEnded(passwordError) ? (
              <> <Link to="/login" className="text-brand-lime underline">Sign in</Link></>
            ) : null}
          </p>
        ) : null}
        {passwordMessage ? (
          <p className="text-brand-lime text-sm flex items-center gap-2"><Check size={16} /> {passwordMessage}</p>
        ) : null}
      </form>
    </section>
  );
};

export default AccountCredentialsForm;
