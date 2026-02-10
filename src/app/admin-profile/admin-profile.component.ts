import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { QrmenuService } from '../qrmenu.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss',
})
export class AdminProfileComponent implements OnInit {
  toastMessage: string | null = null;
  toastType: string = '';
  profileForm!: FormGroup;
  isEditMode = false;
  selectedId: number | null = null;
  adminId: string | null = null;
  admins: any;
  isEdit: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private profileService: QrmenuService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const adminData = localStorage.getItem('a');
  console.log('LOCAL STORAGE DATA:', adminData);
    if (adminData) {
      const admin = JSON.parse(adminData);
      this.adminId = admin._id;
    }

    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    if (this.adminId) {
      this.getProfile();
    } else {
      console.error('Admin ID not found in localStorage');
    }
  }

  getProfile() {
    this.profileService.getProfile(this.adminId!).subscribe({
      next: (res: any) => {
        console.log('PROFILE RESPONSE:', res);


        const data = res.data || res;

        this.profileForm.patchValue({
          username: data.username,
          password: data.password,
        });
      },
      error: (err) => console.error('Error fetching profile:', err),
    });
  }

  enableEdit() {
    this.isEdit = true;
    this.profileForm.enable();
  }

  onUpdate() {
    if (this.profileForm.invalid || !this.adminId) return;

    this.profileService.updateProfile(this.adminId, this.profileForm.value).subscribe({
      next: (res: any) => {
        this.isEdit = false;
        this.profileForm.disable();
        this.toastr.success('Profile updated successfully!', 'Success');
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Failed to update profile', 'Error');
      },
    });
  }

  showToast(message: string) {
    this.toastMessage = message;

    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
  logout() {
    localStorage.removeItem('a');
    this.router.navigate(['/dashboard']);
    this.toastr.success('Logged out successfully!', 'Success');
  }
}
