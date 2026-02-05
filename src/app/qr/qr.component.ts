import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QrmenuService } from '../qrmenu.service';


@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.scss'
})
export class QrComponent implements OnInit {
menuUrl: string = window.location.origin + '/user';
  showMenu = false;
qrImage!: string;
  qrId!: string;

 
constructor(private api:QrmenuService){}
  ngOnInit(): void {
    
    // this.menuUrl = window.location.origin + '/user';
this.api.generateQR().subscribe(res => {
      this.qrImage = res.image;
      this.api.assignUrl(res.qrId, 'http://localhost:4200/user')
      .subscribe() ;
});
  }

  // scanQR() {
  //   this.showMenu = true;
  // }
  // generate() {
  //   this.api.generateQR().subscribe(res => {
  //     this.qrImage = res.image;
  //     this.qrId = res.qrId;
  //   });
  // }

  // assign() {
  //   this.api.assignUrl(this.qrId, 'http://localhost:4200/user')
  //     .subscribe(() => alert('URL Assigned'));
  // }
}
