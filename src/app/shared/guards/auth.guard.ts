import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const userJson = localStorage.getItem('lastLoggedUser');
  let isLoggedIn = false;
  let loginTime = 0;
  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      isLoggedIn = !!user.uId;
      loginTime = user.loginTime || 0;
    } catch {
      isLoggedIn = false;
      loginTime = 0;
    }
  }
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const isTimeValid = (now - loginTime) < ONE_HOUR;
  console.log('time passed', now - loginTime);
  if (!isLoggedIn || !loginTime || !isTimeValid) {
    localStorage.removeItem('lastLoggedUser');
    router.navigate(['/']);
    return false;
  }
  return true;
};
