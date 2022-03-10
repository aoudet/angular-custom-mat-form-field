import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  MatFormField,
  MatFormFieldControl,
  MAT_FORM_FIELD,
} from '@angular/material/form-field';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-tpl-autocomplete',
  templateUrl: './tpl-autocomplete.component.html',
  styleUrls: ['./tpl-autocomplete.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: TplAutocompleteComponent },
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: TplAutocompleteComponent,
    },
  ],
})
export class TplAutocompleteComponent
  implements MatFormFieldControl<any>, ControlValueAccessor
{
  static nextId = 0;
  stateChanges = new Subject<void>();
  id = `tpl-autocomplete-${TplAutocompleteComponent.nextId++}`;
  focused = false;
  touched = false;
  controlType = 'tpl-autocomplete';
  autofilled?: boolean | undefined;

  get empty() {
    // const {
    //   value: { area, exchange, subscriber },
    // } = this.parts;
    return true;
    // return !area && !exchange && !subscriber;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input('aria-describedby') userAriaDescribedBy: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    // this._disabled ? this.parts.disable() : this.parts.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): any | null {
    // if (this.parts.valid) {
    //   const {
    //     value: { area, exchange, subscriber },
    //   } = this.parts;
    //   return new MyTel(area, exchange, subscriber);
    // }
    return null;
  }
  set value(tel: any | null) {
    // const { area, exchange, subscriber } = tel || new MyTel('', '', '');
    // this.parts.setValue({ area, exchange, subscriber });
    this.stateChanges.next();
  }

  get errorState(): boolean {
    return false;
    // return this.parts.invalid && this.touched;
  }

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {}
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
    // const controlElement =
    //   this._elementRef.nativeElement.querySelector('input')!;
    // controlElement.focus();
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    // this._focusMonitor.stopMonitoring(this._elementRef);
  }
}
