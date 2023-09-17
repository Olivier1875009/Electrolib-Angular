import { Component } from '@angular/core';
import { User } from './model/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isConnected = false;
  user: User = new User();

  //---------------------------------
  // Function to connect a user
  //---------------------------------
  onConnect(user: User) {
    this.isConnected = true;
    this.user = user;
  }

  //---------------------------------
  // Function to disconnect the current user
  //---------------------------------
  onDisconnect(user: User) {
    this.isConnected = false;
    console.log('disconnect user: ' + user.email);
  }
}