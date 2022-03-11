import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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


  ngOnInit() {
    this.form.get('user')?.setValue({ name: this.currentUser.name, title: this.currentUser.title });
  }
}

/**  Copyright 2022 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at https://angular.io/license */
