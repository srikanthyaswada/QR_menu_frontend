import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { QrmenuService } from '../qrmenu.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  showScanner = true;
  showMenu = false;
  menuItems: any[] = [];
  groupedItems: any = {};
  selectedCategories: any[] = [];
  isModalOpen = false;
  selectedItems: any[] = [];
  totalPrice = 0;

  customer = {
    name: '',
    mobile: '',
  };

  qrImage!: string;
  categories: any;

  constructor(
    private api: QrmenuService,
    private toastr: ToastrService,
  ) {}
  ngOnInit(): void {
    this.qrImage = this.api.getQRImage();
    // this.loadMenus();
    // this.showMenu = true;
    this.getMenuItems();
  }
  scanQR() {
    this.showMenu = true;
  }

  getMenuItems() {
    this.api.getMenuItems().subscribe(
      (res: any) => {
        const items = res.data;
        console.log('items', items);

        this.groupedItems = items.reduce((acc: any, item: any) => {
          const categoryName = item.categoryId?.name;

          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }

          acc[categoryName].push(item);
          return acc;
        }, {});
      },
      (err) => {
        console.error('Error fetching menu items:', err);
      },
    );
  }

  //   getMenuItems() {
  //   this.api.getMenuItems().subscribe(
  //     (res: any) => {
  //       console.log('Menu items fetched:', res);
  //       this.menuItems = res.data;
  //     },
  //     (err) => {
  //       console.error('Error fetching menu items:', err);
  //     }
  //   );
  // }
  isSelected(item: any): boolean {
    return this.selectedItems.some((i) => i._id === item._id);
  }

  selectCategory(item: any) {
    console.log('Selected item:', item);
  }
  //  sendOrder() {
  //   this.selectedCategories = this.menuItems.filter(
  //     (item: any) => item.selected
  //   );

  //   if (this.selectedCategories.length === 0) {
  //     alert('Please select at least one item');
  //     return;
  //   }

  //   this.isModalOpen = true;
  // }
  sendOrder() {
    this.selectedCategories = [];

    Object.values(this.groupedItems).forEach((items: any) => {
      items.forEach((item: any) => {
        if (item.selected) {
          this.selectedCategories.push(item);
        }
      });
    });

    if (this.selectedCategories.length === 0) {
      this.toastr.warning('Please select at least one item', 'Validation');
      return;
    }

    this.isModalOpen = true;
  }

  // loadMenus() {
  //   this.api.getMenus().subscribe((data: any[]) => {
  //     this.groupedMenus = {
  //       Veg: [],
  //       'Non-Veg': [],
  //       Drinks: [],
  //       Sweets: [],
  //     };

  //     data.forEach((m) => {
  //       const cat = m.categoryId?.name;

  //       if (this.groupedMenus[cat]) {
  //         this.groupedMenus[cat].push(m);
  //       }
  //     });

  //     console.log('Grouped Menus:', this.groupedMenus);
  //   });
  // }

  // submitOrder() {
  //   if (!this.customer.name || !this.customer.mobile) {
  //     alert('Please enter customer details');
  //     return;
  //   }

  //   const validItems = this.selectedItems.filter((i) => i.quantity > 0);

  //   if (validItems.length === 0) {
  //     alert('Please select items & quantity');
  //     return;
  //   }

  //   const payload = {
  //     name: this.customer.name,
  //     mobile: this.customer.mobile,
  //     items: validItems.map((i) => ({
  //       menuId: i.menuId,
  //       quantity: i.quantity,
  //     })),
  //     totalPrice: this.totalPrice,
  //   };

  //   this.api.createOrder(payload).subscribe({
  //     next: () => {
  //       alert('Order placed successfully!\nWhatsApp sent to restaurant');
  //       this.reset();
  //     },
  //     error: () => {
  //       alert(' Order failed. Try again');
  //     },
  //   });
  // }
  // reset() {
  //   this.selectedItems = [];
  //   this.totalPrice = 0;
  //   this.customer = { name: '', mobile: '' };
  // }
  // selectedCategory: string = 'Veg';

  //
  //  selectCategory(cat: any) {
  //     const exists = this.selectedCategories.find(c => c.categoryId === cat.categoryId);
  //     if (!exists) {
  //       this.selectedCategories.push(cat);
  //     }
  //   }
  openModal() {
    if (this.selectedCategories.length === 0) {
      alert('Select at least one category');
      return;
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  submitOrder() {
    if (!this.customer.name || !this.customer.mobile) {
      this.toastr.warning('Please enter customer details', 'Validation');
      return;
    }

    if (this.selectedCategories.length === 0) {
      this.toastr.warning('Please select at least one item', 'Validation');
      return;
    }

    const itemsPayload = this.selectedCategories.map((item) => ({
      menuId: item._id,
      quantity: 1,
    }));

    const payload = {
      name: this.customer.name,
      mobile: this.customer.mobile,
      items: itemsPayload,
    };

    console.log('ORDER PAYLOAD:', payload);

    this.api.createOrder(payload).subscribe({
      next: (res) => {
        this.toastr.success('Order placed successfully! WhatsApp sent to restaurant.', 'Success');
        this.resetOrder();
        this.isModalOpen = false;
      },
      error: (err) => {
        console.error('Order error:', err);
        this.toastr.error('Failed to place order. Check backend payload format.', 'Error');
      },
    });
  }

  resetOrder() {
    this.selectedCategories = [];
    this.menuItems.forEach((item) => (item.selected = false));
    this.customer = { name: '', mobile: '' };
  }
}
