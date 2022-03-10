import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialExampleModule } from '../material.module';
import { FormFieldCustomControlExample } from './form-field-custom-control-example';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';
import { MainComponent } from './main.component';
import { TelInputComponent } from './customs/tel-input/tel-input.component';
import { TplAutocompleteComponent } from './customs/tpl-autocomplete/tpl-autocomplete.component';

@NgModule({
  declarations: [
    FormFieldCustomControlExample,
    TelInputComponent,
    MainComponent,
    TplAutocompleteComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    MaterialExampleModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [MainComponent],
})
export class AppModule {}
