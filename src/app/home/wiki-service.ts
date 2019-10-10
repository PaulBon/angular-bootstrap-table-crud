import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

const WIKI_URL = 'https://en.wikipedia.org/w/api.php';
const PARAMS = new HttpParams({
    fromObject: {
        action: 'opensearch',
        format: 'json',
        origin: '*'
    }
});

@Injectable()
export class WikiService {

    /**
     * The constructor for the Wiki service.
     *
     * @param http a dependency injection (DI) for HttpClient
     */
    constructor(private http: HttpClient) { }

    /**
     * Returns the Wikipedia topics that start with the passed in term.
     *
     * @param term the term to look for
     */
    search(term: string): Observable<string[]> {
        if (term === '') {
            return of([]);
        }

        return this.http
            .get(WIKI_URL, { params: PARAMS.set('search', term) }).pipe(
                map(response => response[1])
            );
    }
}
