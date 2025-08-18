import React from 'react';

type TextAreaLabelProps = {
  label: string;
  value?: string | number | null;
  rows?: number;
};

const TextAreaLabel: React.FC<TextAreaLabelProps> = ({
  label,
  value = '-',
  rows = 4,
}) => {
  return (
    <div className="col-span-3 grid grid-cols-3 items-start gap-4">
      <label className="pt-2 text-left font-medium">{label}</label>
      <div className="col-span-2 flex flex-col gap-1">
        <textarea
          value={value?.toString() ?? '-'}
          rows={rows}
          readOnly
          className="w-75 border rounded px-3 py-2"
        />
      </div>
    </div>
  );
};

export default TextAreaLabel;
