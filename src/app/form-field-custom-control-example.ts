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

  autoTriggerSubscriptions: Subscription[] = [];

  ngOnInit() {
    this.form.get('user')?.setValue({ name: this.currentUser , title: this.currentUser  });  // need this line first

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

 
}

