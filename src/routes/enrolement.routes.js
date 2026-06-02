import express from 'express';
import { 
    getAllEnrolements, 
    createEnrolement, 
    updateEnrolement, 
    deleteEnrolement 
} from '../controllers/enrolement.controller.js';
const router = express.Router();

router.get('/enrolements', getAllEnrolements);
router.post('/enrolement', createEnrolement);
router.put('/enrolement/:id', updateEnrolement);
router.delete('/enrolement/:id', deleteEnrolement);

export default router;