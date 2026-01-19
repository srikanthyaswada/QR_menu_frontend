import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QrmenuService {
 
   baseUrl = 'http://localhost:3008/api';
  

  constructor(private http:HttpClient ) {}
 
  
    AdminLogin(data: any) {
    return this.http.post(`${this.baseUrl}/admin/login`, data);
  }
    getAll() {
    return this.http.get(`${this.baseUrl}/categories/get`);
  }

  create(data: any) {
    return this.http.post(`${this.baseUrl}/categories/add`, data);
  }

update(data: any) {
  return this.http.put(
    `${this.baseUrl}/categories/update/${data.id}`, data
  );
}

  delete(id: string) {
  return this.http.delete(
    `${this.baseUrl}/categories/delete/${id}`
  );
}

// menu
   getmenu() {
    return this.http.get(`${this.baseUrl}/menus/get`);
  }

  menucreate(data: any) {
    return this.http.post(`${this.baseUrl}/menus/add`, data);
  }

menuupdate(data: any) {
  return this.http.put(
    `${this.baseUrl}/menus/update/${data.id}`, data
  );
}

  menudelete(id: string) {
  return this.http.delete(
    `${this.baseUrl}/menus/delete/${id}`
  );
}
getCategories() {
  return this.http.get(`${this.baseUrl}/categories/get`);
}


 getQRImage() {
    return `${this.baseUrl}/qr/generate-qr`;
  }

  
   createOrder(payload: any) {
    return this.http.post(`${this.baseUrl}/orders/add`, payload);
  }
   getMenuItems() {
    return this.http.get(`${this.baseUrl}/menus/get`);
  }
  
}
