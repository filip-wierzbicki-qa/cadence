import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly size = input<'md' | 'lg'>('md');

  /**
   * When set, Escape, the backdrop and × do not close the dialog; they emit `closeRequested`
   * instead, so the owner can ask for confirmation first and close by setting `open` to false.
   */
  readonly guarded = input(false);

  readonly closed = output<void>();
  readonly closeRequested = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;

      if (!dialog) return;

      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  close(): void {
    if (this.guarded()) {
      this.closeRequested.emit();
      return;
    }

    this.dialog()?.nativeElement.close();
  }

  onCancel(event: Event): void {
    if (this.guarded()) {
      event.preventDefault();
      this.closeRequested.emit();
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) {
      this.close();
    }
  }
}
