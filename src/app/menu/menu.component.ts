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
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
  categories: any[] = [];
  activeCategoryType: any[] = [];
  menus: any[] = [];
  menuForm!: FormGroup;
  selectedItemId: string | null = null;
  selectedItem: any = null;
  menuId!: string;
  filterMode: 'active' | 'inactive' | 'all' = 'active';
  selectedFilter = 'Status';
  isEdit = false;
  filteredItems: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: QrmenuService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const eventData = localStorage.getItem('a');

    if (eventData) {
      const eventObj = JSON.parse(eventData);
      this.menuId = eventObj._id;
      console.log('menuId:', this.menuId);
    }
    this.loadCategories();

    this.initializeForm();
    this.getMenu();
  }

  initializeForm() {
    const storedMenu = localStorage.getItem('categories');

    if (storedMenu) {
      this.menus = JSON.parse(storedMenu);
    }
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
      status: ['active'],
      admin_id: [this.menuId],
    });
  }

  getMenu() {
    this.api.getmenu().subscribe({
      next: (res: any) => {
        this.categories = [...res.data];
        localStorage.setItem('menu', JSON.stringify(res.data));
        this.cd.detectChanges();
      },
    });
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (res: any) => {
        this.activeCategoryType = res.data.filter((c: any) => c.status === 'active');
        // localStorage.setItem('categories', JSON.stringify(res.data));
        this.cd.detectChanges();
      },
    });
  }

  saveCategory() {
    if (this.menuForm.invalid) {
      this.menuForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields');
      return;
    }
    const payload = this.menuForm.value;
    if (this.selectedItemId) {
      this.updateMenu(payload);
    } else {
      this.createMenu(payload);
    }
  }

  createMenu(payload: any) {
    this.api.menucreate(payload).subscribe({
      next: (res: any) => {
        const selectedCategory = this.activeCategoryType.find((c) => c._id === res.data.categoryId);

        const newItem = {
          ...res.data,
          categoryId: selectedCategory,
          admin_id: this.menuId,
        };

        this.categories = [newItem, ...this.categories];
        this.loadCategories();
        this.afterSubmit();
        this.toastr.success('Menu added successfully!');
      },
      error: () => {
        this.toastr.error('Failed to add menu item');
      },
    });
  }

  updateMenu(payload: any) {
    this.api
      .menuupdate({
        id: this.selectedItemId,
        admin_id: this.menuId,
        ...payload,
      })
      .subscribe({
        next: (res: any) => {
          const index = this.categories.findIndex((item) => item._id === this.selectedItemId);

          if (index !== -1) {
            const selectedCategory = this.activeCategoryType.find(
              (c) => c._id === res.data.categoryId,
            );

            this.categories[index] = {
              ...res.data,
              categoryId: selectedCategory,
              admin_id: this.menuId,
            };

            this.categories = [...this.categories];
          }
          this.getMenu();
          this.afterSubmit();
          this.toastr.success('Menu updated successfully!');
        },
        error: () => {
          this.toastr.error('Failed to update menu item');
        },
      });
  }

  afterSubmit() {
    this.resetForm();
  }

  resetForm() {
    this.menuForm.reset({
      name: '',
      categoryId: '',
      status: 'active',
      admin_id: this.menuId,
    });

    this.selectedItemId = null;
    this.selectedItem = null;
    this.isEdit = false;
  }

  edit(item: any) {
    this.selectedItemId = item._id;
    this.isEdit = true;

    this.menuForm.patchValue({
      name: item.name,
      categoryId: item.categoryId?._id,
      status: item.status,
      admin_id: item.menuId,
    });
  }

  openDeleteModal(item: any) {
    this.selectedItem = item;
  }

  confirmDelete() {
    if (!this.selectedItem) return;

    this.api.menudelete(this.selectedItem._id).subscribe({
      next: () => {
        this.getMenu();
        this.closeModal();
        this.selectedItem = null;
        this.toastr.success('Menu moved to inactive');
      },
      error: () => {
        this.toastr.error('Failed to update status');
      },
    });
  }

  closeModal() {
    const modalElement = document.getElementById('deleteModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
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

  onCategoryInput(event: Event) {
    const input = event.target as HTMLInputElement;

    let value = input.value;

    value = value.replace(/[^A-Za-z ]/g, '');
    value = value.replace(/\s+/g, ' ');
    value = value.replace(/^\s/, '');
    value = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    this.menuForm.get('name')?.setValue(value, { emitEvent: false });
  }

  trackById(index: number, item: any) {
    return item._id;
  }
}
