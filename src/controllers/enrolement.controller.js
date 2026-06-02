import { application } from "express";
import pool from '../config/db.js';

//1.READ

export const getAllEnrolements = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM STUDENT_ENROLEMENT');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. CREATE
export const createEnrolement = async (req, res) => {
    const { SID,MID,ACAD_YEAR } = req.body;
    try {
        const query = 'INSERT INTO STUDENT_ENROLEMENT (SID,MID,ACAD_YEAR ) VALUES (?, ?, ?)';
        await pool.query(query, [SID, MID, ACAD_YEAR || null]);
        res.status(201).json({ success: true, message: 'Dang ki hoc thanh cong' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. UPDATE
export const updateEnrolement = async (req, res) => {
    const { id } = req.params;
    const { MID, ACAD_YEAR } = req.body;
    try {
        const query = 'UPDATE STUDENT_ENROLEMENT SET MID = ?, ACAD_YEAR = ? WHERE SID = ?';
        await pool.query(query, [SNAME, EMAIL, Tutor_Id || null, id]);
        res.status(200).json({ success: true, message: 'Cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. DELETE
export const deleteEnrolement = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM STUDENT_ENROLEMENT WHERE SID = ?', [id]);
        res.status(200).json({ success: true, message: 'Xóa thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
