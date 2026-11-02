import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { AuthStore } from "./auth-store";

/**
 * Interceptor HTTP funcional encargado de incorporar
 * el token JWT a las peticiones del frontend.
 *
 * Consulta el token almacenado mediante AuthStore.
 *
 * Si existe un token, genera una copia de la petición
 * e incorpora la cabecera Authorization con el esquema Bearer.
 *
 * Si no existe un token, permite que la petición continúe
 * sin modificar sus encabezados.
 *
 * El interceptor se registra globalmente en appConfig
 * mediante provideHttpClient y withInterceptors.
 *
 * @param req Petición HTTP original que realiza Angular.
 * @param next Función que permite continuar la cadena
 * de interceptores y enviar la petición.
 * @returns Observable con los eventos de la respuesta HTTP.
 */
export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {

  const authToken = inject(AuthStore).obtenerToken();

  if (!authToken) {
    return next(req);
  }

  const reqWithToken = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
  });

  return next(reqWithToken);
}
