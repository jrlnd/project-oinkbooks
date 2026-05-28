import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavBar } from './nav-bar';

/**
 * Authenticated layout. v2 replacement for v1's components/Layout.tsx +
 * Next.js getLayout pattern: a parent route component that renders the
 * navbar once and a <router-outlet> for the child page (dashboard/purchases).
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, NavBar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}
