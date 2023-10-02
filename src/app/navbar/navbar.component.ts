import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { User } from '../model/User';
import { Router } from '@angular/router';
import { RouteChangeService } from '../route-change.service';
import { DataService } from '../data.service';
import { NgbTooltipModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  visible: boolean;
  user: User | undefined = new User();

  @Output() connected = new EventEmitter<User>();
  @Output() openProfile = new EventEmitter<User>();
  @Output() disconnected = new EventEmitter<User>();

  @Output() openBorrows = new EventEmitter<User>();

  //---------------------------------
  // Function to display every book in the database
  //---------------------------------
  constructor(private offcanvasService: NgbOffcanvas, private router: Router, private routeChangeService: RouteChangeService, private dataService: DataService) {
    this.visible = this.router.url !== "/";
  }

  ngOnInit() {
    this.routeChangeService.routeChange$.subscribe(() => {
      this.updateVisibility();
    });
    
    this.updateVisibility();
  }
  
  private updateVisibility() {
    if (this.dataService.getUser() != undefined) {
      this.user = this.dataService.getUser();
      console.log(this.user)
      if (this.router.url !== "/" && this.dataService.getUser()?.roles === '["ROLE_USER"]') {
        this,this.visible = true;
      } else {
        this,this.visible = false;
      }
    } else {
      this.router.navigate([""]);
    }
  }

  //---------------------------------
  // Function to disconnect a user
  //---------------------------------
  disconnect() {
    this.offcanvasService.dismiss();
    this.dataService.disconnectUser();
    this.visible = false;
    this.router.navigate([""]);
  }

  //---------------------------------
  // Function to expand the navbar
  //---------------------------------
  openOffcanvas(content: any) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  //
  // Function to open the borrows section
  borrows()
  {
    
    this.openBorrows.emit(this.user);
  }
}