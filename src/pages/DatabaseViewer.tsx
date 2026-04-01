// DatabasePage.tsx — shows drug name, drug SMILES, excipient name, excipient SMILES only.
// No finalLabel column. Search kept exactly as before.
// Handles both string and string[] SMILES (from grouped data).

import { useState, useMemo } from 'react';
import { DATABASE_ENTRIES } from '@/data/databaseEntries';
import { Input } from '@/components/ui/input';
import { Search, Database } from 'lucide-react';

const PAGE_SIZE = 20;

// Normalise a SMILES field (string or array) to a display string
function smilesDisplay(val: string | string[]): string {
  return Array.isArray(val) ? val.join(' | ') : val;
}

// For search: flatten to one string
function smilesSearch(val: string | string[]): string {
  return Array.isArray(val) ? val.join(' ') : val;
}

export default function DatabasePage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return DATABASE_ENTRIES;
    return DATABASE_ENTRIES.filter(r =>
      r.drug.toLowerCase().includes(q) ||
      r.excipient.toLowerCase().includes(q) ||
      smilesSearch(r.drugSmiles).toLowerCase().includes(q) ||
      smilesSearch(r.excipientSmiles).toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Database className="text-blue-600" size={30} />
            Drug–Excipient Database
          </h1>
          <p className="text-slate-500 mt-1">
            {DATABASE_ENTRIES.length} entries ·{' '}
            {[...new Set(DATABASE_ENTRIES.map(r => r.drug))].length} unique drugs ·{' '}
            {[...new Set(DATABASE_ENTRIES.map(r => r.excipient))].length} unique excipients
          </p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search drug name, excipient, or SMILES…"
              value={search}
              onChange={handleSearch}
              className="pl-9 border-slate-200"
            />
          </div>
          {search && (
            <p className="text-xs text-slate-400 mt-1 ml-1">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold w-36">Drug Name</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold w-64">Drug SMILES</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold w-44">Excipient Name</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold w-64">Excipient SMILES</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-400">
                      No entries match your search.
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 align-top">{row.drug}</td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className="font-mono text-xs text-slate-500 block max-w-[240px] break-all"
                          title={smilesDisplay(row.drugSmiles)}
                        >
                          {smilesDisplay(row.drugSmiles)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 align-top">{row.excipient}</td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className="font-mono text-xs text-slate-500 block max-w-[240px] break-all"
                          title={smilesDisplay(row.excipientSmiles)}
                        >
                          {smilesDisplay(row.excipientSmiles)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1 rounded text-xs border border-slate-200 disabled:opacity-40 hover:bg-white">
                  ‹ Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + idx;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`px-3 py-1 rounded text-xs border ${pg === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 hover:bg-white'}`}>
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1 rounded text-xs border border-slate-200 disabled:opacity-40 hover:bg-white">
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
