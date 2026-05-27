import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import type { CategoryDetails } from '@oinkbooks/types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly brand = signal<CategoryDetails>({
    id: 'brand',
    icon: '🐷',
    label: 'OinkBooks',
  });
}
