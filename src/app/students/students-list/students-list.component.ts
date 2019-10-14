import { Component, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Student } from '../student';
import { StudentsHttpClient } from '../students-http-client';
import { NgbdSortableHeaderDirective, SortEvent, SortDirection } from '../sortable.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationComponent } from '../../dialogs/notification/notification.component';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { TableFilterTextComponent } from '../../table-filters/table-filter-text/table-filter-text.component';
import { TableFilter } from '../../table-filters/table-filter';

@Component({
    selector: 'app-students-list',
    templateUrl: './students-list.component.html',
    styleUrls: ['./students-list.component.css']
})
export class StudentsListComponent implements AfterViewInit {

    studentsHttpClient: StudentsHttpClient | null;
    students: Student[] = [];
    sortColumn = 'lastName';
    sortDirection: SortDirection = 'asc';
    totalStudents = 0;
    pageSize = 5;
    page = 1;
    isProcessing = true;
    expandedStudents: Set<number> = new Set<number>();
    tableFilters: Map<string, TableFilter> = new Map<string, TableFilter>();
    editStudentId = -1;
    isAdding = false;
    selectedStudents: Set<Student> = new Set<Student>();

    // Since the school id form control has an async validator, we'll set updateOn to 'blur' so the async validator will only be called
    // when the user exits the input field instead of every time the input field value changes.
    studentSchoolIdFormControl = new FormControl('', { updateOn: 'blur', validators: [Validators.required],
                                                    asyncValidators: [this.studentSchoolIdValidator()] });
    firstNameFormControl = new FormControl('', [Validators.required]);
    lastNameFormControl = new FormControl('', [Validators.required]);
    studentEmailFormControl = new FormControl('', [Validators.required, Validators.email]);

    /**
     * An injected reference to the sort header components for the student list table.
     */
    @ViewChildren(NgbdSortableHeaderDirective) headers: QueryList<NgbdSortableHeaderDirective>;

    /**
     * The constructor for the student list component.
     *
     * @param modalService a dependency injection (DI) for NgbModal
     */
    constructor(private modalService: NgbModal) { }

    /**
     * Called after Angular has fully initialized the component's view. Inits the table.
     */
    ngAfterViewInit() {
        this.studentsHttpClient = new StudentsHttpClient();

        // Reload the students passing in a post load function that collapses all detail rows
        // and inits the initial sort header after the students are reloaded.
        // This must be done after the students are loaded to avoid an ExpressionChangedAfterItHasBeenCheckedError.
        const postLoadFunction = (): void => {
            this.expandedStudents.clear();

            this.headers.forEach(header => {
                if (header.sortable === this.sortColumn) {
                    header.direction = this.sortDirection;
                }
            });
        };
        this.reloadStudents(postLoadFunction);
    }

    /**
     * Returns true if there are selected students.
     */
    hasSelected() {
        return this.selectedStudents.size > 0;
    }

    /**
     * Returns true if the number of selected students matches the total number of students.
     */
    isAllSelected() {
        const numSelectedStudents = this.selectedStudents.size;
        return numSelectedStudents === this.totalStudents;
    }

    /**
     * Selects all rows if they are not all selected; otherwise clears all selection.
     */
    masterToggle() {
        if (this.isAllSelected()) {
            // All are selected so user wants to unselect them all.
            this.selectedStudents.clear();
        } else if (this.totalStudents <= this.pageSize) {
            // None or some are selected so user wants to select them all.
            // There's only 1 page of students so we just need to select the ones on the page.
            this.selectedStudents.clear();
            this.students.forEach(row => this.selectedStudents.add(row));
        } else {
            // None or some are selected so user wants to select them all.
            // There are multiple pages so we need to retrieve them all so we can select them all.
            this.isProcessing = true;
            this.selectedStudents.clear();
            this.studentsHttpClient.getStudents(this.sortColumn, this.sortDirection, 0, Number.MAX_VALUE, this.tableFilters)
                .pipe(
                    map(studentsList => { // the function to apply to the StudentDetailList observable
                        this.isProcessing = false;
                        return studentsList.students;
                    }),
                ).subscribe(students => { students.forEach(row => this.selectedStudents.add(row)); });
        }
    }

    /**
     * Toggles a student between selected and not selected.
     *
     * @param student the student to select/unselect
     */
    studentToggle(student: Student): void {
        if (this.selectedStudents.has(student)) {
            this.selectedStudents.delete(student);
        } else {
            this.selectedStudents.add(student);
        }
    }

    /**
     * Returns true if a filter is applied to this column.
     *
     * @param column the column to check
     */
    isColumnFiltered(column: string): boolean {
        return this.tableFilters.has(column);
    }

