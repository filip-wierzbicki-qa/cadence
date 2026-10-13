import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
})
export class Logo {
  readonly svgOnly = input<boolean | null>(null);
  /** `lg` is for places where the logo is the only brand cue, such as above a form. */
  readonly size = input<'md' | 'lg'>('md');
}
