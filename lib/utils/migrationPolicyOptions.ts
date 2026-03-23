import type { MigrationConflictPolicy } from './migrationMerge';

export const MIGRATION_CONFLICT_POLICY_OPTIONS: {
    value: MigrationConflictPolicy;
    label: string;
    hint: string;
}[] = [
    { value: 'prefer_local', label: 'Prefer local copy', hint: 'Overwrite cloud when the same card exists (default).' },
    { value: 'prefer_cloud', label: 'Keep cloud copy', hint: 'Skip local rows that match a card already in the cloud.' },
    {
        value: 'merge_newer',
        label: 'Newer valuation wins',
        hint: 'Use the row with the more recent valuation / created date for each match.',
    },
];
