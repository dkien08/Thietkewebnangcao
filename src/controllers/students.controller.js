import { application } from 'express';
import pool from '../config/db.js';

// 1. READ
export const getAllStudents = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM STUDENT');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. CREATE
export const createStudent = async (req, res) => {
    const { SID, SNAME, EMAIL, Tutor_Id } = req.body;
    try {
        const query = 'INSERT INTO STUDENT (SID, SNAME, EMAIL, Tutor_Id) VALUES (?, ?, ?, ?)';
        await pool.query(query, [SID, SNAME, EMAIL, Tutor_Id || null]);
        res.status(201).json({ success: true, message: 'Thêm sinh viên thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. UPDATE
export const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { SNAME, EMAIL, Tutor_Id } = req.body;
    try {
        const query = 'UPDATE STUDENT SET SNAME = ?, EMAIL = ?, Tutor_Id = ? WHERE SID = ?';
        await pool.query(query, [SNAME, EMAIL, Tutor_Id || null, id]);
        res.status(200).json({ success: true, message: 'Cập nhật sinh viên thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. DELETE
export const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM STUDENT WHERE SID = ?', [id]);
        res.status(200).json({ success: true, message: 'Xóa sinh viên thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
