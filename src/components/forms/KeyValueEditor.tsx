import { memo, useCallback, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface KeyValueEditorProps {
  label: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export const KeyValueEditor = memo<KeyValueEditorProps>(
  function KeyValueEditor({ label, value, onChange }) {
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');

    const entries = Object.entries(value);

    const addEntry = useCallback(() => {
      if (!newKey.trim()) return;
      onChange({ ...value, [newKey.trim()]: newValue });
      setNewKey('');
      setNewValue('');
    }, [newKey, newValue, value, onChange]);

    const removeEntry = useCallback(
      (key: string) => {
        const { [key]: _removed, ...rest } = value;
        onChange(rest);
      },
      [value, onChange]
    );

    const updateValue = useCallback(
      (key: string, newVal: string) => {
        onChange({ ...value, [key]: newVal });
      },
      [value, onChange]
    );

    return (
      <div className="space-y-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>

        {entries.length > 0 && (
          <div className="space-y-2">
            {entries.map(([key, entryValue]) => (
              <div key={key} className="grid grid-cols-[96px_1fr_36px] items-center gap-2">
                <span className="truncate rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
                  {key}
                </span>
                <input
                  value={entryValue}
                  onChange={(event) => updateValue(key, event.currentTarget.value)}
                  className="h-10 min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 transition-all duration-150 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeEntry(key)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${key}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-[1fr_1fr_44px] items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <Input
            placeholder="Key"
            value={newKey}
            onChange={(event) => setNewKey(event.currentTarget.value)}
            className="bg-white"
          />
          <Input
            placeholder="Value"
            value={newValue}
            onChange={(event) => setNewValue(event.currentTarget.value)}
            className="bg-white"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={addEntry}
            disabled={!newKey.trim()}
            className="h-10 w-10 px-0"
            aria-label={`Add ${label}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14m-7-7h14" />
            </svg>
          </Button>
        </div>
      </div>
    );
  }
);
