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

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss',
})
export class EventComponent implements OnInit {
  EventForm!: FormGroup;
  toastMessage: string | null = null;
  toastType: string | undefined;
  event: any[] = [];
  isEdit = false;
  editEventId: string | null = null;
  selectedId: any;
  filterMode: 'active' | 'inactive' | 'all' = 'active';
  selectedFilter = 'Status';
  eventId!: string;
  // isSubmitting = false;

  // event = {
  //   id: null,
  //   eventType_name: '',
  // };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private api: QrmenuService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    const eventData = localStorage.getItem('a');

    if (eventData) {
      const eventObj = JSON.parse(eventData);
      this.eventId = eventObj._id;
      console.log('eventId:', this.eventId);
    }

    this.EventForm = this.fb.group({
      eventType_name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z]+(?: [A-Za-z]+)*$/),
        ],
      ],
      status: ['active'],
      admin_id: [this.eventId],
    });

    this.getEvent();
  }
  getEvent() {
    this.api.getAllEvenet().subscribe({
      next: (res: any) => {
        console.log('API RESPONSE ', res);
        this.event = res.data;
        localStorage.setItem('event', JSON.stringify(res.data));
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('API ERROR ', err);
      },
    });
  }

  // addCategory() {
  //   if (this.EventForm.invalid || this.isSubmitting) return;

  //   this.isSubmitting = true;
  //   const payload = { ...this.EventForm.value };

  //   this.api.create(payload).subscribe({
  //     next: () => {
  //       this.isSubmitting = false;
  //       this.afterSubmit();
  //       this.toastr.success('Event registered successfully!');
  //     },
  //     error: () => {
  //       this.isSubmitting = false;
  //       this.toastr.error('Failed to register Event Type. Please try again.');
  //     }
  //   });
  // }
  showToast(message: string, type: string = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => (this.toastMessage = null), 1000);
  }
  // openAddModal() {
  //   this.isEdit = false;
  //   this.event = { id: null, eventType_name: '' };
  // }

  editEvent(event: any) {
    this.isEdit = true;
    this.editEventId = event._id;

    this.EventForm.patchValue({
      eventType_name: event.eventType_name,
      status: event.status,
      admin_id: this.eventId,
    });
  }

  updateEvent() {
    if (this.EventForm.invalid) {
      this.EventForm.markAllAsTouched();
      this.toastr.error('Please fix the errors in the form');
      return;
    }

    if (this.isEdit && this.editEventId) {
      const payload = {
        id: this.editEventId,
        eventType_name: this.EventForm.value.eventType_name,
        status: this.EventForm.value.status,
        admin_id: this.eventId,
      };

      console.log('Update Payload:', payload);

      this.api.updateEvent(payload).subscribe({
        next: () => {
          this.toastr.success('Event updated successfully!');
          this.afterSubmit();
        },
        error: () => {
          this.toastr.error('Update failed', 'Error');
        },
      });
    } else {
      this.api.createEvent(this.EventForm.value).subscribe({
        next: () => {
          this.toastr.success('Event added successfully!');
          this.afterSubmit();
        },
        error: () => {
          this.toastr.error('Add failed', 'Error');
        },
      });
    }
  }

  get filteredEvents() {
    if (this.filterMode === 'active') {
      return this.event.filter((c) => c.status === 'active');
    }

    if (this.filterMode === 'inactive') {
      return this.event.filter((c) => c.status === 'inactive');
    }

    return this.event;
  }

  afterSubmit() {
    this.EventForm.reset({
      status: 'active',
      admin_id: this.eventId,
    });
    this.isEdit = false;
    this.editEventId = null;
    this.getEvent();
  }

  deleteEvent(id: string) {
    this.api.deleteEvent(id).subscribe({
      next: () => {
        this.getEvent();
        this.toastr.success('Deleted successfully!');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Delete failed', 'Error');
      },
    });
  }

  confirmDelete() {
    if (!this.selectedId?._id) return;

    this.api.deleteEvent(this.selectedId._id).subscribe({
      next: () => {
        this.getEvent();
        this.selectedId = null;
        this.toastr.success('Deleted successfully!');
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.toastr.error('Failed to delete.', 'Error');
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

    this.EventForm.get('eventType_name')?.setValue(value, { emitEvent: false });
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
