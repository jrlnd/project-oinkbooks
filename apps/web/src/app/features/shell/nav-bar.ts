import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

/** v2 port of v1's components/NavBar.tsx — sticky toolbar with logo,
 *  nav links (responsive: hamburger on small screens, inline on md+),
 *  and a user menu with Logout. Active route highlighting via
 *  routerLinkActive (the Angular idiom; replaces v1's manual logic). */
@Component({
  selector: 'app-nav-bar',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  protected readonly auth = inject(AuthService);

  protected readonly pages = [
    { label: 'Dashboard', url: '/dashboard', icon: 'dashboard' },
    { label: 'Purchases', url: '/purchases', icon: 'receipt_long' },
  ] as const;

  logout(): void {
    this.auth.logout();
  }
}
