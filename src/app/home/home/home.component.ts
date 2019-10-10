import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { WikiService } from '../wiki-service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    wikiService: WikiService | null;
    model: any;
    isProcessing = false;

    /**
     * The constructor for the home component.
     *
     * @param http a dependency injection (DI) for HttpClient
     */
    constructor(private http: HttpClient) { }

    /**
     * Called once to initialize the home component.
     */
    ngOnInit() {
        this.wikiService = new WikiService(this.http);
    }

    /**
     * Method that's called whenever the autocomplete control value changes.
     */
    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.isProcessing = true),
            switchMap(term => this.wikiService.search(term)),
            tap(() => this.isProcessing = false)
        )

}
