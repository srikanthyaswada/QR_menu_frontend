import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QrmenuService } from '../qrmenu.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'], // FIXED
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class UserComponent implements OnInit {
  activeEventType: any[] = [];
  menuItems: any[] = [];
  groupedItems: { [key: string]: any[] } = {};
  selectedCategories: any[] = [];
  isModalOpen = false;
  customer = { name: '', mobile: '', members: '', eventType: '', venue: '' };
  qrImage!: string;
  a_id: any;
  userId!: string;

  constructor(
    private api: QrmenuService,
    private toastr: ToastrService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const adminData = localStorage.getItem('a');
    if (adminData) {
      const eventObj = JSON.parse(adminData);
      this.userId = eventObj._id;
      console.log('userId:', this.userId);
    }
    //  this.a_id= adminData._id;
    this.qrImage = this.api.getQRImage();
    const storedGrouped = localStorage.getItem('groupedItems');
    if (storedGrouped) {
      this.groupedItems = JSON.parse(storedGrouped);
      Object.keys(this.groupedItems).forEach((cat) => {
        this.groupedItems[cat].forEach((item: any) => {
          if (item.selected === undefined) item.selected = false;
        });
      });
    } else {
   
    }
    this.getMenuItems(); 
    this.getEventTypes();
  }

  getEventTypes() {
    this.api.getEventTypes().subscribe({
      next: (res: any) => {
        this.activeEventType = res.data;
        localStorage.setItem('event', JSON.stringify(res.data));
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading event types:', err),
    });
  }

  getMenuItems() {
    this.api.getMenuItems().subscribe(
      (res: any) => {
        const items = res.data.filter((item: any) => item.status === 'active');
        items.forEach((item: { selected: boolean }) => (item.selected = false));
        this.menuItems = items;
        console.log(this.menuItems);
        const grouped: any = {};
        items.forEach((item: { categoryId: { name: string } }) => {
          const cat = item.categoryId?.name || 'Uncategorized';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        });
        this.groupedItems = grouped;
        console.log(this.groupedItems);
        localStorage.setItem('groupedItems', JSON.stringify(this.groupedItems));
        this.cd.detectChanges();
      },
      (err) => console.error('Error fetching menu items:', err),
    );
  }
  
  sendOrder() {
    this.selectedCategories = [];

    Object.keys(this.groupedItems).forEach((categoryName) => {
      const selectedItems = this.groupedItems[categoryName].filter((i) => i.selected);
      if (selectedItems.length > 0) {
        this.selectedCategories.push({ name: categoryName, items: selectedItems });
      }
    });

    if (this.selectedCategories.length === 0) {
      this.toastr.warning('Please select at least one item', 'Validation');
      return;
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  submitOrder() {
    if (
      !this.customer.name ||
      !this.customer.mobile ||
      !this.customer.eventType ||
      !this.customer.venue
    ) {
      this.toastr.warning('Please fill all customer details', 'Validation');
      return;
    }

    if (this.selectedCategories.length === 0) {
      this.toastr.warning('Please select at least one item', 'Validation');
      return;
    }

    const itemsPayload = this.selectedCategories.flatMap((cat) =>
      cat.items.map((item: any) => ({ categoryName: cat.name, menuId: item._id, quantity: 1 })),
    );

    const payload = {
      name: this.customer.name,
      mobile: this.customer.mobile,
      members: this.customer.members,
      eventType: this.customer.eventType,
      venue: this.customer.venue,
      items: itemsPayload,
      admin_id: this.userId,
    };

    this.api.createOrder(payload).subscribe({
      next: () => {
        this.toastr.success('Order placed successfully!');
        this.cd.detectChanges();
        this.resetOrder();
        this.isModalOpen = false;
      },
      error: (err) => {
        console.error('Order error:', err);
        this.toastr.error('Failed to place order.', 'Error');
      },
    });
  }

  resetOrder() {
    this.selectedCategories = [];
    this.customer = { name: '', mobile: '', members: '', eventType: '', venue: '' };
    Object.keys(this.groupedItems).forEach((cat) =>
      this.groupedItems[cat].forEach((item) => (item.selected = false)),
    );
    localStorage.setItem('groupedItems', JSON.stringify(this.groupedItems));
  }
}
