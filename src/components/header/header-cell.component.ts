import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

import { SelectionType, SortDirection, SortType, TableColumn } from '../../types/index';
import { nextSortDir } from '../../utils/sort';

@Component({
  selector: 'datatable-header-cell',
  template: `
    <div>
      <label
        *ngIf="isCheckboxable" 
        class="datatable-checkbox">
        <input 
          type="checkbox"
          [checked]="allRowsSelected"
          (change)="select.emit(!allRowsSelected)" 
        />
      </label>
      <span 
        *ngIf="!column.headerTemplate"
        class="datatable-header-cell-wrapper">
        <span
          class="datatable-header-cell-label draggable"
          (click)="onSort()"
          [innerHTML]="name">
        </span>
      </span>
      <ng-template
        *ngIf="column.headerTemplate"
        [ngTemplateOutlet]="column.headerTemplate"
        [ngOutletContext]="{ 
          column: column, 
          sortDir: sortDir,
          sortFn: sortFn,
          allRowsSelected: allRowsSelected,
          selectFn: selectFn
        }">
      </ng-template>
      <span
        (click)="onSort()"
        [class]="sortClass">
      </span>
    </div>
  `
})
export class DataTableHeaderCellComponent {

  @Input() sortType: SortType;
  @Input() column: TableColumn;
  @Input() sortAscendingIcon: string;
  @Input() sortDescendingIcon: string;
  @Input() allRowsSelected: boolean;
  @Input() selectionType: SelectionType;

  @HostBinding('style.height.px')
  @Input() headerHeight: number;

  @Input() set sorts(val: any[]) {
    this._sorts = val;
    this.sortDir = this.calcSortDir(val);
    this.sortClass = this.calcSortClass(this.sortDir);
  }

  get sorts(): any[] {
    return this._sorts;
  }

  @Output() sort: EventEmitter<any> = new EventEmitter();
  @Output() select: EventEmitter<any> = new EventEmitter();

  @HostBinding('class')
  get columnCssClasses(): any {
    let columnClass = 'datatable-header-cell';

    if (!this.column) {
      return columnClass;
    }

    if (this.column.sortable) {
      columnClass += ' sortable';
    }

    if (this.column.resizeable) {
      columnClass += ' resizeable';
    }

    if (this.column.headerClass) {
      if (typeof this.column.headerClass === 'string') {
        columnClass += ' ' + this.column.headerClass;
      } else if (typeof this.column.headerClass === 'function') {
        const res = this.column.headerClass({
          column: this.column
        });

        if (typeof res === 'string') {
          columnClass += res;
        } else if (typeof res === 'object') {
          const keys = Object.keys(res);

          for (const k of keys) {
            if (res[k] === true) {
              columnClass += ` ${k}`;
            }
          }
        }
      }
    }

    const sortDir = this.sortDir;

    if (sortDir) {
      columnClass += ` sort-active sort-${sortDir}`;
    }

    return columnClass;
  }

  @HostBinding('attr.title')
  get name(): string {
    // guaranteed to have a value by setColumnDefaults() in column-helper.ts
    return this.column.headerTemplate === undefined ? this.column.name : undefined;
  }

  @HostBinding('style.minWidth.px')
  get minWidth(): number {
    return this.column.minWidth;
  }

  @HostBinding('style.maxWidth.px')
  get maxWidth(): number {
    return this.column.maxWidth;
  }

  @HostBinding('style.width.px')
  get width(): number {
    return this.column.width;
  }

  get isCheckboxable(): boolean {
    return this.column.checkboxable &&
      this.column.headerCheckboxable &&
      this.selectionType === SelectionType.checkbox;
  }

  sortFn = this.onSort.bind(this);
  sortClass: string;
  sortDir: SortDirection;
  _sorts: any[];
  selectFn = this.select.emit.bind(this.select);

  @HostListener('contextmenu', ['$event'])
  onContextmenu($event: MouseEvent): void {
    this.columnContextmenu.emit({ event: $event, column: this.column });
  }

  calcSortDir(sorts: any[]): any {
    if (sorts && this.column) {
      const sort = sorts.find((s: any) => {
        return s.prop === this.column.prop;
      });

      if (sort) {
        return sort.dir;
      }
    }
  }

  onSort(): void {
    if (!this.column.sortable) return;

    const newValue = nextSortDir(this.sortType, this.sortDir);
    this.sort.emit({
      column: this.column,
      prevValue: this.sortDir,
      newValue
    });
  }

  calcSortClass(sortDir: SortDirection): string {
    if (sortDir === SortDirection.asc) {
      return `sort-btn sort-asc ${this.sortAscendingIcon}`;
    } else if (sortDir === SortDirection.desc) {
      return `sort-btn sort-desc ${this.sortDescendingIcon}`;
    } else {
      return `sort-btn`;
    }
  }
}
