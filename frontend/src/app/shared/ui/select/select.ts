import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCheck, LucideChevronDown } from '@lucide/angular';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

let nextId = 0;

@Component({
  selector: 'app-select',
  imports: [LucideChevronDown, LucideCheck],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: Select, multi: true }],
})
export class Select implements ControlValueAccessor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly options = input.required<SelectOption[]>();
  readonly label = input.required<string>();

  readonly listId = `app-select-${nextId++}`;

  readonly value = signal<string | null>(null);
  readonly isOpen = signal(false);
  readonly isDisabled = signal(false);
  readonly activeIndex = signal(0);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedLabel(): string {
    return this.options().find((option) => option.value === this.value())?.label ?? '';
  }

  writeValue(value: string | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.isDisabled()) return;

    const selected = this.options().findIndex((option) => option.value === this.value());

    this.activeIndex.set(Math.max(selected, 0));
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.onTouched();
  }

  select(option: SelectOption): void {
    this.value.set(option.value);
    this.onChange(option.value);
    this.close();
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.options().length;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();

        if (!this.isOpen()) {
          this.open();
          return;
        }

        const step = event.key === 'ArrowDown' ? 1 : -1;

        this.activeIndex.update((index) => (index + step + count) % count);
        break;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();

        if (this.isOpen()) {
          this.select(this.options()[this.activeIndex()]);
        } else {
          this.open();
        }
        break;
      case 'Escape':
        // Only this dropdown should react, not a dialog it is sitting in.
        if (this.isOpen()) {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        }
        break;
      case 'Tab':
        if (this.isOpen()) this.close();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
