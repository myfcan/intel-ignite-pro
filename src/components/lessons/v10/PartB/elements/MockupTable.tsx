import React from 'react';

interface MockupTableProps {
  headers: string[];
  rows: string[][];
}

const MockupTable: React.FC<MockupTableProps> = ({ headers, rows }) => {
  return (
    <div className="overflow-x-auto max-h-[300px] overflow-y-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-semibold text-gray-700 text-xs uppercase tracking-wide"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-3 py-2 text-gray-700 border-b border-gray-100"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MockupTable;
