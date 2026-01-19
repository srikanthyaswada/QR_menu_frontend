import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [ReactiveFormsModule,CommonModule,FormsModule, RouterOutlet, RouterLink, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {

toastMessage: string | null = null;
  toastType: 'success' | 'error' | 'warning' = 'success';

constructor(private router: Router){}
  ngOnInit(): void {
   
  
  }
   logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
