import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorageService } from '../services/local-storage.service';

@Injectable()
export class RouteProtectionService implements CanActivate {
    constructor(
        private _jwtHelperService: JwtHelperService,
        private _router: Router,
        private _localStorageService: LocalStorageService) {
    }
    canActivate() {

        /* Re-autenticação - descomentar quando tiver login */

        //var loginData = this._localStorageService.get("loginData");        
        //if (loginData && loginData.token && !this._jwtHelperService.isTokenExpired(loginData.token)) {
            return true;
        //}
        //this._router.navigate(["pages/auth/login"]);
        //return false;
    }
}
