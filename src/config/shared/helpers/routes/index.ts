import { Router } from 'express';
import { authRoutes } from '../../modules/auth/auth.routes';

// import other feature routes

const router = Router();

router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// use other feature routes

export default router;