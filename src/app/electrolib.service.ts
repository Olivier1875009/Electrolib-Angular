import { Injectable } from '@angular/core';
import { urlServer } from './util';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Book } from './model/Book';
import { User } from './model/User';
import { Genre } from './model/Genre';
import { Author } from './model/Author';
import { Borrow } from './model/Borrow';
import { Status } from './model/Status';

@Injectable({
  providedIn: 'root'
})
export class ElectrolibService {

  //--------------------------------
  // Initialize the component
  //--------------------------------
  constructor(private http: HttpClient) { }

  
  //--------------------------------
  // Route to get all the books
  //--------------------------------
  getBooks() {
    let url = urlServer + 'books';

    return this.http.get<Book[]>(url);
  }
  
  //--------------------------------
  //
  //--------------------------------
  getGenres() {
    let url = urlServer + 'genres';

    return this.http.get<Genre[]>(url);
  }

  //--------------------------------
  //
  //--------------------------------
  getAllStatus() {
    let url = urlServer + 'all-status';

    return this.http.get<Status[]>(url);
  }
  
  //--------------------------------
  // Route to get all the genre
  //--------------------------------
  getGenre(idGenre: number) {
    let url = urlServer + 'genre/' + idGenre;

    return this.http.get<Genre>(url);
  }
  
  //--------------------------------
  // Route to get all the genre
  //--------------------------------
  getAuthors() {
    let url = urlServer + 'authors';

    return this.http.get<Author[]>(url);
  }
  
  //--------------------------------
  // Route to get all the genre
  //--------------------------------
  getAuthor(idAuthor: number) {
    let url = urlServer + 'author/' + idAuthor;

    return this.http.get<Author>(url);
  }


  //--------------------------------
  // Route to get all the genre
  //--------------------------------
  getBorrows() {
    let url = urlServer + 'borrows';
    url = "http://127.0.0.1:8000/borrows";

    return this.http.get<Borrow[]>(url);
  }

  getBorrowsFromUser(user: User)
  {
    let idUser = user.idUser;
    let url = urlServer + 'borrows';
    url = "http://127.0.0.1:8000/borrows/" + idUser;

    return this.http.get<Borrow[]>(url);
  }

  getBorrowsOrderedBy(user: User, order:any)
  {
    let idUser = user.idUser;
    let url = urlServer + 'borrows';
    url = "http://127.0.0.1:8000/borrows/" + idUser + "/" + order;

    return this.http.get<Borrow[]>(url);
  }

  //--------------------------------
  // Route to connect a user
  //--------------------------------
  connection(user: User) {
    let url = urlServer + 'users/connection';
    
    const params = new HttpParams({
      fromObject: {
        memberNumber: user.memberNumber,
        password: user.password
      }
    });

    return this.http.post<User>(url, params);
  }
  
  //route qui va chercher un livre
  getBook(id:number){
    let url = urlServer + 'getBook/'+id;

    return this.http.get<Book>(url);
  }

  //--------------------------------
  // Créer un livre
  //--------------------------------
  /*createBook(book: Book) {
    let url = urlServer + "createBook";

    const params = new HttpParams({
      fromObject: {
        title: book.title,
        description: book.description,
        isbn: book.isbn,
        publishedDate: book.publishedDate,
        originalLanguage: book.originalLanguage,
        isBorrowed: book.isBorrowed,
        cover: book.cover,
        idAuthor: book.idAuthor,
        idGenre: book.idGenre
      }
    });

    return this.http.post<Book>(url, params);
  }*/

  uploadImage(imageData: string) {
    const formData = new FormData();
    formData.append('image', imageData);

    let url = urlServer + "createBook";

    return this.http.post(url, formData);
  }

  createBookWithImage(book: Book, imageData: Blob) {
    let url = urlServer + "createBook";

    // Create FormData to send both the book object and the image
    const formData = new FormData();
    formData.append('title', book.title);
    formData.append('description', book.description);
    formData.append('isbn', book.isbn);
    formData.append('publishedDate', book.publishedDate);
    formData.append('originalLanguage', book.originalLanguage);
    formData.append('cover', imageData); // Add the image data here
    formData.append('idAuthor', book.idAuthor.toString());
    formData.append('idGenre', book.idGenre.toString());
    formData.append('idStatus', book.idStatus.toString());

    return this.http.post<Book>(url, formData);
  }
}