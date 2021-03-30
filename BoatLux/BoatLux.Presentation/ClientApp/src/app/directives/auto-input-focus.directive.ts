import { Directive, ElementRef, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';

@Directive({
    selector: '[autoInputFocus]',
})
export class AutoInputFocusDirective implements AfterContentInit {

    constructor(private el: ElementRef) {
        if (!el.nativeElement['focus'])
            console.log('Element does not accept focus.');
    }

    ngAfterContentInit(): void {
        const input: HTMLInputElement = this.el.nativeElement as HTMLInputElement;
        setTimeout(function () {
            input.focus();
            //input.select();
        }, 500);
    }
}