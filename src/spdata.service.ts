import {Injectable} from '@angular/core';

@Injectable()
export class SpDataService {
    superVar: any;
    constructor() {
        console.log('constructor SpDataService');
    }

    getExpenses() {
        console.log('toto');
    }
}