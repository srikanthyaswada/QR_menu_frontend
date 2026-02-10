import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { QrmenuService } from '../qrmenu.service';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.scss',
})
export class QrComponent implements OnInit {

  qrImage: string | null = null;
  loading = true;

  constructor(
    private api: QrmenuService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadQR();
  }

  loadQR() {
    this.loading = true;

    this.api.generateQR().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.qrImage = res.qrImage;
        }
        this.loading = false;

        // 🔥 Force Angular to update view immediately
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }
}
