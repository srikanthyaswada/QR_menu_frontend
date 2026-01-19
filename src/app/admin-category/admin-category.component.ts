import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { QrmenuService } from '../qrmenu.service';

@Component({
  selector: 'app-admin-category',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './admin-category.component.html',
  styleUrl: './admin-category.component.scss',
})
export class AdminCategoryComponent implements OnInit {
  edit(_t29: any) {
    throw new Error('Method not implemented.');
  }
  categories: any[] = [];
  categoryForm!: FormGroup;
  newCategory: any = { name: '' };
  selectedCategory: any = {};
  category = {
    id: null,
    name: '',
  };

  isEdit = false;
  selectedCategoryId: any;
  selectedId: any;
  constructor(private router: Router, private fb: FormBuilder, private api: QrmenuService, private cd: ChangeDetectorRef) {}

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

    this.api.create(this.categoryForm.value).subscribe(() => {
      this.categoryForm.reset();
      this.getCategories();
      window.location.reload();
    });
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
    if (!confirm('Delete this category?')) return;

    this.api.delete(id).subscribe({
      next: () => {
        console.log('Deleted successfully');
        this.getCategories();
        window.location.reload();
      },
      error: (err) => console.error(err),
    });
  }
}
