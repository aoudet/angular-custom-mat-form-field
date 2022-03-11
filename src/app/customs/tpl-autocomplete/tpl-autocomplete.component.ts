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
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  _MatAutocompleteBase,
} from '@angular/material/autocomplete';
import { _MatOptionBase } from '@angular/material/core';
import {
  MatFormField,
  MatFormFieldControl,
  MAT_FORM_FIELD,
} from '@angular/material/form-field';
import {
  filter,
  map,
  Observable,
  startWith,
  Subject,
  Subscription,
} from 'rxjs';

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
export class TplAutocompleteComponent<T>
  implements MatFormFieldControl<T>, ControlValueAccessor, OnInit
{
  static nextId = 0;
  @ViewChild('autoInput') autoInput: HTMLInputElement;
  @ViewChild('autoInput', { read: MatAutocompleteTrigger, static: false })
  autoTrigger: MatAutocompleteTrigger;

  myControl = new FormControl();
  get currentObject(): T {
    return this._currentObject;
  }
  set currentObject(value: T) {
    this._currentObject = value;
    console.log(`set current Object with value `, value);
    if (value && this.autoTrigger) {
      this.autoTrigger.writeValue(value);
    }
  }
  private _currentObject: T;

  @Input() options: T[] = [];
  filteredOptions: Observable<any[]>;

  //MatFormFieldControl implementation properties
  stateChanges = new Subject<void>();
  id = `tpl-autocomplete-${TplAutocompleteComponent.nextId++}`;
  focused = false;
  touched = false;
  controlType = 'tpl-autocomplete';
  autofilled?: boolean | undefined;

  private autoTriggerSubscription: Subscription;

  get empty() {
    return this.myControl.value === '' || this.myControl.value === null;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty || this.myControl.invalid;
  }

  get errorState(): boolean {
    return this.myControl.invalid && this.touched;
  }

  @Input() filterField: string = 'name';
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
  get value(): T | null {
    console.log(`value (get) from ctr id ${this.id}`, this.myControl.value);
    if (this.myControl.valid) {
      (<any>this.currentObject)[this.filterField] = this.myControl.value;
      return this.currentObject;
    }
    return null;
  }
  set value(value: T | null) {
    console.log(`value (set) from ctr id ${this.id}`, value);
    this.myControl.setValue({[this.filterField] : value});    // javascript way of getting a genereic field name
    this.stateChanges.next();
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

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(
        (value: string | T): string =>
          (typeof value === 'string'
            ? value
            : (<any>value)[this.filterField]) || ''
      ),
      map((value) => this._filter(value))
    );    
  }

  ngAfterViewInit() {
    this.autoTriggerSubscription = this.autoTrigger.panelClosingActions
      .pipe(filter(() => Boolean(this.autoTrigger.activeOption)))
      .subscribe((data) => {
        this.onSelection({
          source: {} as _MatAutocompleteBase,
          option: this.autoTrigger.activeOption as _MatOptionBase,
        });
      });
  }

  //#region ControlValueAccessor
  onChange = (_: any) => {};
  onTouched = () => {};

  /**
   * writeValue: method called by the Forms module to write a value into a form control...
   * So this means write From Higher order FormGroup...
   */
  writeValue(obj: T): void {
    console.log(`writeValue from ctr id ${this.id}`, obj);
    // this.currentObject = obj;
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

  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.markAsTouched();
    }
  }

  onFocusOut(event: FocusEvent) {
    if (
      !this._elementRef.nativeElement.contains(event.relatedTarget as Element)
    ) {
      this.focused = false;
    }
  }

  onSelection(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    this.currentObject = value;
  
    this.markAsTouched();
    this.onChange(value);
  }

  displayFn(data?: T): string {
    return (data && (<any>data)[this.filterField]) || '';
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
    this.stateChanges.next();
  }

  // THE one needed to be overriden in any directive
  _filter(value: string): T[] {      
    const filtered =  this.options.filter((option) => {
      return (<any>option)[this.filterField]
        .toLowerCase()
        .includes(value.toLowerCase())
    });

    if (filtered.length === 0) {
      const adding = this.createUnknownObject(value, true);  
      if (adding as T){ filtered.unshift(adding); }
    }
    
    return filtered;
  }

  ngOnDestroy() {
    this.autoTriggerSubscription.unsubscribe();
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  private _setValidation(req: boolean) {
    if (req === true) {
      this.myControl.addValidators(Validators.required);
    } else {
      this.myControl.clearValidators();
    }
    this.myControl.updateValueAndValidity();
  }

  private createUnknownObject(value: string, resetId: boolean = false): T {
    const locVar = <any>this.currentObject || {} as T;

    if (locVar.id === -1 || resetId) {
      locVar.id = -1;
      locVar[this.filterField]= value;
    }

    return locVar;
  }
}
