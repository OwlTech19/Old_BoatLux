import { Component } from '@angular/core';
import { LocalStorageService } from '../../../services/local-storage.service';

@Component({
    selector   : 'footer',
    templateUrl: './footer.component.html',
    styleUrls  : ['./footer.component.scss']
})
export class FooterComponent
{
    /**
     * Constructor
     */
    constructor(private _localStorageService: LocalStorageService)
    {
    }

    loginData() {
        return this._localStorageService.get("loginData");
    }
}
