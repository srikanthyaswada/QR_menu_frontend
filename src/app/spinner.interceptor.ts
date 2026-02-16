import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { QrmenuService } from './qrmenu.service';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {

  const service = inject(QrmenuService);

  service.showSpinner();

  return next(req).pipe(
    finalize(() => service.hideSpinner())
  );
};