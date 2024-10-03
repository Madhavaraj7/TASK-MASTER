import express from 'express';
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskStatistics,
} from '../controllers/taskController.js';
import { verifyToken } from '../utils/VerifyUser.js';

const router = express.Router();

router.use(verifyToken); 

router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.route('/statistics').get(getTaskStatistics); 


export default router;
