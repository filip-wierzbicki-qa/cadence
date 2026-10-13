import { Component, computed, DestroyRef, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { LucideGripVertical, LucidePencil, LucidePlus } from '@lucide/angular';
import { filter } from 'rxjs';

import { GoalsService } from '@core/api/goals.service';
import { GoalPeriod, GoalResponse } from '@models/goalModel';
import { Button } from '@shared/ui/button/button';
import { Icon } from '@shared/ui/icon/icon';

type GoalStatusFilter = 'active' | 'inactive' | 'all';

interface GoalSection {
  title: string;
  period: GoalPeriod;
  goals: GoalResponse[];
}

/** Set on router state by the goal form after it deactivates a goal. */
export interface GoalDeactivatedState {
  id: string;
  name: string;
}

const UNDO_WINDOW_MS = 8000;

@Component({
  selector: 'app-goals',
  imports: [
    RouterOutlet,
    LucidePencil,
    LucidePlus,
    DecimalPipe,
    Button,
    Icon,
    LucideGripVertical,
    DragDropModule,
  ],
  templateUrl: './goals.html',
  styleUrl: './goals.scss',
})
export class Goals {
  private readonly router = inject(Router);
  private readonly goalService = inject(GoalsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusFilters: { value: GoalStatusFilter; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'all', label: 'All' },
  ];
  readonly placeholders = [1, 2, 3];

  readonly statusFilter = signal<GoalStatusFilter>('active');
  readonly reorderError = signal<string | null>(null);
  readonly deactivated = signal<GoalDeactivatedState | null>(null);

  readonly goalsResource = rxResource({
    stream: () => this.goalService.getGoals(),
  });

  /** Local copy of the loaded goals, so a drag can reorder optimistically. */
  readonly goals = linkedSignal<GoalResponse[]>(() =>
    this.goalsResource.hasValue() ? this.goalsResource.value() : [],
  );

  readonly sections = computed<GoalSection[]>(() => {
    const status = this.statusFilter();

    const visible = this.goals().filter((goal) => {
      if (status === 'all') {
        return true;
      }

      return status === 'active' ? goal.is_active : !goal.is_active;
    });

    return [
      { title: 'Daily', period: 'daily' as const },
      { title: 'Weekly', period: 'weekly' as const },
    ]
      .map((section) => ({
        ...section,
        goals: visible.filter((goal) => goal.period === section.period),
      }))
      .filter((section) => section.goals.length > 0);
  });

  /** Only true once the request succeeded and returned nothing to show. */
  readonly isEmpty = computed(() => this.goalsResource.hasValue() && this.sections().length === 0);

  private undoTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // The goal form hands over "I just deactivated this goal" through navigation state, so the
    // list can offer an undo after the modal has closed.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const state = history.state?.['goalDeactivated'] as GoalDeactivatedState | undefined;

        if (state) {
          history.replaceState({ ...history.state, goalDeactivated: undefined }, '');
          this.showDeactivated(state);
        }
      });

    this.destroyRef.onDestroy(() => this.clearUndoTimer());
  }

  addGoal(): void {
    this.router.navigate(['/goals/new']);
  }

  editGoal(goalId: string): void {
    this.router.navigate([`goals/${goalId}/edit`]);
  }

  setStatusFilter(value: GoalStatusFilter): void {
    this.statusFilter.set(value);
  }

  onGoalDrop(event: CdkDragDrop<GoalResponse[]>): void {
    this.moveGoal(event.container.data, event.previousIndex, event.currentIndex);
  }

  /** Keyboard alternative to dragging: ArrowUp / ArrowDown on the handle. */
  onHandleKeydown(event: KeyboardEvent, section: GoalSection, index: number): void {
    const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;

    if (delta === 0) {
      return;
    }

    event.preventDefault();
    this.moveGoal(section.goals, index, index + delta);
  }

  undoDeactivate(): void {
    const state = this.deactivated();

    if (!state) {
      return;
    }

    this.dismissDeactivated();

    this.goalService.updateGoal(state.id, { is_active: true }).subscribe({
      next: () => this.goalsResource.reload(),
      error: (error) => {
        console.error('Failed to restore goal:', error);
        this.reorderError.set("Couldn't restore the goal. Try again from its edit screen.");
      },
    });
  }

  dismissDeactivated(): void {
    this.clearUndoTimer();
    this.deactivated.set(null);
  }

  private moveGoal(list: GoalResponse[], from: number, to: number): void {
    if (from === to || to < 0 || to >= list.length) {
      return;
    }

    const reordered = [...list];
    const [moved] = reordered.splice(from, 1);

    reordered.splice(to, 0, moved);
    this.reorderError.set(null);

    // Optimistic: reflect the new order immediately, then persist it.
    const positions = new Map(reordered.map((goal, index) => [goal.id, index]));

    this.goals.update((goals) =>
      goals
        .map((goal) =>
          positions.has(goal.id) ? { ...goal, position: positions.get(goal.id)! } : goal,
        )
        .sort((a, b) => a.position - b.position),
    );

    this.goalService.reorderGoals(reordered.map((goal) => goal.id)).subscribe({
      error: (error) => {
        console.error('Failed to reorder goals:', error);
        this.reorderError.set("Couldn't save the new order. It has been restored.");
        this.goalsResource.reload();
      },
    });
  }

  private showDeactivated(state: GoalDeactivatedState): void {
    this.clearUndoTimer();
    this.deactivated.set(state);
    this.undoTimer = setTimeout(() => this.deactivated.set(null), UNDO_WINDOW_MS);
  }

  private clearUndoTimer(): void {
    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
      this.undoTimer = null;
    }
  }
}
