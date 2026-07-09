import { Router, Request, Response } from 'express';
import { query, param, validationResult } from 'express-validator';
import { HTTP_STATUS } from '../constants';
import { sendResponse, sendPaginatedResponse, buildPaginationMeta } from '../utils/response';

const router = Router();

// Generic CRUD controller factory
export function createController<T extends { _id: string }>(Model: any, modelName: string) {
  return {
    getAll: async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {};

      // Handle search
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ];
      }

      // Handle status filter
      if (req.query.status) {
        filter.status = req.query.status;
      }

      // Handle sorting
      const sort: Record<string, number> = {};
      if (req.query.sortBy) {
        sort[req.query.sortBy as string] = req.query.sortOrder === 'desc' ? -1 : 1;
      } else {
        sort.createdAt = -1;
      }

      const [data, total] = await Promise.all([
        Model.find(filter).sort(sort).skip(skip).limit(limit).populate('user department plant', 'name email firstName lastName'),
        Model.countDocuments(filter),
      ]);

      sendPaginatedResponse(res, data, buildPaginationMeta(total, page, limit));
    },

    getOne: async (req: Request, res: Response) => {
      const doc = await Model.findById(req.params.id).populate('user department plant manager');

      if (!doc) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: `${modelName} not found`,
        });
      }

      sendResponse(res, HTTP_STATUS.OK, doc);
    },

    create: async (req: Request, res: Response) => {
      const doc = await Model.create({
        ...req.body,
        createdBy: req.user?._id,
      });

      sendResponse(res, HTTP_STATUS.CREATED, doc, `${modelName} created successfully`);
    },

    update: async (req: Request, res: Response) => {
      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedBy: req.user?._id },
        { new: true, runValidators: true }
      );

      if (!doc) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: `${modelName} not found`,
        });
      }

      sendResponse(res, HTTP_STATUS.OK, doc, `${modelName} updated successfully`);
    },

    delete: async (req: Request, res: Response) => {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: `${modelName} not found`,
        });
      }

      sendResponse(res, HTTP_STATUS.OK, null, `${modelName} deleted successfully`);
    },

    search: async (req: Request, res: Response) => {
      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!q) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Search query is required',
        });
      }

      const results = await Model.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { orderId: { $regex: q, $options: 'i' } },
          { sku: { $regex: q, $options: 'i' } },
        ],
      }).limit(limit);

      sendResponse(res, HTTP_STATUS.OK, results);
    },
  };
}

export default router;
