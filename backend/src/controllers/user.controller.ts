import express from 'express';
import { getUserById, createUser } from '../repositories/user.repository';

const router = express.Router();

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(parseInt(id, 10));
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  const user = { username, email, password };
  try {
    const createdUser = await createUser(user);
    res.json(createdUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Additional API endpoints for updating, deleting users, etc.

export default router;
