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
  isEdit = false;
  editCategoryId: string | null = null;
  selectedFilter: string = 'All';
  category = {
    id: null,
    name: '',
  };
  adminId!: string;
  toastMessage: string | null = null;
  toastType: string | undefined;
  filterMode: 'active' | 'inactive' | 'all' = 'all';
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
  const adminData = localStorage.getItem('a');

  if (adminData) {
    const adminid = JSON.parse(adminData);
    this.adminId = adminid._id; 
     console.log('adminId:', this.adminId);
  }
    this.categoryForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z]+(?: [A-Za-z]+)*$/),
        ],
      ],
      status: ['active'],
      admin_id: [this.adminId]
    });

    this.getCategories();
  }
  getCategories() {
    this.api.getAll().subscribe({
      next: (res: any) => {
        console.log('API RESPONSE ', res);

             this.categories = [...res.data];
             
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('API ERROR ', err);
      },
    });
  }
  get filteredCategories() {
    if (this.filterMode === 'active') {
      return this.categories.filter((c) => c.status === 'active');
    }

    if (this.filterMode === 'inactive') {
      return this.categories.filter((c) => c.status === 'inactive');
    }

    return this.categories; 
  }

//  addCategory() {
//   if (this.categoryForm.invalid) return;

//   if (!this.adminId) {
//     this.toastr.error('Admin ID missing');
//     return;
//   }

//   const payload = {
//     ...this.categoryForm.value,
//     admin_id: this.adminId  
//   };

//   console.log('ADD CATEGORY PAYLOAD ', payload);

//   this.api.create(payload).subscribe({
//     next: () => {
//       this.categoryForm.reset({ status: 'active' });
//       this.getCategories();
//       this.toastr.success('Category registered successfully!');
//     },
//     error: (err) => {
//       console.error('Error creating category:', err);
//       this.toastr.error('Failed to register category.');
//     },
//   });
// }


  showToast(message: string, type: string = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => (this.toastMessage = null), 1000);
  }
  openAddModal() {
    this.isEdit = false;
    this.category = { id: null, name: '' };
  }

  // openEditModal(cat: any) {
  //   this.selectedId = cat._id;
  //   this.categoryForm.patchValue({
  //     name: cat.name,
  //   });
  // }
  editCategory(cat: any) {
    this.isEdit = true;
    this.editCategoryId = cat._id;

    this.categoryForm.patchValue({
      name: cat.name,
      status: cat.status,
      admin_id: this.adminId,
    });
  }

  updateCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();

      this.toastr.error('Please fix the errors in the form');
      return;
    }
    const { name, status } = this.categoryForm.value;

    if (this.isEdit && this.editCategoryId) {
      // UPDATE
      const payload = {
        id: this.editCategoryId,
        name,
        status,
        admin_id: this.adminId,
      };

      this.api.update(payload).subscribe({
        next: () => {
          this.toastr.success('Category updated successfully!');
          this.afterSubmit();
        },
        error: () => {
          this.toastr.error('Update failed');
        },
      });
    } 
 else {
  const payload = {
    name,
    status: this.categoryForm.value.status,
    admin_id: this.adminId, 
  };

  console.log('ADD CATEGORY PAYLOAD', payload);

  this.api.create(payload).subscribe({
    next: (res: any) => {
      this.toastr.success('Category added successfully!');
      this.afterSubmit();
    },
    error: (err) => {
      console.error('Add category error:', err);
      this.toastr.error('Add failed');
    },
  });
}

  }
afterSubmit() {
  this.categoryForm.reset({
    name: '',
    status: 'active',
    admin_id: this.adminId  
  });

  this.isEdit = false;
  this.editCategoryId = null;
  this.getCategories();
   
}


  deleteCategory(cat: any) {
    if (!cat?._id) {
      console.error('ID is missing');
      return;
    }

    this.api.delete(cat._id).subscribe({
      next: () => {
        this.toastr.success('Category moved to Inactive!', 'Success');
        this.getCategories();
      },
      error: (err) => {
        console.error('Error deleting category:', err);
        this.toastr.error('Failed to delete category.', 'Error');
      },
    });
  }

  confirmDelete() {
    this.api.delete(this.selectedId._id).subscribe(() => {
      this.getCategories();
      this.selectedId = null;
    });
  }
  onCategoryInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    let value = input.value;

    value = value.replace(/[^A-Za-z ]/g, '');

    value = value.replace(/\s+/g, ' ');

    value = value.replace(/^\s/, '');

    value = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    this.categoryForm.get('name')?.setValue(value, { emitEvent: false });
  }
  changeFilter(value: string) {
    this.selectedFilter = value;

    switch (value) {
      case 'All':
        this.showall();
        break;
      case 'Active':
        this.showActive();
        break;
      case 'Inactive':
        this.showInactive();
        break;
    }
  }
  showActive() {
    this.filterMode = 'active';
  }

  showInactive() {
    this.filterMode = 'inactive';
  }
  showall() {
    this.filterMode = 'all';
  }
}
