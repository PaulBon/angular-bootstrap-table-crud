import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TableFilterTextComponent } from './table-filter-text/table-filter-text.component';

@NgModule({
    declarations: [TableFilterTextComponent],
    exports: [TableFilterTextComponent],
    entryComponents: [TableFilterTextComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class TableFiltersModule { }
