import type { RouteObject } from 'react-router-dom';
import { rotaEventos } from './eventos/route';
import { rotaPainel } from './painel/route';

export const eventosRoutes: RouteObject[] = [rotaPainel, rotaEventos];
