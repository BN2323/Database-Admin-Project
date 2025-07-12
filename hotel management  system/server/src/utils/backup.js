import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const backupDir = path.join('backups');

export const backupDatabase = () => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(backupDir, `backup-${timestamp}.sql`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const cmd = `mysqldump -u root -p${process.env.DB_PASS} ${process.env.DB_NAME} > "${filePath}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Backup failed:', err);
        reject(err);
      } else {
        console.log(`✅ Backup created at ${filePath}`);
        resolve(filePath);
      }
    });
  });
};

export const getBackupFiles = () => {
  if (!fs.existsSync(backupDir)) return [];
  return fs.readdirSync(backupDir).filter((f) => f.endsWith('.sql'));
};

export const restoreDatabase = (fileName) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(backupDir, fileName);
    if (!fs.existsSync(filePath)) return reject(new Error('Backup file not found'));

    const cmd = `mysql -u root -p${process.env.DB_PASS} ${process.env.DB_NAME} < "${filePath}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('❌ Restore failed:', err);
        reject(err);
      } else {
        console.log(`✅ Database restored from ${filePath}`);
        resolve(filePath);
      }
    });
  });
};
