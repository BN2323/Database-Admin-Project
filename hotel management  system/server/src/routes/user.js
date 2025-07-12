import express from 'express';
import { createUser, grantRoleToUser, getAllUsers, deleteUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/create', createUser);
router.post('/grant-role', grantRoleToUser);
router.delete('/delete/:username/:host', deleteUser);
router.put('/edit/:oldUsername/:oldHost', updateUser);

export default router;
