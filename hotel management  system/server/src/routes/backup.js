import express from 'express';
import { backupDatabase, getBackupFiles, restoreDatabase } from '../utils/backup.js';

const router = express.Router();

router.post('/backup', async (req, res) => {
  try {
    await backupDatabase();
    res.status(200).json({ message: 'Backup completed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Backup failed.', error: err.message });
  }
});

router.get('/backup/files', (req, res) => {
  const files = getBackupFiles();
  res.status(200).json({ files });
});

router.post('/backup/restore', async (req, res) => {
  const { file } = req.body;
  if (!file) return res.status(400).json({ message: 'File name required.' });

  try {
    await restoreDatabase(file);
    res.status(200).json({ message: `Restore from ${file} completed successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Restore failed.', error: err.message });
  }
});

export default router;
