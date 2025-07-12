import pool from '../config/pool.js';
import dotenv from 'dotenv';
dotenv.config();

export const getAllRoles = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT user AS role_name, host 
      FROM mysql.user 
      WHERE host = '%' AND NOT LENGTH(authentication_string);
    `);
    res.json(rows); // returns list of roles with their host
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch roles', error: err.message });
  }
};


// controller/roleController.js
export const getRolePrivileges = async (req, res) => {
  const { role } = req.params;
  const { host = '%' } = req.query;

  try {
    const [rows] = await pool.query(`SHOW GRANTS FOR '${role}'@'${host}';`);
    res.json(rows.map(row => Object.values(row)[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to get privileges for ${role}`, error: err.message });
  }
};


export const createRole = async (req, res) => {
  const { role_name } = req.body;
  if (!role_name) {
    return res.status(400).json({ message: 'Role name is required' });
  }

  try {
    // Use backticks to escape role_name for safety
    await pool.query(`CREATE ROLE IF NOT EXISTS \`${role_name}\``);
    res.status(201).json({ message: `Role '${role_name}' created` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create role', error: err.message });
  }
};


export const grantPrivilegesToRole = async (req, res) => {
  const { role, privileges, tables, withGrantOption = false } = req.body;

  if (!role || !Array.isArray(privileges) || privileges.length === 0 || !Array.isArray(tables) || tables.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const privStr = privileges.includes('ALL PRIVILEGES')
      ? 'ALL PRIVILEGES'
      : privileges.join(', ');

    const db = process.env.DB_NAME;
    for (const table of tables) {
      let sql = `GRANT ${privStr} ON \`${db}\`.${table} TO '${role}'`;
      if (withGrantOption) sql += ' WITH GRANT OPTION';
      await pool.query(sql);
    }

    res.json({ message: `Granted ${privStr} on selected tables to '${role}'${withGrantOption ? ' with GRANT OPTION' : ''}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to grant privileges', error: err.message });
  }
};

export const editRole = async (req, res) => {
  const oldRole = req.params.role_name;
  const { newRoleName, privileges, tables, withGrantOption } = req.body;

  if (!newRoleName || !Array.isArray(privileges) || !Array.isArray(tables)) {
    return res.status(400).json({ message: 'Invalid data sent' });
  }

  try {
    // Step 1: Rename the role if needed
    if (newRoleName !== oldRole) {
      await pool.query(`RENAME USER ?@'%' TO ?@'%'`, [oldRole, newRoleName]);
    }

    // Step 2: Revoke all privileges from old role (or new name if renamed)
    const roleUser = newRoleName;
    for (const tbl of tables) {
      await pool.query(`REVOKE ALL PRIVILEGES ON \`${tbl}\`.* FROM ?@'%'`, [roleUser]);
    }

    // Step 3: Grant new privileges
    const privString = privileges.join(', ');
    const grantOption = withGrantOption ? ' WITH GRANT OPTION' : '';

    for (const tbl of tables) {
      await pool.query(
        `GRANT ${privString} ON \`${tbl}\`.* TO ?@'%'${grantOption}`,
        [roleUser]
      );
    }

    res.json({ message: `Role '${oldRole}' updated successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to edit role', error: err.message });
  }
};

export const deleteRole = async (req, res) => {
  let { role_name } = req.params;

  if (!role_name) {
    return res.status(400).json({ message: 'Missing role name' });
  }

  // Simple backtick escaping to avoid injection (you might want to use a proper escaping lib)
  const escapeName = (name) => name.replace(/`/g, '``');

  const escapedRole = escapeName(role_name);

  try {
    // Step 1: Get all users
    const [users] = await pool.query(`SELECT User, Host FROM mysql.user WHERE User != ''`);

    // Step 2: Revoke the role from users who have it
    for (const { User, Host } of users) {
      // Get grants for this user
      const [grantRows] = await pool.query(`SHOW GRANTS FOR \`${User}\`@\`${Host}\``);
      for (const row of grantRows) {
        const grantStr = Object.values(row)[0];
        // Check if user has the role granted
        // Role grant format: GRANT 'role_name'@'%' TO 'user'@'host'
        const regex = new RegExp(`GRANT \`?${escapedRole}\`?@'%?' TO`, 'i');
        if (regex.test(grantStr)) {
          // Revoke role from user (directly interpolate safe values)
          await pool.query(`REVOKE \`${escapedRole}\`@'%' FROM \`${User}\`@\`${Host}\``);
        }
      }
    }

    // Step 3: Drop the role
    await pool.query(`DROP ROLE \`${escapedRole}\`@'%'`);

    res.json({ message: `Role '${role_name}' deleted successfully.` });
  } catch (err) {
    console.error('Error deleting role:', err);
    res.status(500).json({ message: 'Failed to delete role', error: err.message });
  }
};
