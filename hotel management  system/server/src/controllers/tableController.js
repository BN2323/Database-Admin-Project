import pool from "../config/pool.js";
import dotenv from 'dotenv';
dotenv.config();

export const getTables = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?;
    `, [process.env.DB_NAME]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tables', error: err.message });
  }
};
