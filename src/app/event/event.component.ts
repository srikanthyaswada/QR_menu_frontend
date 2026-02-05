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
    this.EventForm = this.fb.group({
      eventType_name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z]+(?: [A-Za-z]+)*$/),
        ],
      ],
    });

    this.getEvent();
  }
  getEvent() {
    this.api.getAllEvenet().subscribe({
      next: (res: any) => {
        console.log('API RESPONSE ', res);
        this.event = res.data;

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('API ERROR ', err);
      },
    });
  }

  addCategory() {
    if (this.EventForm.invalid) return;

    this.api.create(this.EventForm.value).subscribe({
      next: () => {
        this.EventForm.reset();
        this.getEvent();
        this.toastr.success('Event registered successfully!', 'Success');
      },
      error: (err) => {
        console.error('Error creating Evnet Type:', err);
        this.toastr.error('Failed to register Event Type. Please try again.', 'Error');
      },
    });
  }
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
    });
  }

  updateEvent() {
    if (this.EventForm.invalid) {
      this.EventForm.markAllAsTouched();

      this.toastr.error('Please fix the errors in the form', 'Validation Error');
      return;
    }

    const eventType_name = this.EventForm.value.eventType_name;

    if (this.isEdit && this.editEventId) {
      // UPDATE
      const payload = {
        id: this.editEventId,
        eventType_name,
      };

      this.api.updateEvent(payload).subscribe({
        next: () => {
          this.toastr.success('Category updated successfully!', 'Success');
          this.afterSubmit();
        },
        error: () => {
          this.toastr.error('Update failed', 'Error');
        },
      });
    } else {
      // ADD
      this.api.createEvent({ eventType_name }).subscribe({
        next: () => {
          this.toastr.success('Category added to the top successfully!', 'Success');
          this.afterSubmit();
        },
        error: () => {
          this.toastr.error('Add failed', 'Error');
        },
      });
    }
  }

  afterSubmit() {
    this.EventForm.reset();
    this.isEdit = false;
    this.editEventId = null;
    this.getEvent();
  }
  deleteEvent(id: string) {
    this.api.deleteEvent(id).subscribe({
      next: () => {
        this.getEvent();
        this.toastr.success('Deleted successfully!', 'Success');
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
        this.toastr.success('Deleted successfully!', 'Success');
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
}
