import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Book } from '../model/Book';
import { ElectrolibService } from '../electrolib.service';
import { ISBN_REGEX, MAX_FILE_SIZE } from '../util';
import { Author } from '../model/Author';
import { Genre } from '../model/Genre';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-book',
  templateUrl: './create-book.component.html',
  styleUrls: ['./create-book.component.css']
})
export class CreateBookComponent {

  book: Book = new Book();
  authors: Author[] = [];
  genres: Genre[] = [];
  foundAuthors: Author[] = [];
  authorSearchField: string = "";
  selectedAuthor: string = "Fournir auteur";

  selectedImage: any;
  formData = new FormData();
  file: any;
  file_data: any = "";

  errors: { [key: string]: string | null } = {
    title: null,
    description: null,
    isbn: null,
    publishedDate: null,
    originalLanguage: null,
    cover: null,
    idAuthor: null,
    idGenre: null
  };

  newAuthor: Author = new Author();
  newGenre: Genre = new Genre();
  authorFirstName: string | null = null;
  authorLastName: string | null = null;
  genreName: string | null = null;
  colorSwitch: boolean = false;

  @Output() switchTheme = new EventEmitter<any>();

  constructor(private electrolibService: ElectrolibService, private router: Router, private dataService: DataService, private modalService: NgbModal) { }

  ngOnInit() {
    if (localStorage.getItem('theme') != 'light') {
      this.colorSwitch = true;
    } else {
      this.colorSwitch = false;
    }

    this.retrieveAuthors();
    this.retrieveGenres();

    const imageUrl = 'assets/images/default-book.png';

    this.createBlobFromLocalFile(imageUrl).then((blob) => {
      this.file_data = blob;
    });
  }

  async createBlobFromLocalFile(imageUrl: string): Promise<Blob> {
    return fetch(imageUrl).then((response) => response.blob());
  }