    /**
     * Returns the class to apply to the table column header based on whether or not it is filtered.
     *
     * @param column the column
     */
    getColumnFilterClass(column: string): string {
        if (this.isColumnFiltered(column)) {
            return 'column-filtered';
        }

        return 'column-not-filtered';
    }

    /**
     * Called when the filter icon is clicked for a column. Opens the filter dialog for the column.
     *
     * @param parentElement the td element for the column
     * @param column the column
     * @param title the title for the dialog
     */
    openTextFilterDialog(parentElement: any, column: string, title: string) {

        // Get location of parent element so we can position the filter dialog right below it
        const parentRect = parentElement.getBoundingClientRect();

        // If the field is already filtered then initialize the filter dialog to the filtered operator and value.
        // Otherwise, initialize it to default operator and blank value.
        let filter: TableFilter;
        if (this.isColumnFiltered(column)) {
            filter = this.tableFilters.get(column);
        } else {
            filter = new TableFilter();
            filter.field = column;
            filter.operator = 'Is equal to';
            filter.value = '';
        }

        const modalRef = this.modalService.open(TableFilterTextComponent, { size: 'sm' });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.field = column;
        modalRef.componentInstance.operator = filter.operator;
        modalRef.componentInstance.value = filter.value;

        modalRef.result.then((result: TableFilter) => {
            if (result.value.length === 0) {
                this.tableFilters.delete(result.field);
            } else {
                this.tableFilters.set(result.field, { field: `${result.field}`, operator: `${result.operator}`, value: `${result.value}` });
            }

            // Reload the students passing in a post load function that collapses all detail rows
            const postLoadFunction = (): void => { this.expandedStudents.clear(); };
            this.reloadStudents(postLoadFunction);
        });
    }

    /**
     * Returns true if the student is currently being edited.
     *
     * @param studentId the studentId
     */
    isEditingStudent(studentId: number): boolean {
        return this.editStudentId === studentId;
    }

    /**
     * Called when the edit icon is clicked for the student. Places the student in edit mode.
     *
     * @param studentId the studentId
     */
    onEditClick(studentId: number): void {
        this.isAdding = false; // exit add mode (if necessary)

        // Set the id of the student that is being edited
        this.editStudentId = studentId;

        // Get the student that is being edited
        const student: Student = this.students.find(s => s.studentId === studentId);

        // For some reason, updating a row that's expanded messes up the detail row display
        // so we'll collapse rows that we're editing
        this.collapseStudent(studentId);

        this.studentSchoolIdFormControl.setValue(student.studentSchoolId);
        this.firstNameFormControl.setValue(student.firstName);
        this.lastNameFormControl.setValue(student.lastName);
        this.studentEmailFormControl.setValue(student.studentEmail);
    }

    /**
     * Returns true if update is disabled due to one or more form controls having an invalid value.
     */
    isUpdateDisabled(): boolean {
        // If any of the form controls are invalid, return true so the Update button will be disabled
        if (this.studentSchoolIdFormControl.invalid || this.firstNameFormControl.invalid ||
            this.lastNameFormControl.invalid || this.studentEmailFormControl.invalid) {
            return true;
        }

        return false;
    }

    /**
     * Called when the update student icon is clicked for a student. Updates the student and refreshes the table.
     *
     * @param studentId the studentId
     */
    onUpdateClick(studentId: number): void {
        // Update the student
        const student: Student = {
            studentId: this.editStudentId,
            studentSchoolId: `${this.studentSchoolIdFormControl.value}`,
            firstName: `${this.firstNameFormControl.value}`,
            lastName: `${this.lastNameFormControl.value}`,
            studentEmail: `${this.studentEmailFormControl.value}`
        };

        this.isProcessing = true;
        this.studentsHttpClient.updateStudent(student)
            .subscribe(rsp => {
                this.isProcessing = false;
                if (rsp.success) {
                    // Reload the students passing in a post load function that sets editStudentId = -1
                    // so the row will exit edit mode
                    const postLoadFunction = (): void => { this.editStudentId = -1; };
                    this.reloadStudents(postLoadFunction);
                } else {
                    const modalRef = this.modalService.open(NotificationComponent, { size: 'sm', centered: true });
                    modalRef.componentInstance.title = 'Error';
                    modalRef.componentInstance.message = rsp.error;
                }
            });
    }

    /**
     * Called when cancel icon is clicked while a student is being edited. Cancels edit mode.
     *
     * @param studentId the studentId
     */
    onCancelEditClick(studentId: number): void {
        // Set editStudentId = -1 so the row will exit edit mode
        this.editStudentId = -1;
    }

