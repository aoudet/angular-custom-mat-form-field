import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger, _MatAutocompleteBase } from '@angular/material/autocomplete';
import { _MatOptionBase } from '@angular/material/core';
import { distinctUntilChanged, EMPTY, filter, map, Observable, startWith, Subscription, tap, withLatestFrom } from 'rxjs';
import { MyTel } from './customs/models/my-tel';
import { User } from './customs/models/user';

/** @title Form field with custom telephone number input control. */
@Component({
  selector: 'form-field-custom-control-example',
  templateUrl: 'form-field-custom-control-example.html',
})
export class FormFieldCustomControlExample  implements OnInit, AfterViewInit {
  form: FormGroup = new FormGroup({
    tel: new FormControl(new MyTel('123', '456', '7788')),
    user: new FormGroup({
      name: new FormControl(''),
      title: new FormControl(''),
    })
    
  });

  currentUser = new User(55, 'Tom', 'Soyer');
  options = [
    new User(1, 'One', 'un'),
    new User(2, 'Two', 'deux'),
    new User(3, 'Three', 'trois'),
    this.currentUser
  ];


  filteredTitleOptions$: Observable<User[]> = EMPTY;
  filteredNameOptions$: Observable<User[]> = EMPTY;

  autoTriggerSubscriptions: Subscription[] = [];

  @ViewChild('autoInputTitle', { read: MatAutocompleteTrigger, static: false })
  autoTriggerTitle: MatAutocompleteTrigger;
  @ViewChild('autoInputName', { read: MatAutocompleteTrigger, static: false })
  autoTriggerName: MatAutocompleteTrigger;

  ngOnInit() {
    this.form.get('user')?.setValue({ name: this.currentUser , title: this.currentUser  });  // need this line first
    
    // this.filteredNameOptions$ = (this.form.get('user.name') || {} as AbstractControl).valueChanges
    //   .pipe(
    //     tap(data => console.log(`filteredNameOptions$ from values changes gets`, data)),
    //     startWith(this.form.get('user.name')?.value || ''),    // works BC setValue is called before...
    //     map((value: string | User): string => (typeof value === 'string' ? value : (<any>value)['name']) || '' ),
    //     map((value) => this._filter(value))
    //   );

    // this.filteredTitleOptions$ = (this.form.get('user.title') || {} as AbstractControl).valueChanges
    //   .pipe(
    //     tap(data => console.log(`filteredTitleOptions$ from values changes gets`, data)),
    //     startWith(this.form.get('user.title')?.value || ''),    // works BC setValue is called before...
    //     map((value: string | User): string => (typeof value === 'string' ? value : (<any>value)['title']) || '' ),
    //     map((value) => this._filter(value, 'title'))
    //   );


    (this.form.get('user.name') || {} as AbstractControl).valueChanges
      .pipe(
        distinctUntilChanged(),
        tap((name) => this.form.get('user.title')?.setValue(name))
    ).subscribe(data => console.log(`form updted for path 'user.name' with `, data));
    
    (this.form.get('user.title') || {} as AbstractControl).valueChanges
      .pipe(
        distinctUntilChanged(),
        tap((title) => this.form.get('user.name')?.setValue(title))
      ).subscribe(data => console.log(`form updted for path 'user.title' with `, data));

    (this.form.get('user') || {} as AbstractControl).valueChanges.subscribe(data => console.log(`form updted for path 'user' with `, data));
  }

  ngAfterViewInit() {
    this.autoTriggerSubscriptions.push(
      this.autoTriggerName?.panelClosingActions
        .pipe(
          tap(data => console.log(`autoTriggerName closing with `, this.autoTriggerName.activeOption)),
          filter(() => Boolean(this.autoTriggerName.activeOption))
        )
        .subscribe((data) => {
          this.form.get('user.name')?.setValue(this.autoTriggerName.activeOption?.value);
          this.autoTriggerName.autocomplete.optionSelected.emit({
            source: { id: 'name' } as _MatAutocompleteBase,
            option: this.autoTriggerName.activeOption as _MatOptionBase,
          } as MatAutocompleteSelectedEvent);

          // update next autocomplete trigger value... will it helps to filter out when palen opens?
          //this.autoTriggerTitle.writeValue(this.autoTriggerName.activeOption?.value);
          this.form.get('user.title')?.setValue(this.autoTriggerName.activeOption?.value);
        }),
      
      this.autoTriggerTitle?.panelClosingActions
        .pipe(
          tap(data => console.log(`autoTriggerTitle closing with `, this.autoTriggerTitle.activeOption)),
          filter(() => Boolean(this.autoTriggerTitle.activeOption)))
        .subscribe((data) => {   
          this.form.get('user.title')?.setValue(this.autoTriggerTitle.activeOption?.value);
          this.autoTriggerTitle.autocomplete.optionSelected.emit({
            source: { id: 'title' } as _MatAutocompleteBase,
            option: this.autoTriggerTitle.activeOption as _MatOptionBase,
          } as MatAutocompleteSelectedEvent);

          this.autoTriggerName.writeValue(this.autoTriggerTitle.activeOption?.value);
        }),
      
    );
  }

  onSelection(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;// as User;
    
    // if autocomplete option is an object THIS IS Needed ///this.autoTrigger.writeValue(value.title); // this writes down to input ( trigger ) the value to be shown
    if (event.source.id === 'title') { this.autoTriggerTitle.writeValue(value);}
    if (event.source.id === 'name')  { this.autoTriggerName.writeValue(value); }
    
    console.log('onSelection post avtions returns with', [this.autoTriggerName, this.autoTriggerTitle]);
  }

  displayNameWith(option: User): string {
    return option?.name || 'NAME';
  }
  displayTitleWith(option: User): string {
    return option?.title || '';
  }


  private _filter(value: string, filterField: string='name'): User[] {      
    const filtered =  this.options.filter((option) => {
      return (<any>option)[filterField]
        .toLowerCase()
        .includes(value.toLowerCase())
    });

    console.log(`filter fn: '${value}' sent in: filtered out`, filtered);

    if (filtered.length === 0) {
      const adding = this.createUnknownObject(value, filterField, true);  
      if (adding as User){ filtered.unshift(adding); }
    }
    
    return filtered;
  }
  private createUnknownObject(value: string, filterField: string, resetId: boolean = false): User {
    // const locVar = <any>this.currentObject || {} as T;

    // if (locVar.id === -1 || resetId) {
    //   locVar.id = -1;
    //   locVar[this.filterField]= value;
    // }

    //return locVar;
    return filterField === 'name' ? new User(resetId ? -1: -1, value, '') : new User(resetId ? -1: -1, '', value);
  }
}

