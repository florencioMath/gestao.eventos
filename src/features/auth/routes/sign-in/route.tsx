import type { RouteObject } from 'react-router-dom';
import { SignInPage } from './page';

export const signInPath = '/entrar';
export const signInRoute: RouteObject = {
	path: signInPath,
	element: <SignInPage />,
};
