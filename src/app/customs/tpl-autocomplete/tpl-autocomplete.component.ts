import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit,  Component,  ElementRef,  Inject,  Input,  OnInit,  Optional,  Self,  ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, Validators, } from '@angular/forms';
import { MatAutocompleteSelectedEvent,  MatAutocompleteTrigger,  _MatAutocompleteBase,} from '@angular/material/autocomplete';
import { _MatOptionBase } from '@angular/material/core';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD, } from '@angular/material/form-field';
import { filter,  map,  Observable,  startWith,  Subject,  Subscription } from 'rxjs';

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
  implements MatFormFieldControl<T>, ControlValueAccessor, OnInit, AfterViewInit
{
  static nextId = 0;
  @ViewChild('autoInput') autoInput: HTMLInputElement;
  @ViewChild('autoInput', { read: MatAutocompleteTrigger, static: false })
  autoTrigger: MatAutocompleteTrigger;
  
  myControl = new FormControl();  // form control as this custom holds only one control. shoudl be any Form this custom control should represent ( by properties )

  /**
   * specific object ( inner control ) that holds current option's Real Object (as T)
   */
  get currentObject(): T {
    return this._currentObject;
  }
  set currentObject(value: T) {
    this._currentObject = value;
    if (value && this.autoTrigger) {
      this.autoTrigger.writeValue(value);
    }
  }
  private _currentObject: T;

  @Input() options: T[] = [];
  filteredOptions: Observable<any[]>;

  //MatFormFieldControl implementation properties
  //#region MatFormFieldControl implementation
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
    this.setValidation(this.required);
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
//#endregion
  
  /**
   * important from MatFormFieldControl. Out of "region"
   * allows this Forms' controls to update parents' Form group and Form value...
   */
  @Input()
  get value(): T | null {
    if (this.myControl.valid) {
      (<any>this.currentObject)[this.filterField] = this.myControl.value;
      return this.currentObject;
    }
    return null;
  }
  set value(value: T | null) {
    this.currentObject = value as T;
    this.myControl.setValue( value);  
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

  /**
   * Important part of ControlValueAccessor: out of "region".
   * writeValue: method called by the Forms module to write a value into a form control...
   * So this means write From Higher order FormGroup...
   */
  writeValue(obj: T): void {
    this.value = obj;
  }
  
  //#region ControlValueAccessor
  onChange = (_: any) => {};
  onTouched = () => {};  

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  //#endregion

  //#region MatFormFieldControl methods
  setDescribedByIds(ids: string[]): void {
    const controlElement =
      this._elementRef.nativeElement.querySelector('input')!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
    this._focusMonitor.focusVia(this.autoInput, 'program');
  }
  //#endregion

  //#region  actions or events handlers 
  onSelection(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    this.currentObject = value;
  
    this.markAsTouched();
    this.onChange(value);
  }

  displayFn(data?: T): string {
    return (data && (<any>data)[this.filterField]) || '';
  }
//#endregion
  
  // _ THE ones needed to be overriden in any directive
  _filter(value: string): T[] {      
    const filtered =  this.options.filter((option) => {
      return (<any>option)[this.filterField]
        .toLowerCase()
        .includes(value.toLowerCase())
    });

    if (filtered.length === 0) {
      const adding = this._createUnknownObject(value, true);  
      if (adding as T){ filtered.unshift(adding); }
    }
    
    return filtered;
  }

  _createUnknownObject(value: string, resetId: boolean = false): T {
    const locVar = <any>this.currentObject || {} as T;

    if (locVar.id === -1 || resetId) {
      locVar.id = -1;
      locVar[this.filterField]= value;
    }

    return locVar;
  }

  ngOnDestroy() {
    this.autoTriggerSubscription.unsubscribe();
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  private markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
    this.stateChanges.next();
  }

  private setValidation(req: boolean) {
    if (req === true) {
      this.myControl.addValidators(Validators.required);
    } else {
      this.myControl.clearValidators();
    }
    this.myControl.updateValueAndValidity();
  }  
}
