import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanObject } from '../utils/sanitize.js';

export function createCrudRouter(Model, { ownerField = 'user', publicRead = false } = {}) {
  const router = Router();
  const readMiddleware = publicRead ? [] : [requireAuth];

  router.get(
    '/',
    ...readMiddleware,
    asyncHandler(async (req, res) => {
      const filter = publicRead ? {} : { [ownerField]: req.user._id };
      res.json({ items: await Model.find(filter).sort({ createdAt: -1 }) });
    }),
  );

  router.post(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      const item = await Model.create({ ...cleanObject(req.body), [ownerField]: req.user._id });
      res.status(201).json({ item });
    }),
  );

  router.patch(
    '/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const item = await Model.findOneAndUpdate({ _id: req.params.id, [ownerField]: req.user._id }, cleanObject(req.body), { new: true });
      if (!item) return res.status(404).json({ message: 'Item not found' });
      res.json({ item });
    }),
  );

  router.delete(
    '/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const item = await Model.findOneAndDelete({ _id: req.params.id, [ownerField]: req.user._id });
      if (!item) return res.status(404).json({ message: 'Item not found' });
      res.json({ message: 'Deleted' });
    }),
  );

  return router;
}
