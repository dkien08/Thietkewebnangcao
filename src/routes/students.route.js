import express from 'express';
import { 
    getAllStudents, 
    createStudent, 
    updateStudent, 
    deleteStudent 
} from '../controllers/students.controller.js';
const router = express.Router();

router.get('/students', getAllStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

export default router;