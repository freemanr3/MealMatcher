import { Router } from 'express';
import subscriptionRoutes from './subscription';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to PantryPal API' });
});

// Register subscription routes
router.use('/subscription', subscriptionRoutes);

export default router; 