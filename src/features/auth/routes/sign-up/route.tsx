import type { RouteObject } from 'react-router-dom';
import { SignUpPage } from './page';

export const signUpPath = '/criar-conta';
export const signUpRoute: RouteObject = {
	path: signUpPath,
	element: <SignUpPage />,
};
