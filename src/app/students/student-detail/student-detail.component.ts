import { Component, Input, AfterViewInit, OnChanges, SimpleChange, QueryList, ViewChildren } from '@angular/core';
import { map } from 'rxjs/operators';
import { StudentDetail } from '../student-detail';
import { StudentsHttpClient } from '../students-http-client';
import { NgbdSortableHeaderDirective, SortEvent, SortDirection } from '../sortable.directive';

@Component({
    selector: 'app-student-detail',
    templateUrl: './student-detail.component.html',
    styleUrls: ['./student-detail.component.css']
})
export class StudentDetailComponent implements AfterViewInit, OnChanges {

    /**
     * The studentId for this student detail component.
     */
    @Input() studentId: number;

    /**
     * Flag to indicate if this student detail row is expanded or collapsed.
     */
    @Input() isExpanded: boolean;

    studentsHttpClient: StudentsHttpClient | null;
    studentDetails: StudentDetail[] = [];
    sortColumn = 'termCreatedDate';
    sortDirection: SortDirection = 'desc';
    pageSize = 5;
    page = 1;
    totalDetails = 0;
    defaultPageSize = 5;
    isProcessing = true;

    /**
     * An injected reference to the sort header components for the student detail table.
     */
    @ViewChildren(NgbdSortableHeaderDirective) headers: QueryList<NgbdSortableHeaderDirective>;

    /**
     * The constructor for the student detail component.
     */
    constructor() { }

    /**
     * Called after Angular has fully initialized the component's view. Inits the studentsHttpClient, the sort headers and loads the
     * student detail table.
     */
    ngAfterViewInit() {
        if (this.studentsHttpClient == null) {
            this.studentsHttpClient = new StudentsHttpClient();
        }

        // Reload the student details passing in a post load function that inits the initial sort header after the details are reloaded.
        // This must be done after the details are loaded to avoid an ExpressionChangedAfterItHasBeenCheckedError.
        const postLoadFunction = (): void => {
            this.headers.forEach(header => {
                if (header.sortable === this.sortColumn) {
                    header.direction = this.sortDirection;
                }
            });
        };
        this.reloadStudentDetails(postLoadFunction);
    }

    /**
     * Called when a data-bound property changes. This code is handling changes to the isExpanded property.
     *
     * @param changes The changed properties.
     */
    ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (this.studentsHttpClient == null) {
            this.studentsHttpClient = new StudentsHttpClient();
        }

        // When the student is expanded, retrieve the latest details for the student
        if (this.isExpanded) {

            this.headers.forEach(header => {
                if (header.sortable === this.sortColumn) {
                    header.direction = this.sortDirection;
                }
            });

            this.reloadStudentDetails();
        }
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
        this.reloadStudentDetails();
    }

    /**
     * Called when the page is changed. Reloads the table with the new page.
     */
    onPageChange(): void {
        this.reloadStudentDetails();
    }

    /**
     * Called when the page size is changed. Reloads the table with the new page size.
     */
    onPageSizeChange(): void {
        this.reloadStudentDetails();
    }

    /**
     * Called to reload the student details after events like sorting, paging, etc.
     *
     * @param postLoadFunction the optional function to call after the student details are reloaded
     */
    reloadStudentDetails(postLoadFunction?: () => void): void {
        this.isProcessing = true;
        this.studentsHttpClient.getStudentDetail(this.studentId, this.sortColumn, this.sortDirection, this.page - 1, this.pageSize).pipe(
            map(studentDetailList => { // the function to apply to the StudentDetailList observable
                this.isProcessing = false;
                this.totalDetails = studentDetailList.totalDetails;
                return studentDetailList.details;
            }),
        ).subscribe(studentDetails => {
            this.studentDetails = studentDetails;

            if (postLoadFunction !== undefined) {
                postLoadFunction();
            }
        });
    }
}
