import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Ensure uploads directory exists
const uploadsDir = join(__dirname, '..', '..', 'uploads');
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

// In-memory file tracking (in production, use a database)
const uploadedFiles = new Map<string, {
  id: string;
  name: string;
  originalName: string;
  path: string;
  type: string;
  size: number;
  uploadedAt: Date;
}>();

// POST /api/upload - Upload a file
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const fileId = req.file.filename.split('.')[0];
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
