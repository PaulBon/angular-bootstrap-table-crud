import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-table-filter-text',
    templateUrl: './table-filter-text.component.html',
    styleUrls: ['./table-filter-text.component.css']
})
export class TableFilterTextComponent {
    @Input() title: string;
    @Input() field: string;
    @Input() operator: string;
    @Input() value: string;

    /**
     * The operators to display in the filter dropdown.
     */
    operators: string[] = ['Is equal to', 'Is not equal to', 'Starts with', 'Contains', 'Does not contain', 'Ends with'];

    valueFormControl = new FormControl('');

    constructor(public activeModal: NgbActiveModal) { }

    /**
     * Called when the Filter button is clicked in the filter dialog.
     */
    onFilterClick(): void {
        this.activeModal.close({ field: `${this.field}`, operator: `${this.operator}`, value: `${this.value}` });
    }

    /**
     * Called when the Clear button is clicked in the filter dialog.
     */
    onClearClick(): void {
        this.activeModal.close({ field: `${this.field}`, operator: '', value: '' });
    }
}
