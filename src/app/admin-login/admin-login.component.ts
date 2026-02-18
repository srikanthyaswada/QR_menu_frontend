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
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z]+(?: [A-Za-z]+)*$/),
        ],
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(6), Validators.pattern(/^\d{1,6}$/)],
      ],
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
        if (res) {
          localStorage.setItem('a', JSON.stringify(res.data));
          localStorage.setItem('admin_token', res.token);
        }
        sessionStorage.setItem('AdminName', this.AdminForm.value.username);

        sessionStorage.setItem('toastMessage', 'Super Admin Login Success');
        sessionStorage.setItem('toastType', 'success');
        this.toastr.success('Admin Login Success');

        this.router.navigate(['/dashboard'], {
          state: { toast: 'User login success' },
          // this.router.navigate(['/dashboard']);
        });
      },

      error: (err: any) => {
        console.error('admin login failed', err);

        if (err.status === 403) {
          this.toastr.warning('Your account is inactive. Please contact system admin.');
        } else if (err.status === 401) {
          this.toastr.warning('Invalid email or password.');
        } else if (err.status === 500) {
          this.toastr.warning('Server error! Please try again later.');
        } else {
          this.toastr.warning('Login failed. Please try again.');
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
  onUsernameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    let value = input.value;

    value = value.replace(/[^A-Za-z ]/g, '');

    value = value.replace(/\s+/g, ' ');

    value = value.replace(/^\s/, '');

    value = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    this.AdminForm.get('username')?.setValue(value, { emitEvent: false });
  }
  onPasswordInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    let value = input.value.replace(/\D/g, '');

    if (value.length > 6) {
      value = value.substring(0, 6);
    }

    this.AdminForm.get('password')?.setValue(value, { emitEvent: false });
  }
}
