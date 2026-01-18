
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClose: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onDelete, onClose }) => {
  return (
    <div className="absolute inset-0 bg-slate-50 z-30 flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Lịch sử trích xuất
        </h2>
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Chưa có dữ liệu nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative"
              >
                <div className="pr-6">
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">
                    {item.data.ten_doanh_nghiep.ten_tieng_viet || "Không rõ tên DN"}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">
                      {item.data.thong_tin_chung.ma_so_doanh_nghiep || "N/A"}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    File: {item.fileName}
                  </div>
                </div>

                <button 
                  onClick={(e) => onDelete(item.id, e)}
                  className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  title="Xóa"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;
