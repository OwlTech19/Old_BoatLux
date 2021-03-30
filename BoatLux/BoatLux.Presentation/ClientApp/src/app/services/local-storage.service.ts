import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class LocalStorageService {

    constructor() {}

    public get(key) {
        const data = localStorage.getItem(key);        
        return !_.isEmpty(data) ? _.cloneDeep(JSON.parse(data)) : [];
    }

    public set(data, key) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    public remove(key) {
        localStorage.removeItem(key);
    }

    public reset() {
        localStorage.clear();
    }
}