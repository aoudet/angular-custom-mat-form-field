import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatFormFieldControl,
  MAT_FORM_FIELD,
} from '@angular/material/form-field';
import { map, Observable, startWith, Subject } from 'rxjs';

@Component({
  selector: 'app-tpl-autocomplete',
  templateUrl: './tpl-autocomplete.component.html',
  styleUrls: ['./tpl-autocomplete.component.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: TplAutocompleteComponent },
  ],
  host: {
    '[id]': 'id',
  },
})
export class TplAutocompleteComponent
  implements MatFormFieldControl<any>, ControlValueAccessor, OnInit
{
  static nextId = 0;
  stateChanges = new Subject<void>();
  id = `tpl-autocomplete-${TplAutocompleteComponent.nextId++}`;
  focused = false;
  touched = false;
  controlType = 'tpl-autocomplete';
  autofilled?: boolean | undefined;

  get empty() {
    return this.myControl.value === '' || this.myControl.value === null;
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
    this._setValidation(this.required);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.myControl.disable() : this.myControl.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): any | null {
    console.log(`value (get) from ctr id ${this.id}`, this.myControl.value);
    if (this.myControl.valid) {
      return this.myControl.value;
    }
    return null;
  }
  set value(value: any | null) {
    console.log(`value (set) from ctr id ${this.id}`, value);
    this.myControl.setValue(value);
    this.stateChanges.next();
  }

  get errorState(): boolean {
    return this.myControl.invalid && this.touched;
  }

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _focusMonitor: FocusMonitor,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }
  //#region ControlValueAccessor
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    console.log(`writeValue from ctr id ${this.id}`, obj);
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
    this._focusMonitor.focusVia(this.autoInput, 'program');
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  @ViewChild('autoInput') autoInput: HTMLInputElement;
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  private _setValidation(req: boolean) {
    if (req === true) {
      this.myControl.addValidators(Validators.required);
    } else {
      this.myControl.clearValidators();
    }
    this.myControl.updateValueAndValidity();
  }

  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  onFocusOut(event: FocusEvent) {
    if (
      !this._elementRef.nativeElement.contains(event.relatedTarget as Element)
    ) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }
}
