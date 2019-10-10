import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StudentsRoutingModule } from './students-routing.module';
import { StudentsListComponent } from './students-list/students-list.component';
import { StudentsNotesComponent } from './students-notes/students-notes.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';
import { NgbdSortableHeaderDirective } from './sortable.directive';

@NgModule({
    declarations: [StudentsListComponent, StudentsNotesComponent, StudentDetailComponent, NgbdSortableHeaderDirective],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        StudentsRoutingModule
    ]
})
export class StudentsModule { }