  //---------------------------------
  // Function to change the theme for all the application
  //---------------------------------
  changeTheme() {
    if (this.colorSwitch) {
      localStorage.setItem('theme', 'dark');
      this.switchTheme.emit('dark');
    } else {
      localStorage.setItem('theme', 'light');
      this.switchTheme.emit('light');
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  retrieveAuthors() {
    this.electrolibService.getAuthors().subscribe(
      authors => {
        this.authors = authors;
      }
    );
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  retrieveGenres() {
    this.electrolibService.getGenres().subscribe(
      genres => {
        this.genres = genres;
      }
    );
  }

  //-------------------------------------------------------
  // Envoie les données du formulaire au serveur Symfony
  //-------------------------------------------------------
  onSubmit() {
    this.validateAllFields();
    if (this.validateForm()) {
      this.electrolibService.createBookWithImage(this.book, this.file_data).subscribe(
        (response) => {
          console.log('Book and image created successfully!', response);
          this.changeTab('inventory');
          this.router.navigate(["/adminInventory"]);
        },
        (error) => {
          console.error('Creation failed:', error);
        }
      );
    }
  }

  //-------------------------------------------------------
  // Téléversement d'une image
  //-------------------------------------------------------
  onFileSelected(event: any) {
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      this.selectedImage = fileList[0];

      if (this.validateFile()) {
        const blob = new Blob([this.selectedImage], { type: this.selectedImage.type });

        this.file_data = blob;
        this.errors["cover"] = null;
      }
    }
  }

  //-------------------------------------------------------
  // Retourne l'extension de l'image
  //-------------------------------------------------------
  extractExtension(nomFichier: string) {
    let extension = nomFichier.split('.').pop();
    console.log("l'extension du fichier est " + extension);
    return extension;
  }

  //-------------------------------------------------------
  // Valide l'image avant de l'envoyer en base de données
  //-------------------------------------------------------
  validateFile() {
    let fileSupported = false;
    if (this.selectedImage.size <= MAX_FILE_SIZE) {
      let extension = this.extractExtension(this.selectedImage.name);
      if (extension?.toLowerCase() == 'png' || extension?.toLowerCase() == 'jpg' || extension?.toLowerCase() == 'jpeg') {
        fileSupported = true;
      }
      else {
        this.errors["cover"] = "Extension de fichier non-supportée. Votre image doit petre de type PNG, JPG ou JPEG.";
      }
    }
    else {
      fileSupported = false;
      this.errors["cover"] = "Fichier trop volumineux. Maximum 500 kB et le fichier a " + (this.selectedImage.size / 1024).toFixed(0) + " kB";
    }

    return fileSupported;
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validateTitle() {
    if (this.book.title.length <= 0 || this.book.title.length > 100) {
      this.errors["title"] = "Le titre doit contenir entre 1 et 100 caractères.";
    } else {
      this.errors["title"] = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validateDescription() {
    if (this.book.description.length <= 0 || this.book.description.length > 2048) {
      this.errors["description"] = "La description doit contenir entre 1 et 2048 caractères.";
    } else {
      this.errors["description"] = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validateISBN() {
    if (!ISBN_REGEX.test(this.book.isbn)) {
      this.errors["isbn"] = `L'ISBN doit un nombre de 13 chiffres. Contient actuellement ${this.book.isbn.toString().length} chiffres.`;
    } else {
      this.errors["isbn"] = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validatePublishedDate() {
    if (this.book.publishedDate.length <= 0) {
      this.errors["publishedDate"] = "Vous devez fournir une date de publication.";
    } else {
      this.errors["publishedDate"] = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validateOriginalLanguage() {
    if (this.book.originalLanguage.length <= 0 || this.book.originalLanguage.length > 255) {
      this.errors["originalLanguage"] = "La langue doit contenir entre 1 et 255 caractères.";
    } else {
      this.errors["originalLanguage"] = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validateIdAuthor() {
    if (!this.book.idAuthor) {
      this.errors["idAuthor"] = "Vous devez fournir un auteur.";
    } else {
      this.errors["idAuthor"] = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validateIdGenre() {
    if (!this.book.idGenre) {
      this.errors["idGenre"] = "Vous devez fournir un genre.";
    } else {
      this.errors["idGenre"] = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validateCreateAuthorFirstName() {
    if (this.newAuthor.firstName.length <= 0 || this.newAuthor.firstName.length > 50) {
      this.authorFirstName = "Le prénom doit contenir entre 1 et 50 caractères.";
    } else {
      this.authorFirstName = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validateCreateAuthorLastName() {
    if (this.newAuthor.lastName.length <= 0 || this.newAuthor.lastName.length > 50) {
      this.authorLastName = "Le nom doit contenir entre 1 et 50 caractères.";
    } else {
      this.authorLastName = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  validateCreateGenre() {
    if (this.newGenre.name.length <= 0 || this.newGenre.name.length > 30) {
      this.genreName = "Le nom du genre doit contenir entre 1 et 30 caractères.";
    } else {
      this.genreName = null;
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  isNewAuthorValid() {
    this.validateCreateAuthorFirstName();
    this.validateCreateAuthorLastName();

    return this.authorFirstName === null && this.authorLastName === null;
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  isNewGenreValid() {
    this.validateCreateGenre();
    return this.genreName === null;
  }

  //-------------------------------------------------------
  // Valide tous les champs du livre
  //-------------------------------------------------------
  validateAllFields() {
    this.validateTitle();
    this.validateDescription();
    this.validateISBN();
    this.validatePublishedDate();
    this.validateOriginalLanguage();
    this.validateIdAuthor();
    this.validateIdGenre();
  }

  //-------------------------------------------------------
  // Valide le formulaire du livre
  //-------------------------------------------------------
  validateForm() {
    for (const key in this.errors) {
      if (this.errors.hasOwnProperty(key) && this.errors[key] !== null) {
        return false;
      }
    }
    return true;
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  changeTab(tab: string) {
    this.dataService.changeTab(tab);
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  openModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg', animation: true });
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  onCreateAuthorSubmit() {
    if (this.isNewAuthorValid()) {
      this.electrolibService.createAuthor(this.newAuthor).subscribe(
        (response) => {
          this.authors.push(response);
          this.book.idAuthor = response.idAuthor;
          this.selectedAuthor = `${response.firstName} ${response.lastName}`;
          this.newAuthor = new Author();
        },
        (error) => {
          console.error('Creation failed:', error);
        }
      );
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  onCreateGenreSubmit() {
    if (this.isNewGenreValid()) {
      this.electrolibService.createGenre(this.newGenre).subscribe(
        (response) => {
          this.genres.push(response);
          this.book.idGenre = response.idGenre;
        },
        (error) => {
          console.error('Creation failed:', error);
        }
      );
    }
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  selectAuthor(author: Author) {
    this.authorSearchField = "";
    this.foundAuthors = [];
    this.book.idAuthor = author.idAuthor;
    this.selectedAuthor = `${author.firstName} ${author.lastName}`;
    this.validateIdAuthor();
  }

  //-------------------------------------------------------
  //
  //-------------------------------------------------------
  searchAuthors() {
    this.foundAuthors = [];
    if (this.authorSearchField.length > 0) {
      this.authors.forEach(author => {
        if (author.firstName.toUpperCase().includes(this.authorSearchField.toUpperCase()) ||
          author.lastName.toUpperCase().includes(this.authorSearchField.toUpperCase())) {
          this.foundAuthors.push(author);
        }
      });
    }
  }
}
