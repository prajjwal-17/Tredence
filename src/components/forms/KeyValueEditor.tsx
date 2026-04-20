import { memo, useState, useCallback } from 'react';
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
        const { [key]: _, ...rest } = value;
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
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>

        {/* Existing entries */}
        {entries.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {entries.map(([k, v]) => (
              <div key={k} className="flex gap-1.5 items-center">
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1.5 rounded-md min-w-[60px] font-mono">
                  {k}
                </span>
                <input
                  value={v}
                  onChange={(e) => updateValue(k, e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs bg-slate-800/80 border border-slate-600/50 rounded-md text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={() => removeEntry(k)}
                  className="text-slate-500 hover:text-red-400 transition-colors px-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new entry */}
        <div className="flex gap-1.5 items-end">
          <Input
            placeholder="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.currentTarget.value)}
            className="!py-1.5 !text-xs flex-1"
          />
          <Input
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.currentTarget.value)}
            className="!py-1.5 !text-xs flex-1"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={addEntry}
            disabled={!newKey.trim()}
            className="!px-2"
          >
            +
          </Button>
        </div>
      </div>
    );
  }
);
