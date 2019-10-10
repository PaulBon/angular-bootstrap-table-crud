import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'Angular ng-bootstrap CRUD Table';
    isCollapsed = true;

    toggleMenu() {
        this.isCollapsed = !this.isCollapsed;
    }
}
