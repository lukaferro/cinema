import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  name = '';
  email = '';
  message = '';
  submitted = false;
  sending = false;

  onSubmit(): void {
    if (!this.name || !this.email || !this.message) return;
    this.sending = true;
    setTimeout(() => {
      this.submitted = true;
      this.sending = false;
    }, 1000);
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.message = '';
    this.submitted = false;
  }
}
