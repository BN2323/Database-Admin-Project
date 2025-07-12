import pool from '../config/pool.js';

export const getAllUsers = async (req, res) => {
  try {
    // Step 1: Get all non-system users
    const [users] = await pool.query(`
      SELECT User, Host 
      FROM mysql.user 
      WHERE User != '' 
        AND User NOT IN ('mysql.infoschema', 'mysql.session', 'mysql.sys', 'root')
    `);

    const usersWithRoles = [];

    for (const { User, Host } of users) {
      // Step 2: Show grants for each user
      const [grantsRows] = await pool.query(`SHOW GRANTS FOR ?@?`, [User, Host]);

      const grantStrings = grantsRows.map(row => Object.values(row)[0]);

      // Step 3: Look for GRANT ... TO 'user'@'host' (where the user is being *given* a role)
      const roles = grantStrings
        .map(grant => {
          const match = grant.match(/GRANT `?(\w+)`?@`?%`? TO/); // role@% → granted to user
          return match ? match[1] : null;
        })
        .filter(role => role !== null);

      // Step 4: Only include users with at least one role
      if (roles.length > 0) {
        usersWithRoles.push({ user: User, host: Host, roles });
      }
    }

    res.json(usersWithRoles);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users with roles', error: err.message });
  }
};



export const createUser = async (req, res) => {
  const { username, password, host = 'localhost' } = req.body;
  try {
    await pool.query(`CREATE USER '${username}'@'${host}' IDENTIFIED BY '${password}';`);
    res.status(201).json({ message: `User '${username}'@'${host}' created` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

export const grantRoleToUser = async (req, res) => {
  const { username, role, host = 'localhost' } = req.body;
  try {
    await pool.query(`GRANT '${role}' TO '${username}'@'${host}';`);
    res.json({ message: `Granted role '${role}' to '${username}'@'${host}'` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to grant role', error: err.message });
  }
};


// DELETE /api/user/delete/:username/:host
export const deleteUser = async (req, res) => {
  const { username, host } = req.params;
  try {
    await pool.query(`DROP USER ?@?`, [username, host]); // safer with placeholders
    res.json({ message: `User '${username}'@'${host}' deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

export const updateUser = async (req, res) => {
  const { oldUsername, oldHost } = req.params;
  const { newUsername, newPassword, newRole } = req.body;

  try {
    // Rename the user if needed
    if (oldUsername !== newUsername) {
      await pool.query(
        `RENAME USER ?@? TO ?@?`,
        [oldUsername, oldHost, newUsername, oldHost]
      );
    }

    // Update password
    if (newPassword) {
      await pool.query(
        `ALTER USER ?@? IDENTIFIED BY ?`,
        [newUsername, oldHost, newPassword]
      );
    }

    // Revoke existing roles
    const [grantsRows] = await pool.query(`SHOW GRANTS FOR ?@?`, [newUsername, oldHost]);
    const grantStrings = grantsRows.map(row => Object.values(row)[0]);

    for (const grant of grantStrings) {
      const match = grant.match(/GRANT `?(\w+)`?@`?%`? TO/);
      if (match) {
        const currentRole = match[1];
        await pool.query(`REVOKE '${currentRole}' FROM ?@?`, [newUsername, oldHost]);
      }
    }

    // Grant new role (if provided)
    if (newRole) {
      await pool.query(`GRANT '${newRole}' TO ?@?`, [newUsername, oldHost]);
    }

    res.json({ message: `User '${newUsername}'@'${oldHost}' updated.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};
