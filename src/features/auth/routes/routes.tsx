import type { RouteObject } from 'react-router-dom';
import { signInRoute } from './sign-in/route';
import { signUpRoute } from './sign-up/route';

export const authRoutes: RouteObject[] = [signInRoute, signUpRoute];
