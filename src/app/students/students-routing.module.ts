import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StudentsListComponent } from './students-list/students-list.component';
import { StudentsNotesComponent } from './students-notes/students-notes.component';

const routes: Routes = [
    {
        path: '',
        children: [
            { path: 'list', component: StudentsListComponent },
            { path: 'notes', component: StudentsNotesComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StudentsRoutingModule { }
