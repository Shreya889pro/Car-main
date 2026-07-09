import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Folder,
  Upload,
  Search,
  Grid,
  List,
  Download,
  Share2,
  MoreHorizontal,
  File,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Eye,
  Trash2,
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Breadcrumb from '@/components/ui/Breadcrumb';

const DocumentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const folders = [
    { id: '1', name: 'Production Documents', files: 24, size: '124 MB', color: '#2563EB' },
    { id: '2', name: 'Quality Reports', files: 18, size: '89 MB', color: '#22C55E' },
    { id: '3', name: 'HR Documents', files: 32, size: '156 MB', color: '#8B5CF6' },
    { id: '4', name: 'Safety Manuals', files: 12, size: '45 MB', color: '#F59E0B' },
    { id: '5', name: 'Equipment Specs', files: 56, size: '234 MB', color: '#06B6D4' },
    { id: '6', name: 'Training Materials', files: 28, size: '178 MB', color: '#EF4444' },
  ];

  const recentFiles = [
    { id: '1', name: 'Monthly Production Report.pdf', type: 'pdf', size: '2.4 MB', modified: '2 hours ago', modifiedBy: 'John Smith' },
    { id: '2', name: 'Quality Audit Checklist.xlsx', type: 'excel', size: '1.2 MB', modified: '5 hours ago', modifiedBy: 'Sarah Johnson' },
    { id: '3', name: 'Safety Guidelines 2024.pdf', type: 'pdf', size: '4.8 MB', modified: '1 day ago', modifiedBy: 'Michael Williams' },
    { id: '4', name: 'Equipment Manual v2.pdf', type: 'pdf', size: '8.2 MB', modified: '2 days ago', modifiedBy: 'David Lee' },
    { id: '5', name: 'Employee Training Record.docx', type: 'word', size: '0.8 MB', modified: '3 days ago', modifiedBy: 'Emily Brown' },
    { id: '6', name: 'Production Schedule Q3.xlsx', type: 'excel', size: '1.5 MB', modified: '3 days ago', modifiedBy: 'Amanda Garcia' },
  ];

  const getFileIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      pdf: <FileText className="w-5 h-5 text-error" />,
      excel: <FileSpreadsheet className="w-5 h-5 text-success" />,
      word: <FileText className="w-5 h-5 text-primary-400" />,
      image: <FileImage className="w-5 h-5 text-warning" />,
      archive: <FileArchive className="w-5 h-5 text-secondary-400" />,
    };
    return icons[type] || <File className="w-5 h-5 text-text-muted" />;
  };

  const getFileBgColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-error/20',
      excel: 'bg-success/20',
      word: 'bg-primary-500/20',
      image: 'bg-warning/20',
      archive: 'bg-secondary-500/20',
    };
    return colors[type] || 'bg-background-tertiary';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Documents</h1>
          <p className="text-text-muted">Manage and organize your files</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Upload className="w-4 h-4" />}>
            Upload
          </Button>
          <Button icon={<Folder className="w-4 h-4" />}>
            New Folder
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Files', value: '1,234', icon: <File className="w-5 h-5" />, color: 'primary' },
          { label: 'Folders', value: folders.length, icon: <Folder className="w-5 h-5" />, color: 'warning' },
          { label: 'Storage Used', value: '824 MB', icon: <FileArchive className="w-5 h-5" />, color: 'secondary' },
          { label: 'Shared', value: '45', icon: <Share2 className="w-5 h-5" />, color: 'success' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4" hover>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-primary-500/20 text-primary-400`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and View Toggle */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input placeholder="Search files and folders..." icon={<Search className="w-4 h-4" />} />
          </div>
          <div className="flex items-center gap-1 p-1 bg-background-secondary rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-card text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-card text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Folders */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Folders</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {folders.map((folder) => (
            <motion.div
              key={folder.id}
              whileHover={{ y: -4 }}
              className="cursor-pointer"
            >
              <Card hover className="p-4 text-center">
                <div
                  className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${folder.color}20` }}
                >
                  <Folder className="w-7 h-7" style={{ color: folder.color }} />
                </div>
                <h3 className="font-medium text-text-primary text-sm mb-1 truncate">{folder.name}</h3>
                <p className="text-xs text-text-muted">{folder.files} files | {folder.size}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Recent Files</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentFiles.map((file) => (
              <motion.div
                key={file.id}
                whileHover={{ y: -4 }}
                className="cursor-pointer"
              >
                <Card hover className="p-4">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${getFileBgColor(file.type)} flex items-center justify-center`}>
                    {getFileIcon(file.type)}
                  </div>
                  <h3 className="font-medium text-text-primary text-sm mb-1 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-xs text-text-muted">{file.size}</p>
                  <p className="text-xs text-text-muted mt-1">{file.modified}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="divide-y divide-white/5">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl ${getFileBgColor(file.type)} flex items-center justify-center`}>
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{file.name}</p>
                    <p className="text-xs text-text-muted">{file.modified} by {file.modifiedBy}</p>
                  </div>
                  <span className="text-sm text-text-muted">{file.size}</span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default DocumentsPage;
