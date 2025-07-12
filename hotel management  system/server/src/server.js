import dotenv from 'dotenv';
import path from 'path';
import cron from 'node-cron';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sequelize from './config/db.js';
import UserRoute from './routes/user.js';
import RoleRoute from './routes/role.js';
import TableRoute from './routes/table.js';
import backupRouter from './routes/backup.js'


const app = express();
app.use(cors());
app.use(express.json());

let scheduledTask = null;
let currentSchedule = '0 2 * * *'; // default daily 2am

function startBackupScheduler(cronExp = currentSchedule) {
  if (scheduledTask) scheduledTask.destroy(); // stop previous job
  scheduledTask = cron.schedule(cronExp, async () => {
    console.log('Running scheduled backup...');
    await backupDatabase();
  });
  currentSchedule = cronExp;
}

// Start with default schedule
startBackupScheduler();

// API routes
// Example routes
app.use('/api/user', UserRoute);
app.use('/api/role', RoleRoute);
app.use('/api/tables', TableRoute);
app.use('/api', backupRouter);
app.use('/download', express.static(path.join(process.cwd(), 'backups')));

app.get('/api/backup/schedule', (req, res) => {
  res.json({ schedule: currentSchedule });
});

app.post('/api/backup/schedule', (req, res) => {
  const { schedule } = req.body;
  // Ideally validate schedule string here!
  try {
    startBackupScheduler(schedule);
    res.json({ message: 'Schedule updated', schedule });
  } catch (err) {
    res.status(400).json({ error: 'Invalid schedule format' });
  }
});

// Sync DB & start server
sequelize.sync().then(() => {
  app.listen(process.env.PORT || 5001, () => {
    console.log('Server running on port 5000');
  });
});
