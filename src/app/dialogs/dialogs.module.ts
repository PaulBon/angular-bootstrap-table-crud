import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './notification/notification.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
    declarations: [NotificationComponent, ConfirmDialogComponent],
    exports: [NotificationComponent, ConfirmDialogComponent], // components that are accessible to other modules that import this module
    entryComponents: [NotificationComponent, ConfirmDialogComponent], // components that are not referenced in a template
    imports: [
        CommonModule
    ]
})
export class DialogsModule { }
