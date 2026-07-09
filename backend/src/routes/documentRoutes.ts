import { Router } from 'express';
import { body } from 'express-validator';
import documentController from '../controllers/documentController';
import { validate } from '../middleware/validate';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(protect);

const uploadDocumentValidation = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('type').trim().notEmpty().withMessage('Type required'),
  body('size').isInt({ min: 0 }).withMessage('Valid size required'),
  body('url').trim().notEmpty().withMessage('URL required'),
  body('publicId').optional().trim(),
  body('folder').optional().isMongoId(),
  body('tags').optional().isArray(),
  body('description').optional().trim(),
];

const updateDocumentValidation = [
  body('name').optional().trim().notEmpty(),
  body('tags').optional().isArray(),
  body('description').optional().trim(),
  body('folder').optional().isMongoId(),
];

const createFolderValidation = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('parent').optional().isMongoId(),
  body('color').optional().trim(),
  body('icon').optional().trim(),
];

const shareDocumentValidation = [
  body('permissions').isArray({ min: 1 }).withMessage('Permissions array required'),
];

router.get('/', documentController.getDocuments);
router.get('/folders', documentController.getFolders);
router.get('/:id', documentController.getDocument);
router.post('/', uploadDocumentValidation, validate, documentController.uploadDocument);
router.put('/:id', updateDocumentValidation, validate, documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
router.post('/:id/move', body('folderId').optional().isMongoId(), validate, documentController.moveDocument);
router.post('/:id/share', shareDocumentValidation, validate, documentController.shareDocument);

// Folder routes
router.post('/folders', createFolderValidation, validate, documentController.createFolder);
router.put('/folders/:id', documentController.updateFolder);
router.delete('/folders/:id', authorize(UserRole.ADMIN), documentController.deleteFolder);

export default router;
