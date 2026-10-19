import React from 'react';
import { PASSWORD_MIN, getPasswordChecks } from '../lib/authCredentials';

export const PASSWORD_RULES_HINT = `Use ${PASSWORD_MIN}+ characters with an uppercase letter, a lowercase letter, and a number.`;

const RULES = [
  { key: 'length', label: `${PASSWORD_MIN}+ characters` },
  { key: 'uppercase', label: 'Uppercase' },
  { key: 'lowercase', label: 'Lowercase' },
  { key: 'number', label: 'Number' },
] as const;

interface Props {
  id: string;
  password: string;
}

/** Always visible. The four checks match passwordRuleError. */
const PasswordRulesHint: React.FC<Props> = ({ id, password }) => {
  const checks = getPasswordChecks(password);
  return (
    <div id={id}>
      <p className="text-[11px] text-slate-400">{PASSWORD_RULES_HINT}</p>
      <ul className="mt-1 grid grid-cols-2 gap-1 text-[10px] font-bold uppercase tracking-wide sm:grid-cols-4" aria-label="Password requirements">
        {RULES.map((rule) => {
          const met = password.length > 0 && checks[rule.key];
          return (
            <li key={rule.key} className={met ? 'text-brand-lime' : 'text-slate-500'}>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordRulesHint;