    /**
     * Called when cancel icon is clicked while a student is being added. Cancels add mode.
     */
    onCancelAddClick(): void {
        // Set isAdding = false so the add row will be hidden
        this.isAdding = false;
    }

    /**
     * Called when add student icon is clicked. Enters add mode.
     */
    onAddStudentClick(): void {
        this.isAdding = true;
        this.editStudentId = -1; // exit edit mode (if necessary)

        this.studentSchoolIdFormControl.reset();
        this.firstNameFormControl.reset();
        this.lastNameFormControl.reset();
        this.studentEmailFormControl.reset();
    }

    /**
     * Called when the add student icon is clicked for a student. Adds the student and refreshes the table.
     */
    onAddClick(): void {
        // Add the student
        const student: Student = {
            studentId: -1,
            studentSchoolId: `${this.studentSchoolIdFormControl.value}`,
            firstName: `${this.firstNameFormControl.value}`,
            lastName: `${this.lastNameFormControl.value}`,
            studentEmail: `${this.studentEmailFormControl.value}`
        };

        this.isProcessing = true;
        this.studentsHttpClient.addStudent(student)
            .subscribe(rsp => {
                this.isProcessing = false;
                if (rsp.success) {
                    // Reload the students passing in a post load function that sets isAdding = false
                    // so the add header row will be hidden
                    const postLoadFunction = (): void => { this.isAdding = false; };
                    this.reloadStudents(postLoadFunction);
                } else {
                    const modalRef = this.modalService.open(NotificationComponent, { size: 'sm', centered: true });
                    modalRef.componentInstance.title = 'Error';
                    modalRef.componentInstance.message = rsp.error;
                }
            });
    }

    /**
     * Called when the delete selected students icon is clicked. Deletes the students and refreshes the table.
     */
    onDeleteSelectedClick(): void {
        // If no students are selected, display a message and return
        if (this.selectedStudents.size === 0) {
            const modalRefInfo = this.modalService.open(NotificationComponent, { size: 'sm', centered: true });
            modalRefInfo.componentInstance.title = 'Info';
            modalRefInfo.componentInstance.message = 'No students are selected.';
            return;
        }

        const modalRef = this.modalService.open(ConfirmDialogComponent, { size: 'sm', centered: true });
        modalRef.componentInstance.title = 'Delete';
        modalRef.componentInstance.message = 'Are you sure you want to delete the selected students?';

        modalRef.result.then((confirmedDelete: boolean) => {
            if (confirmedDelete) {
                this.isProcessing = true;
                const studentIds: number[] = new Array(this.selectedStudents.size);
                this.selectedStudents.forEach(s => studentIds.push(s.studentId));
                this.studentsHttpClient.deleteStudents(studentIds)
                    .subscribe(rsp => {
                        this.isProcessing = false;
                        if (rsp.success) {
                            // Reload the students passing in a post load function that sets editStudentId = -1
                            // so if a row is in edit mode then it will exit it and also have it clear all selected
                            // students since they've been deleted.
                            const postLoadFunction = (): void => { this.editStudentId = -1; this.selectedStudents.clear(); };
                            this.reloadStudents(postLoadFunction);
                        } else {
                            const modalRefError = this.modalService.open(NotificationComponent, { size: 'sm', centered: true });
                            modalRefError.componentInstance.title = 'Error';
                            modalRefError.componentInstance.message = rsp.error;
                        }
                    });
            }
        });
    }

    /**
     * Called when the delete student icon is clicked for a student. Deletes the student and refreshes the table.
     *
     * @param studentId the studentId
     */
    onDeleteClick(studentId: number): void {
        const modalRef = this.modalService.open(ConfirmDialogComponent, { size: 'sm', centered: true });
        modalRef.componentInstance.title = 'Delete';
        modalRef.componentInstance.message = 'Are you sure you want to delete this student?';

        modalRef.result.then((confirmedDelete: boolean) => {
            if (confirmedDelete) {
                this.isProcessing = true;
                this.studentsHttpClient.deleteStudent(studentId)
                    .subscribe(rsp => {
                        this.isProcessing = false;
                        if (rsp.success) {
                            // Reload the students passing in a post load function that sets editStudentId = -1
                            // so the row will exit edit mode
                            const postLoadFunction = (): void => { this.editStudentId = -1; };
                            this.reloadStudents(postLoadFunction);
                        } else {
                            const modalRefError = this.modalService.open(NotificationComponent, { size: 'sm', centered: true });
                            modalRefError.componentInstance.title = 'Error';
                            modalRefError.componentInstance.message = rsp.error;
                        }
                    });
            }
        });
    }

