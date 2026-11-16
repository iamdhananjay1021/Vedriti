import { Router } from 'express';
import * as broadcast from '../controllers/broadcastController.js';
import { validateBody } from '../middlewares/validateRequest.js';

const router = Router();

router.use(broadcast.requireSuperAdmin);

router.get('/status', broadcast.getStatus);

router.get('/templates', broadcast.listTemplates);
router.post('/templates', validateBody(broadcast.TemplateSchema), broadcast.createTemplate);
router.put('/templates/:id', validateBody(broadcast.TemplateSchema), broadcast.updateTemplate);
router.delete('/templates/:id', broadcast.removeTemplate);

router.post('/preview', validateBody(broadcast.PreviewSchema), broadcast.previewBroadcast);
router.post('/test', validateBody(broadcast.PreviewSchema), broadcast.testBroadcast);
router.post('/audience', validateBody(broadcast.AudiencePreviewSchema), broadcast.previewAudience);

router.get('/', broadcast.listBroadcasts);
router.post('/', validateBody(broadcast.BroadcastInputSchema), broadcast.createBroadcast);
router.get('/:id', broadcast.getBroadcast);
router.put('/:id', validateBody(broadcast.BroadcastInputSchema), broadcast.updateBroadcast);
router.post('/:id/send', broadcast.sendNow);
router.post('/:id/cancel', broadcast.cancel);
router.post('/:id/retry', broadcast.retry);
router.post('/:id/sms', broadcast.sendPendingSms);
router.delete('/:id', broadcast.removeBroadcast);

export default router;
