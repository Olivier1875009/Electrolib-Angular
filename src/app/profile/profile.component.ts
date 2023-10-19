import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { User } from '../model/User';
import { ElectrolibService } from '../electrolib.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { ENCRYPTION_KEY, MAX_FILE_SIZE, getURLProfilePicture } from '../util';
import { ToastService } from '../toast.service';
import { EncryptionService } from '../encryption.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | undefined = new User();
  selectedImage: any;
  colorSwitch: boolean = false;
  url: string = '';

  //---------------------------------
  // Function to display every book in the database
  //---------------------------------
  constructor(private electrolibService: ElectrolibService, private modalService: NgbModal, private dataService: DataService, private router: Router, private toastService: ToastService, private Encryption: EncryptionService) { }

  //---------------------------------
  // Function to display every book in the database
  //---------------------------------
  ngOnInit() {
    if (this.dataService.getUser() != undefined) {
      this.user = this.dataService.getUser();
    }

    if (localStorage.getItem('theme') != 'light') {
      this.colorSwitch = true;
    } else {
      this.colorSwitch = false;
    }

    this.url = getURLProfilePicture(this.user?.idUser);
  }

  //---------------------------------
  // Function to open the page for a specific book
  //---------------------------------
  switchTheme() {
    if (this.colorSwitch) {
      localStorage.setItem('theme', 'dark')
    } else {
      localStorage.setItem('theme', 'light')
    }
  }

  //---------------------------------
  // Function to upload a new profile picture to the user
  //---------------------------------
  updateProfilePicture(idUser: number | undefined, pictureNumber: number) {
    this.electrolibService.updateProfilePicture(idUser, pictureNumber).subscribe(
      user => {
        this.toastService.show('Votre profil a été mis à jour.', {
          classname: 'bg-success',
        });
        this.url = 'assets/images/users/profilePictures/Picture' + pictureNumber + '.png';
      },
      (error) => {
        this.toastService.show('La mise à jour a échoué.', {
          classname: 'bg-danger',
        });
      }
    );
  }

  //---------------------------------
  // Open the modal to update the user password
  //---------------------------------
  openModal(content: any, size?: string) {
    this.modalService.open(content, {
      animation: true,
      centered: true,
      keyboard: true,
      size: 'lg'
    });
  }

  //---------------------------------
  // Function to upload a new profile picture
  //---------------------------------
  updatePassword(idUser: number | undefined, passwords: any) {
    if (this.user?.password === passwords.activePassword) {
      if (passwords.activePassword !== passwords.newPassword) {
        if (passwords.newPassword === passwords.confirmationPassword) {
          // * Encrypte the password
          // * De-comment this line to encrypte
          //let encrypted = this.Encryption.set(ENCRYPTION_KEY, passwords.newPassword);
   
          // * De-comment this line to encrypte and erase the next line
          //this.electrolibService.updateProfile('updatePassword', idUser, { newPassword: encrypted }).subscribe(
          this.electrolibService.updateProfile('updatePassword', idUser, passwords).subscribe(
            user => {
              this.toastService.show('Votre mot de passe a été mis à jour.', {
                classname: 'bg-success',
              });
              this.dataService.updatePassword(passwords.newPassword);
            },
            (error) => {
              this.toastService.show('La mise à jour a échoué.', {
                classname: 'bg-danger',
              });
            }
          );
        } else {
          this.toastService.show('Les nouveaux mot de passe ne correspondent pas.', {
            classname: 'bg-danger',
          });
        }
      } else {
        this.toastService.show('Le nouveau mot de passe doit être différent de celui que vous utiliser actuellement.', {
          classname: 'bg-danger',
        });
      }
    } else {
      this.toastService.show('Le mot de passe saisi ne correspond pas à votre mot de passe actuel.', {
        classname: 'bg-danger',
      });
    }
  }

  //---------------------------------
  // Function to close the profile
  //---------------------------------
  closeProfile(idUser: number | undefined, password: string) {
    if (this.user?.password === password) {
      this.electrolibService.updateProfile('deactivateAccount', idUser).subscribe(
        user => {
          this.toastService.show('Votre profil a été fermé.', {
            classname: 'bg-success',
          });
          setTimeout(() => { this.router.navigate([""]); }, 2000);
        },
        (error) => {
          this.toastService.show('La fermeture du compte a échoué.', {
            classname: 'bg-danger',
          });
        }
      );
    } else {
      this.toastService.show('Le mot de passe est incorrecte.', {
        classname: 'bg-danger',
      });
    }
  }

  //---------------------------------
  // Function to upload a new profile picture
  //---------------------------------
  formatPostalCode() {
    console.log('format postal code');

    // if (this.user.postalCode.length >= 3) {
    //   this.user.postalCode = this.user.postalCode.slice(0, 3) + ' ' + this.user.postalCode.slice(3);
    // }
  }

  //---------------------------------
  // Function to upload a new profile picture
  //---------------------------------
  formatPhoneNumber() {
    console.log('format phone number');

    // if(this.user.phoneNumber.length == 3) {
    //   this.user.phoneNumber = this.user.phoneNumber.slice(0, 3) + '-' + this.user.phoneNumber.slice(3);
    // }

    // if(this.user.phoneNumber.length == 7) {
    //   this.user.phoneNumber = this.user.phoneNumber.slice(3, 7) + '-' + this.user.phoneNumber.slice(7);
    // }
  }

  //---------------------------------
  // Function to upload a new profile picture
  //---------------------------------
  updateProfile(idUser: number | undefined, user: User) {
    if ((user.email.length != 0) && (user.firstName.length != 0) && (user.lastName.length != 0) && (user.address.length != 0) && (user.postalCode.length != 0) && (user.phoneNumber.length != 0)) {
      this.electrolibService.updateProfile('updateInformations', idUser, user).subscribe(
        user => {
          this.toastService.show('Votre profil a été mis à jour.', {
            classname: 'bg-success',
          });
        },
        (error) => {
          this.toastService.show('La mise à jour a échoué.', {
            classname: 'bg-success',
          });
        }
      );
    }
  }
}