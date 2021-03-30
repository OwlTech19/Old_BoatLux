import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import Swal from 'sweetalert2'
/* Services */
import { LoginService } from '../../services/login.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { FuseConfigService } from '@fuse/services/config.service';
/* Interfaces */
import { RequestLogin } from '../../interfaces/login.interface';

@Component({
    selector     : 'login',
    templateUrl  : './login.component.html',
    styleUrls    : ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LoginComponent implements OnInit
{
    form: FormGroup;
    invalidLogin: boolean;
    loginEmAndamento: boolean;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,        
        private _router: Router, 
        private _loginService: LoginService,
        private _localStorageService: LocalStorageService
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    login() {        

        /* Teste */
        if (this.form.value.email == 'admin' && this.form.value.senha == '123') {

            console.log('entrei')
            this.invalidLogin = false;
            this.loginEmAndamento = false;
            //this._localStorageService.set(response, 'loginData');
            this._router.navigate(["/inicio/dashboard"]);
        }

        
        let request: RequestLogin = {
            email: this.form.value.email,
            password: this.form.value.senha
        };
        this.loginEmAndamento = true;

        this._loginService.login(request).subscribe(response => {
            this.invalidLogin = false;
            this.loginEmAndamento = false;
            this._localStorageService.set(response, 'loginData');                                    
            this._router.navigate(["/inicio/dashboard"]);
            
        }, err => {
                this.invalidLogin = true;
                this.loginEmAndamento = false;
                this.form.reset();
                Swal.fire('Ops!', err.error.Message ?? 'Não foi possível realizar o login.', 'error');            
        });
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.form = this._formBuilder.group({
            email   : ['', [Validators.required]],
            senha: ['', Validators.required]
        });
    }
}
