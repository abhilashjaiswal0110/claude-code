import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Ensure uploads directory exists (relative to process working directory for consistency)
// This works correctly both in development (src/) and production (dist/)
const uploadsDir = process.env.UPLOADS_DIR || join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = file.originalname.split('.').pop();
    cb(null, `${uniqueId}.${extension}`);
  },
});

// File filter for allowed types
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'text/csv',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const allowedExtensions = ['.pdf', '.csv', '.txt', '.md', '.docx'];
  const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, CSV, TXT, MD, DOCX'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

/**
 * In-memory file tracking.
 * 
 * NOTE: File metadata is stored in-memory. This means:
 * - Metadata will be lost when the server restarts (files remain on disk)
 * - Consider implementing database persistence for production use
 * - A cleanup job runs periodically to remove old entries (configured below)
 */
const uploadedFiles = new Map<string, {
  id: string;
  name: string;
  originalName: string;
  path: string;
  type: string;
  size: number;
  uploadedAt: Date;
}>();

// Cleanup old file entries every 6 hours (files older than 24 hours)
setInterval(() => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let count = 0;
  for (const [id, file] of uploadedFiles) {
    if (file.uploadedAt < cutoff) {
      uploadedFiles.delete(id);
      count++;
    }
  }
  if (count > 0) {
    console.log(`[Upload] Cleaned up ${count} expired file metadata entries`);
  }
}, 6 * 60 * 60 * 1000);

// POST /api/upload - Upload a file
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  // Safely extract file ID from filename (handles files without extensions)
  const filenameParts = req.file.filename.split('.');
  const fileId = filenameParts.length > 1 
    ? filenameParts.slice(0, -1).join('.') 
    : req.file.filename;
  const fileInfo = {
    id: fileId,
    name: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    type: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date(),
  };

  uploadedFiles.set(fileId, fileInfo);

  res.status(201).json({
    id: fileInfo.id,
    name: fileInfo.originalName,
    path: fileInfo.path,
    type: fileInfo.type,
    size: fileInfo.size,
  });
});

// GET /api/upload/:id - Get file info
router.get('/:id', (req: Request, res: Response) => {
  const file = uploadedFiles.get(req.params.id);

  if (!file) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  res.json({
    id: file.id,
    name: file.originalName,
    type: file.type,
    size: file.size,
    uploadedAt: file.uploadedAt.toISOString(),
  });
});

export default router;
