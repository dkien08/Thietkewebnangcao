import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import studentRoute from './routes/students.route.js';
import enrolementRoute from './routes/enrolement.routes.js'
import './config/db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', studentRoute);
app.use('/api',enrolementRoute)

app.listen(port, () => {
    console.log(`Server đang chạy tại: http://localhost:${port}`);
});