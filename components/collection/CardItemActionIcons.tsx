import React from 'react';
import { CardInventory } from '../../types';
import {
  CardItemActionHandlers,
  CardItemActionTone,
  getCardItemActionsForSurface,
} from './cardItemActions';

export interface CardItemActionIconsProps extends CardItemActionHandlers {
  card: CardInventory;
}

const toneClass: Record<CardItemActionTone, string> = {
  default: 'text-slate-500 hover:text-white',
  danger: 'text-slate-500 hover:text-brand-red',
  favorite: 'text-slate-500 hover:text-amber-400',
  lime: 'text-slate-500 hover:text-brand-lime',
  accent: 'text-slate-500 hover:text-brand-lime',
};

const iconButtonClass =
  'p-2 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-50';

const CardItemActionIcons: React.FC<CardItemActionIconsProps> = props => {
  const actions = getCardItemActionsForSurface(props.card, props, 'list');

  return (
    <div className="flex flex-wrap justify-end gap-0.5">
      {actions.map(action => {
        const Icon = action.icon;
        const persist = action.persistVisible;
        const favoriteOn = action.id === 'favorite' && persist;
        const className = `${iconButtonClass} ${
          favoriteOn ? 'text-amber-400 opacity-100' : toneClass[action.tone]
        }`;

        if (action.href) {
          return (
            <a
              key={action.id}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              title={action.label}
              aria-label={action.label}
            >
              <Icon size={16} />
            </a>
          );
        }

        return (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            disabled={action.busy}
            className={className}
            title={action.label}
            aria-label={action.label}
          >
            {action.busy ? (
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-lime border-t-transparent"
                aria-hidden="true"
              />
            ) : (
              <Icon
                size={16}
                fill={favoriteOn ? 'currentColor' : 'none'}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

CardItemActionIcons.displayName = 'CardItemActionIcons';

export default CardItemActionIcons;
