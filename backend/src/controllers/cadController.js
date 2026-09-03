import { importDrawing, getTranslationStatus, getThumbnail } from '../services/autocadService.js';

export async function upload(req, res, next) {
  try {
    if (!process.env.APS_CLIENT_ID || !process.env.APS_CLIENT_SECRET || !process.env.APS_BUCKET_KEY) {
      return res.status(501).json({ message: 'AutoCAD (Autodesk Platform Services) is not configured yet. Add APS_CLIENT_ID, APS_CLIENT_SECRET and APS_BUCKET_KEY to backend/.env.' });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded. Attach a .dwg or .dxf file.' });
    const { urn } = await importDrawing(req.file.buffer, req.file.originalname);
    res.status(202).json({ urn, status: 'processing' });
  } catch (err) { next(err); }
}

export async function status(req, res, next) {
  try {
    const result = await getTranslationStatus(req.params.urn);
    if (result.status === 'success' || result.status === 'complete') {
      const base64 = await getThumbnail(req.params.urn);
      return res.json({ status: 'complete', imageDataUrl: `data:image/png;base64,${base64}` });
    }
    if (result.status === 'failed') return res.status(422).json({ status: 'failed', message: 'Autodesk could not convert this drawing.' });
    res.json({ status: 'processing', progress: result.progress || null });
  } catch (err) { next(err); }
}