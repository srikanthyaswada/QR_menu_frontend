import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { QrmenuService } from '../qrmenu.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss',
})
export class ContactDetailsComponent implements OnInit {
  ContactForm!: FormGroup;
  contact: any[] = [];

  contactId!: string;
  isEdit = false;
  editContactId: string | null = null;

  selectedId: any;

  filterMode: 'active' | 'inactive' | 'all' = 'active';
  selectedFilter = 'Active';
  searchTerm: string = '';

  toastMessage: string | null = null;
  toastType: string | undefined;

  constructor(
    private fb: FormBuilder,
    private api: QrmenuService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const contactData = localStorage.getItem('a');
    if (contactData) {
      const contactObj = JSON.parse(contactData);
      this.contactId = contactObj._id;
    }

    this.ContactForm = this.fb.group({
      contact_name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z]+(?: [A-Za-z]+)*$/),
        ],
      ],
      designation: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z ]+$/),
        ],
      ],
      contact_number: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      status: ['active'],
      admin_id: [this.contactId],
    });

    this.cd.detectChanges();

    this.getContact();
  }

  getContact() {
    this.api.getAllContact().subscribe({
      next: (res: any) => {
        console.log('Get API Response:', res);

        // Safe data handling
        // this.contact = res?.data || res || [];
        this.contact = res.data;

        this.cd.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to load contacts');
      },
    });
  }

  get filteredContact() {
    let filtered = this.contact;
    if (this.filterMode === 'active') {
      filtered = filtered.filter((c) => (c.status || 'active').toLowerCase() === 'active');
    } else if (this.filterMode === 'inactive') {
      filtered = filtered.filter((c) => (c.status || '').toLowerCase() === 'inactive');
    }

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();

      filtered = filtered.filter(
        (c) =>
          c.contact_name?.toLowerCase().includes(term) ||
          c.designation?.toLowerCase().includes(term) ||
          c.contact_number?.toString().includes(term),
      );
    }

    return filtered;
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

  updateContact() {
    console.log('UPDATE API CALL');

    if (this.ContactForm.invalid) {
      this.ContactForm.markAllAsTouched();
      this.toastr.error('Please fix form errors');
      return;
    }

    const payload = {
      contact_name: this.ContactForm.value.contact_name,
      designation: this.ContactForm.value.designation,
      contact_number: this.ContactForm.value.contact_number,
      status: this.ContactForm.value.status,
      admin_id: this.contactId,
    };
    console.log('Payload:', payload);

    if (this.isEdit && this.editContactId) {
      this.api.updateContact(this.editContactId, payload).subscribe({
        next: (res: any) => {
          this.cd.detectChanges();

          this.toastr.success('Updated successfully');

          const index = this.contact.findIndex((c) => c._id === this.editContactId);
          if (index !== -1) {
            this.contact[index] = res.data;
          }
          console.log('All Contacts:', this.contact);

          this.afterSubmit();
        },
        error: () => {
          this.toastr.error('Update failed');
        },
      });
    } else {
      this.api.createContact(payload).subscribe({
        next: (res: any) => {
          this.cd.detectChanges();

          this.toastr.success('Added successfully');

          this.contact.push(res.data);
          this.getContact();
          this.afterSubmit();
        },
        error: () => {
          this.toastr.error('Add failed');
        },
      });
    }
  }

  editContact(contact: any) {
    this.isEdit = true;
    this.editContactId = contact._id;

    this.ContactForm.patchValue({
      contact_name: contact.contact_name,
      // designation: contact.designation,
      designation: contact.designation?.trim(),
      contact_number: contact.contact_number,
      status: contact.status,
    });
  }

  deleteContact(contact: any) {
    if (!contact?._id) return;

    this.api.deleteContactDetails(contact._id).subscribe({
      next: () => {
        this.cd.detectChanges();

        this.toastr.success('Contact moved inactive!');

        this.contact = this.contact.filter((c) => c._id !== contact._id);

        this.cd.detectChanges();
      },
      error: () => {
        this.toastr.error('Delete failed');
      },
    });
  }

  confirmDelete() {
    this.api.deleteContactDetails(this.selectedId._id).subscribe(() => {
      this.getContact();
      this.selectedId = null;
    });
  }

  afterSubmit() {
    this.ContactForm.reset({
      status: 'active',
      admin_id: this.contactId,
    });
    this.isEdit = false;
    this.editContactId = null;
  }

  onCategoryInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    let value = input.value;

    value = value.replace(/[^A-Za-z ]/g, '');
    value = value.replace(/\s+/g, ' ');
    value = value.replace(/^\s/, '');
    if (value !== value.toUpperCase()) {
      value = value.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    input.value = value;
  }
}
