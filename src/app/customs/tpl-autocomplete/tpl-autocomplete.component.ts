import { Component, ElementRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-tpl-autocomplete',
  templateUrl: './tpl-autocomplete.component.html',
  styleUrls: ['./tpl-autocomplete.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: TplAutocompleteComponent },
  ],
})
export class TplAutocompleteComponent
  implements MatFormFieldControl<any>, ControlValueAccessor
{
  value: any;
  stateChanges = new Subject<void>();
  id: string;
  placeholder: string;
  ngControl: NgControl | null;
  focused: boolean;
  empty: boolean;
  shouldLabelFloat: boolean;
  required: boolean;
  disabled: boolean;
  errorState: boolean;
  controlType?: string | undefined;
  autofilled?: boolean | undefined;
  userAriaDescribedBy?: string | undefined;

  constructor(private _elementRef: ElementRef<HTMLElement>) {}
  //#region ControlValueAccessor
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  //#endregion

  setDescribedByIds(ids: string[]): void {
    const controlElement =
      this._elementRef.nativeElement.querySelector('input')!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }
  onContainerClick(event: MouseEvent): void {
    this.focused = true;
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    // this._focusMonitor.stopMonitoring(this._elementRef);
  }
}
