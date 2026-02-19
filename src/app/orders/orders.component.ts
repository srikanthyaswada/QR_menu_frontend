import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { QrmenuService } from '../qrmenu.service';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  orderId!: string;
  orders: any[] = [];
  loading = false;
  expandedOrders: { [key: number]: boolean } = {};

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private api: QrmenuService,
    private cd: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    const orderData = localStorage.getItem('a');
    if (orderData) {
      const orderObj = JSON.parse(orderData);
      this.orderId = orderObj._id;
      console.log('orderId', this.orderId);
    }
    this.Orders();
  }
  Orders() {
    this.loading = true;
    this.api.getOrders().subscribe({
      next: (res: any) => {
        this.orders = res.data;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching orders', err);
        this.loading = false;
      },
    });
  }
  toggleViewMore(index: number) {
    this.expandedOrders[index] = !this.expandedOrders[index];
  }
  getVisibleItems(order: any, index: number) {
    if (!order?.items) return [];

    return this.expandedOrders[index] ? order.items : order.items.slice(0, 5);
  }
}
