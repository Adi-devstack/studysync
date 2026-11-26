import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

function getFileIcon(type) {
  switch (type) {
    case 'pdf':
      return { Icon: FileText, bg: 'bg-red-50 text-red-600' };
    case 'doc':
      return { Icon: FileSpreadsheet, bg: 'bg-blue-50 text-blue-600' };
    case 'ppt':
      return { Icon: Presentation, bg: 'bg-amber-50 text-amber-600' };
    case 'image':
      return { Icon: ImageIcon, bg: 'bg-emerald-50 text-emerald-600' };
    default:
      return { Icon: File, bg: 'bg-slate-100 text-slate-600' };
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ResourceCard({
  resource,
  currentUserId,
  onDownload,
  onDelete,
  deleting = false,
}) {
  const { Icon, bg } = getFileIcon(resource.file_type);
  const isOwner = currentUserId && resource.uploaded_by === currentUserId;

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
              {resource.title}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {resource.file_name}
            </p>
          </div>
        </div>

        {resource.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {resource.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {resource.subject && (
            <Badge variant="indigo">{resource.subject}</Badge>
          )}
          {resource.file_type && (
            <Badge variant="slate">{resource.file_type.toUpperCase()}</Badge>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span className="truncate">
            By {resource.uploader_name || 'Student'}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span>{formatFileSize(resource.file_size)}</span>
            <span>•</span>
            <span>{resource.download_count ?? 0} downloads</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => onDownload?.(resource)}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
          {isOwner && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              loading={deleting}
              onClick={() => onDelete(resource.id)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label="Delete resource"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