    /**
     * Called when a header is clicked to sort by that header. Reloads the table with the updated sorting.
     *
     * @param param0 the sort event
     */
    onSort({ column, direction }: SortEvent) {
        // resetting other headers
        this.headers.forEach(header => {
            if (header.sortable !== column) {
                header.direction = '';
            }
        });

        this.sortColumn = column;
        this.sortDirection = direction;

        // Reload the students passing in a post load function that collapses all detail rows
        const postLoadFunction = (): void => { this.expandedStudents.clear(); };
        this.reloadStudents(postLoadFunction);
    }

    /**
     * Called when the page is changed. Reloads the table with the new page.
     */
    onPageChange(): void {
        // Reload the students passing in a post load function that collapses all detail rows
        const postLoadFunction = (): void => { this.expandedStudents.clear(); };
        this.reloadStudents(postLoadFunction);
    }

    /**
     * Called when the page size is changed. Reloads the table with the new page size.
     */
    onPageSizeChange(): void {
        // Reload the students passing in a post load function that collapses all detail rows
        const postLoadFunction = (): void => { this.expandedStudents.clear(); };
        this.reloadStudents(postLoadFunction);
    }

    /**
     * Called to reload the students after events like filtering, add student, delete student, etc.
     *
     * @param postLoadFunction the function to call after the students are reloaded
     */
    reloadStudents(postLoadFunction: () => void): void {
        this.isProcessing = true;
        this.studentsHttpClient.getStudents(this.sortColumn, this.sortDirection, this.page - 1, this.pageSize, this.tableFilters).pipe(
            map(studentsList => { // the function to apply to the StudentsList observable

                // Collapse all detail rows whenever the user sorts or changes pages
                // this.expandedStudents.clear();

                this.isProcessing = false;
                this.totalStudents = studentsList.totalStudents;
                return studentsList.students;
            }),
        ).subscribe(students => {
            this.students = students;
            postLoadFunction();
        });
    }

    /**
     * Returns true if the student's detail row is expanded.
     *
     * @param studentId the studentId to check
     */
    isStudentExpanded(studentId: number): boolean {
        return this.expandedStudents.has(studentId);
    }

    /**
     * Adds the student to the set of expanded students.
     *
     * @param studentId the studentId to add to the set of expanded students
     */
    expandStudent(studentId: number): void {
        this.expandedStudents.add(studentId);
    }

    /**
     * Removes the student from the set of expanded students.
     *
     * @param studentId the studentId to remove from the set of expanded students
     */
    collapseStudent(studentId: number): void {
        this.expandedStudents.delete(studentId);
    }

    /**
     * Returns the class to apply to the table row based on whether or not it is expanded.
     *
     * @param studentId the studentId
     */
    getStudentDetailClass(studentId: number): string {
        if (this.isStudentExpanded(studentId)) {
            return 'detail-row-expanded';
        }

        return 'detail-row-collapsed';
    }

    /**
     * Returns true if add is disabled due to one or more form controls having an invalid value.
     */
    isAddDisabled(): boolean {
        // If any of the form controls are invalid, return true so the Add button will be disabled
        if (this.studentSchoolIdFormControl.invalid || this.firstNameFormControl.invalid ||
            this.lastNameFormControl.invalid || this.studentEmailFormControl.invalid) {
            return true;
        }

        return false;
    }

    /**
     * Called when adding and editing a student to verify the entered student school id is not already assigned to another student.
     */
    studentSchoolIdValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {

            // Make a REST API call to validate the school id. This is needed to make sure the school id
            // isn't already assigned to another student.
            this.isProcessing = true;
            return this.studentsHttpClient.validateStudentSchoolId(this.editStudentId, control.value)
                .pipe(
                    switchMap(rsp => { // switches the Response observable to a ValidationErrors observable
                        this.isProcessing = false;
                        if (rsp.success) {
                            return of(null);
                        } else {
                            return of({ invalidSchoolId: { errorMsg: rsp.error } });
                        }
                    })
                );
        };
    }

    /**
     * If the form control has an error, returns the error message.
     *
     * @param formControl the form control
     */
    getErrorMessage(formControl: FormControl): string {
        if (formControl.hasError('required')) {
            return 'You must enter a value';
        }

        if (formControl.hasError('email')) {
            return 'Not a valid email';
        }

        if (formControl.hasError('invalidSchoolId')) {
            return formControl.getError('invalidSchoolId').errorMsg;
        }

        return '';
    }
}
