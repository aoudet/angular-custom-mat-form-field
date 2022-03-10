import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MyTel } from './customs/models/my-tel';

/** @title Form field with custom telephone number input control. */
@Component({
  selector: 'form-field-custom-control-example',
  templateUrl: 'form-field-custom-control-example.html',
})
export class FormFieldCustomControlExample {
  form: FormGroup = new FormGroup({
    tel: new FormControl(new MyTel('', '', '')),
    name: new FormControl(''),
    title: new FormControl(''),
  });
}

/**  Copyright 2022 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at https://angular.io/license */
