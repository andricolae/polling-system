import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import{FormsModule, NgForm} from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [FormsModule,CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  email = '';
  password = '';

  login(){
    
  }

}
