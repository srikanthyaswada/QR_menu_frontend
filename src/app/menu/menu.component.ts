import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { QrmenuService } from '../qrmenu.service';
import bootstrap from '../../main.server';

@Component({
  selector: 'app-menu',
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

  title: any;

  constructor(private fb: FormBuilder, private router: Router, private api: QrmenuService) {}

  ngOnInit(): void {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      // isAvailable: ['', Validators.required],
      // createdAt: ['', Validators.required],
    });
    this.getmenu();
    this.loadCategories();
  }
  getmenu() {
    this.api.getmenu().subscribe({
      next: (res: any) => {
        console.log(res);
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

    this.menuForm.patchValue({
      name: category.name,
     categoryId: category.categoryId._id
    });
  }

  saveCategory() {
    if (this.menuForm.invalid) {
      console.log('FORM INVALID', this.menuForm.value);
      return;
    }

    if (this.selectedId) {
      this.api
        .menuupdate({
          id: this.selectedId,
          ...this.menuForm.value,
        })
        .subscribe(() => {
          this.getmenu();
          this.resetForm();
        });
    } else {
      this.api.menucreate(this.menuForm.value).subscribe(() => {
        this.getmenu();
        this.resetForm();
        window.location.reload();
      });
    }
  }
  loadCategories() {
    this.api.getCategories().subscribe({
      next: (res: any) => {
        this.activeCategoryType = res.data;
      },
      error: (err) => console.error(err),
    });
  }

  deleteCategory(id: string) {
    if (!confirm('Delete this item?')) return;

    this.api.menudelete(id).subscribe(() => {
      this.getmenu();
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
    this.api.menudelete(this.selectedId._id).subscribe(() => {
      this.getmenu();
      this.selectedId = null;
    });
  }
}
