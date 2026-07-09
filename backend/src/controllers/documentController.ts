import { Request, Response } from 'express';
import { ActivityLog } from '../models';
import { HTTP_STATUS } from '../constants';
import { sendResponse, sendErrorResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';
import mongoose from 'mongoose';

// Document schema - using any model type to avoid mongoose union type issues
const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  publicId: { type: String },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  description: String,
  version: { type: Number, default: 1 },
  isLocked: { type: Boolean, default: false },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  permissions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    access: { type: String, enum: ['view', 'edit', 'full'], default: 'view' },
  }],
}, { timestamps: true });

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  permissions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    access: { type: String, enum: ['view', 'edit', 'full'], default: 'view' },
  }],
  color: String,
  icon: String,
}, { timestamps: true });

const DocumentModel: any = mongoose.models.Document || mongoose.model('Document', documentSchema);
const FolderModel: any = mongoose.models.Folder || mongoose.model('Folder', folderSchema);

// Get all documents
export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 30;
  const skip = (page - 1) * limit;
  const { search, type, folder, tags } = req.query;

  const filter: Record<string, any> = { uploadedBy: req.user?._id };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } },
    ];
  }

  if (type) filter.type = { $regex: type, $options: 'i' };
  if (folder) filter.folder = folder;
  if (tags) filter.tags = { $all: (tags as string).split(',') };

  const [documents, total] = await Promise.all([
    DocumentModel.find(filter)
      .populate('uploadedBy', 'firstName lastName avatar')
      .populate('folder', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DocumentModel.countDocuments(filter),
  ]);

  sendPaginatedResponse(res, documents, buildPaginationMeta(total, page, limit));
};

// Get single document
export const getDocument = async (req: Request, res: Response): Promise<void> => {
  const document = await DocumentModel.findById(req.params.id)
    .populate('uploadedBy', 'firstName lastName email avatar')
    .populate('folder', 'name parent')
    .populate('permissions.user', 'firstName lastName');

  if (!document) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Document not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, document);
};

// Upload document
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  const { name, type, size, url, publicId, folder, tags, description } = req.body;

  const document = await DocumentModel.create({
    name,
    type,
    size,
    url,
    publicId,
    folder,
    tags: tags || [],
    description,
    uploadedBy: req.user?._id,
  });

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'create',
    category: 'document',
    resource: 'Document',
    resourceId: document._id,
    description: `Uploaded document ${name}`,
  });

  const populatedDoc = await DocumentModel.findById(document._id)
    .populate('folder')
    .populate('uploadedBy');

  sendResponse(res, HTTP_STATUS.CREATED, populatedDoc, 'Document uploaded');
};

// Update document
export const updateDocument = async (req: Request, res: Response): Promise<void> => {
  const document = await DocumentModel.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate('folder uploadedBy');

  if (!document) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Document not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'update',
    category: 'document',
    resource: 'Document',
    resourceId: document._id,
    description: `Updated document ${document.name}`,
  });

  sendResponse(res, HTTP_STATUS.OK, document, 'Document updated');
};

// Delete document
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  const document = await DocumentModel.findByIdAndDelete(req.params.id);

  if (!document) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Document not found');
    return;
  }

  // Log activity
  await ActivityLog.create({
    user: req.user?._id,
    action: 'delete',
    category: 'document',
    resource: 'Document',
    resourceId: document._id,
    description: `Deleted document ${document.name}`,
  });

  sendResponse(res, HTTP_STATUS.OK, null, 'Document deleted');
};

// Get folders
export const getFolders = async (req: Request, res: Response): Promise<void> => {
  const { parent } = req.query;

  const filter: Record<string, any> = { createdBy: req.user?._id };
  if (parent === 'root' || !parent) {
    filter.parent = { $exists: false };
  } else {
    filter.parent = parent;
  }

  const folders = await FolderModel.find(filter).sort({ name: 1 });

  const documents = await DocumentModel.find({ folder: parent === 'root' ? { $exists: false } : parent })
    .populate('uploadedBy', 'firstName lastName')
    .sort({ name: 1 });

  sendResponse(res, HTTP_STATUS.OK, { folders, documents });
};

// Create folder
export const createFolder = async (req: Request, res: Response): Promise<void> => {
  const { name, parent, color, icon } = req.body;

  const folder = await FolderModel.create({
    name,
    parent,
    color,
    icon,
    createdBy: req.user?._id,
  });

  sendResponse(res, HTTP_STATUS.CREATED, folder, 'Folder created');
};

// Update folder
export const updateFolder = async (req: Request, res: Response): Promise<void> => {
  const folder = await FolderModel.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true }
  );

  if (!folder) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Folder not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, folder, 'Folder updated');
};

// Delete folder
export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
  const folder = await FolderModel.findByIdAndDelete(req.params.id);

  if (!folder) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Folder not found');
    return;
  }

  await DocumentModel.deleteMany({ folder: req.params.id });
  await FolderModel.deleteMany({ parent: req.params.id });

  sendResponse(res, HTTP_STATUS.OK, null, 'Folder deleted');
};

// Move document to folder
export const moveDocument = async (req: Request, res: Response): Promise<void> => {
  const { folderId } = req.body;

  const document = await DocumentModel.findByIdAndUpdate(
    req.params.id,
    { folder: folderId || null, updatedAt: new Date() },
    { new: true }
  ).populate('folder');

  if (!document) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Document not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, document, 'Document moved');
};

// Share document
export const shareDocument = async (req: Request, res: Response): Promise<void> => {
  const { permissions } = req.body;

  const document = await DocumentModel.findByIdAndUpdate(
    req.params.id,
    { permissions, updatedAt: new Date() },
    { new: true }
  ).populate('permissions.user', 'firstName lastName email');

  if (!document) {
    sendErrorResponse(res, HTTP_STATUS.NOT_FOUND, 'Document not found');
    return;
  }

  sendResponse(res, HTTP_STATUS.OK, document, 'Document shared');
};

export default {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  moveDocument,
  shareDocument,
};
