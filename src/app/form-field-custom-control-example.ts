import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { EMPTY, map, Observable, startWith } from 'rxjs';
import { MyTel } from './customs/models/my-tel';
import { User } from './customs/models/user';

/** @title Form field with custom telephone number input control. */
@Component({
  selector: 'form-field-custom-control-example',
  templateUrl: 'form-field-custom-control-example.html',
})
export class FormFieldCustomControlExample  implements OnInit {
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

  @ViewChild('autoInputTitle', { read: MatAutocompleteTrigger, static: false })
  autoTriggerTitle: MatAutocompleteTrigger;
  @ViewChild('autoInputName', { read: MatAutocompleteTrigger, static: false })
  autoTriggerName: MatAutocompleteTrigger;

  ngOnInit() {
    this.form.get('user')?.setValue({ name: this.currentUser.name, title: this.currentUser.title });  // need this line first
    
    this.filteredNameOptions$ = (this.form.get('user.name') || {} as AbstractControl).valueChanges
    .pipe(
      startWith(this.form.get('user.name')?.value || ''),    // works BC setValue is called before...
      map((value: string | User): string => (typeof value === 'string' ? value : (<any>value)['name']) || '' ),
      map((value) => this._filter(value))
    );

    this.filteredTitleOptions$ = (this.form.get('user.title') || {} as AbstractControl).valueChanges
    .pipe(
      startWith(this.form.get('user.title')?.value || ''),    // works BC setValue is called before...
      map((value: string | User): string => (typeof value === 'string' ? value : (<any>value)['title']) || '' ),
      map((value) => this._filter(value, 'title'))
    );
  }

  onSelection(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value as User;
    // if autocomplete option is an object THIS IS Needed ///this.autoTrigger.writeValue(value.title); // this writes down to input ( trigger) the value to be shown
    this.autoTriggerTitle.writeValue(value);
  }

  private _filter(value: string, filterField: string='name'): User[] {      
    const filtered =  this.options.filter((option) => {
      return (<any>option)[filterField]
        .toLowerCase()
        .includes(value.toLowerCase())
    });

    console.log(`filter fn: '${value}' sent in: filtered out`, filtered);

    if (filtered.length === 0) {
      const adding = this.createUnknownObject(value, true);  
      if (adding as User){ filtered.unshift(adding); }
    }
    
    return filtered;
  }
  private createUnknownObject(value: string, resetId: boolean = false): User {
    // const locVar = <any>this.currentObject || {} as T;

    // if (locVar.id === -1 || resetId) {
    //   locVar.id = -1;
    //   locVar[this.filterField]= value;
    // }

    //return locVar;
    return new User(-1, '', value);
  }
}

