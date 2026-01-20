import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { QrmenuService } from '../qrmenu.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-category',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './admin-category.component.html',
  styleUrl: './admin-category.component.scss',
})
export class AdminCategoryComponent implements OnInit {
  categories: any[] = [];
  categoryForm!: FormGroup;
  newCategory: any = { name: '' };
  selectedCategory: any = {};
  category = {
    id: null,
    name: '',
  };
  toastMessage: string | null = null;
  toastType: string | undefined;
  isEdit = false;
  selectedCategoryId: any;
  selectedId: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private api: QrmenuService,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.getCategories();
  }
  getCategories() {
    this.api.getAll().subscribe({
      next: (res: any) => {
        console.log('API RESPONSE ', res);
        this.categories = res.data;

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('API ERROR ', err);
      },
    });
  }

  addCategory() {
    if (this.categoryForm.invalid) return;

    this.api.create(this.categoryForm.value).subscribe({
      next: () => {
        this.categoryForm.reset();
        this.getCategories();
        this.toastr.success('Category registered successfully!', 'Success');
      },
      error: (err) => {
        console.error('Error creating category:', err);
        this.toastr.error('Failed to register category. Please try again.', 'Error');
      },
    });
  }

  showToast(message: string, type: string = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => (this.toastMessage = null), 1000);
  }
  openAddModal() {
    this.isEdit = false;
    this.category = { id: null, name: '' };
  }

  openEditModal(cat: any) {
    this.selectedId = cat._id;
    this.categoryForm.patchValue({
      name: cat.name,
    });
  }

  updateCategory() {
    if (this.categoryForm.invalid) return;

    const payload = {
      id: this.selectedId,
      name: this.categoryForm.value.name,
    };

    this.api.update(payload).subscribe(() => {
      this.getCategories();
      window.location.reload();
    });
  }

  deleteCategory(id: string) {
    this.api.delete(id).subscribe({
      next: () => {
        this.getCategories();
        this.toastr.success('Category deleted successfully!', 'Success');
      },
      error: (err) => {
        console.error('Error deleting category:', err);
        this.toastr.error('Failed to delete category. Please try again.', 'Error');
      },
    });
  }
  confirmDelete() {
    this.api.delete(this.selectedId._id).subscribe(() => {
      this.getCategories();
      this.selectedId = null;
    });
  }
}
