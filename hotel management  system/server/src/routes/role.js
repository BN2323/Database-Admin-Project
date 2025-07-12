import express from 'express';
import { createRole, grantPrivilegesToRole, getAllRoles, getRolePrivileges, editRole, deleteRole } from '../controllers/roleController.js';

const router = express.Router();

router.get('/', getAllRoles);
router.get('/:role/privileges', getRolePrivileges);
router.post('/create', createRole);
router.post('/grant-privileges', grantPrivilegesToRole);
router.put('/edit/:role_name', editRole);
router.delete('/delete/:role_name', deleteRole);


export default router;
