import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  readonly variant = input<'primary' | 'secondary' | 'danger'>('primary');
  readonly disabled = input(false);
  /** Shows a spinner and blocks input while an action is in flight; the label stays put. */
  readonly loading = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly tabIndex = input<string | number | null>(null);
  /** Accessible name for buttons whose content is not text, e.g. an arrow glyph. */
  readonly ariaLabel = input<string | null>(null);
}
