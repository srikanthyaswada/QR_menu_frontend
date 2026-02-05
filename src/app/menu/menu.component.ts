import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { QrmenuService } from '../qrmenu.service';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-menu',
  standalone:true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
  categories: any[] = [];
  menuForm!: FormGroup;
  selectedCategoryId: any = null;
  selectedId: any = null;
  editCategoryForm!: FormGroup;
  activeCategoryType: any[] = [];
  toastMessage: string | null = null;
  toastType: string | undefined;
  title: any;

  isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: QrmenuService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.menuForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z]+(?: [A-Za-z]+)*$/),
        ],
      ],
      categoryId: ['', Validators.required],
    });
    this.getmenu();
    this.loadCategories();
  }
  getmenu() {
    this.api.getmenu().subscribe({
      next: (res: any) => {
         console.log('API RESPONSE ', res);
        this.categories = res.data;
        
      },
      error: (err) => console.error(err),
    });
  }

  openAddModal() {
    this.selectedCategoryId = null;
    this.menuForm.reset();
  }

  edit(category: any) {
    this.selectedId = category._id;
    this.isEdit = true;
    this.menuForm.patchValue({
      name: category.name,
      categoryId: category.categoryId._id,
    });
  }

  // saveCategory() {
  //   if (this.menuForm.invalid) {
  //     console.log('FORM INVALID', this.menuForm.value);
  //     return;
  //   }

  //   if (this.selectedId) {
  //     this.api
  //       .menuupdate({
  //         id: this.selectedId,
  //         ...this.menuForm.value,
  //       })
  //       .subscribe(() => {
  //         this.getmenu();
  //         this.resetForm();
  //       });
  //   } else {
  //     this.api.menucreate(this.menuForm.value).subscribe(() => {
  //       this.getmenu();
  //       this.resetForm();
  //       window.location.reload();
  //     });
  //   }
  // }
  saveCategory() {
    if (this.menuForm.invalid) {
      console.log('FORM INVALID', this.menuForm.value);
      this.menuForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields', 'Error');
      return;
    }

    if (this.selectedId) {
      this.api
        .menuupdate({
          id: this.selectedId,
          ...this.menuForm.value,
        })
        .subscribe({
          next: (res: any) => {
            const index = this.categories.findIndex((item) => item._id === this.selectedId);

            if (index !== -1) {
              const selectedCategory = this.activeCategoryType.find(
                (c) => c._id === res.data.categoryId,
              );

              this.categories[index] = {
                ...res.data,
                categoryId: selectedCategory,
              };

              this.categories = [...this.categories];
            }

            this.resetForm();
            this.toastr.success('Menu item updated successfully!', 'Success');
          },
          error: () => {
            this.toastr.error('Failed to update menu item', 'Error');
          },
        });
    } else {
      this.api.menucreate(this.menuForm.value).subscribe({
        next: (res: any) => {
          const selectedCategory = this.activeCategoryType.find(
            (c) => c._id === res.data.categoryId,
          );

          const newItem = {
            ...res.data,
            categoryId: selectedCategory,
          };
          3;
          this.categories = [newItem, ...this.categories];

          // this.categories = [res.data, ...this.categories];
          // this.getmenu();
          this.resetForm();
          this.toastr.success('Menu added to the top successfully!', 'Success');
        },
        error: () => {
          this.toastr.error('Failed to add menu item', 'Error');
        },
      });
    }
  }

  afterSubmit() {
    this.menuForm.reset();
    this.isEdit = false;
    this.getmenu();
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (res: any) => {
       this.activeCategoryType = res.data.filter(
        (c: any) => c.status === 'active'
      );
      },
      error: (err) => console.error(err),
    });
  }

  deleteCategory(id: string) {
    this.api.menudelete(id).subscribe({
      next: () => {
        this.getmenu();

        this.toastr.success('Menu item deleted successfully!', 'Success');
      },
      error: (err) => {
        console.error('Error deleting menu item:', err);
        this.toastr.error('Failed to delete menu item. Please try again.', 'Error');
      },
    });
  }

  resetForm() {
    this.menuForm.reset();
    this.selectedId = null;
  }

  // createOrUpdateCategory() {
  //     if (this.categoryForm.invalid) return;

  //     if (this.selectedCategoryId) {
  //       // UPDATE
  //       this.selectedCategoryId.name = this.categoryForm.value.name;
  //       this.selectedCategoryId.price = this.categoryForm.value.price;
  //       this.selectedCategoryId.categoryId = this.categoryForm.value.categoryId;
  //       this.selectedCategoryId.isAvailable = this.categoryForm.value.isAvailable;
  //       this.selectedCategoryId.createdAt = this.categoryForm.value.createdAt;
  //       alert('Category updated successfully!');
  //     } else {
  //       // CREATE
  //       this.categories.push(this.categoryForm.value);
  //       alert('Category added successfully!');
  //     }

  //     this.categoryForm.reset();
  //     this.selectedCategoryId = null;

  //   const modal: any = document.getElementById('CategoryModal');
  // const modalInstance = (window as any).bootstrap.Modal.getInstance(modal);
  // modalInstance.hide();
  //   }

  openDeleteModal(category: any) {
    this.selectedId = category;
  }

  confirmDelete() {
    if (!this.selectedId) return;

    this.api.menudelete(this.selectedId._id).subscribe({
      next: () => {
        this.categories = this.categories.filter((item) => item._id !== this.selectedId._id);

        this.selectedId = null;
        this.toastr.success('Menu item deleted successfully!', 'Success');
      },
      error: () => {
        this.toastr.error('Failed to delete menu item', 'Error');
      },
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

    this.menuForm.get('name')?.setValue(value, { emitEvent: false });
  }
}
