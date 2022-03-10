import { Directive } from '@angular/core';
import { User } from '../../models/user';
import { TplAutocompleteComponent } from '../tpl-autocomplete.component';

@Directive({
  selector: '[appUsers]',
})
export class UsersDirective {
  options: User[] = [
    new User(1, 'One', 'un'),
    new User(2, 'Two', 'deux'),
    new User(3, 'Three', 'trois'),
  ];

  constructor(private host: TplAutocompleteComponent<User>) {
    this.host._filter = (value: string): User[] => {
      return this.options.filter((option) =>
        (<any>option)[this.host.filterField]
          .toLowerCase()
          .includes(value.toLowerCase())
      );
    };
  }
}
