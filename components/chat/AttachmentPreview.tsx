import React from 'react';
import { Attachment } from '../../types';
import { FileText, Image as ImageIcon, X } from 'lucide-react';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (index: number) => void;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachments, onRemove }) => {
  if (attachments.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto">
      {attachments.map((att, idx) => (
        <div key={idx} className="relative flex items-center bg-white border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs shadow-sm">
          {att.type === 'image' ? <ImageIcon className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
          <span className="max-w-[100px] truncate">{att.name}</span>
          <button onClick={() => onRemove(idx)} className="ml-2 hover:text-red-500">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};