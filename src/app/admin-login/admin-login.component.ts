import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { QrmenuService } from '../qrmenu.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-login',
  imports: [RouterOutlet, ReactiveFormsModule, CommonModule, FormsModule, RouterLinkWithHref],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent implements OnInit {
  showPassword: any;

  AdminForm!: FormGroup;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | 'warning' = 'success';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: QrmenuService,
    private toastr: ToastrService,
  ) {}
  ngOnInit(): void {
    this.AdminForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }
  adminLogin() {
    if (this.AdminForm.invalid) {
      this.showToast('Please enter valid credentials', 'warning');
      this.AdminForm.markAllAsTouched();
      return;
    }

    this.api.AdminLogin(this.AdminForm.value).subscribe({
      next: (res: any) => {
        console.log(res, 'Admin Login Success');
        // if (res) {
        //   localStorage.setItem('a', JSON.stringify(res.data));
        //   localStorage.setItem('admin_token', res.token);
        // }

        sessionStorage.setItem('toastMessage', 'Super Admin Login Success');
        sessionStorage.setItem('toastType', 'success');

        this.router.navigate(['/dashboard']);
      },

      error: (err: any) => {
        console.error(' admin login failed', err);

        if (err.status === 403) {
          this.showToast('Your account is inactive. Please contact system admin.', 'warning');
        } else if (err.status === 401) {
          this.showToast('Invalid email or password.', 'warning');
        } else if (err.status === 500) {
          this.showToast('Server error! Please try again later.', 'warning');
        } else {
          this.showToast('Login failed. Please try again.', 'warning');
        }
      },
    });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => (this.toastMessage = null), 1500);
  }
}
