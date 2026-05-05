import type { RouteObject } from "react-router-dom";
import { rotaEventosArvore } from "./arvore-eventos/route";
import { rotaPainel } from "./painel/route";

export const eventosRoutes: RouteObject[] = [rotaPainel, rotaEventosArvore];