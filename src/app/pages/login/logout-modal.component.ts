import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2>Confirmer la déconnexion</h2>
          <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="onCancel()">Annuler</button>
          <button class="btn-confirm" (click)="onConfirm()">Se déconnecter</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 32px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .modal-header svg {
      margin-bottom: 16px;
    }

    .modal-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: #1E293B;
      margin: 0 0 8px 0;
    }

    .modal-header p {
      font-size: 14px;
      color: #64748B;
      margin: 0;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn-cancel,
    .btn-confirm {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-cancel {
      background: #F1F5F9;
      color: #475569;
    }

    .btn-cancel:hover {
      background: #E2E8F0;
    }

    .btn-confirm {
      background: #DC2626;
      color: white;
    }

    .btn-confirm:hover {
      background: #B91C1C;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    .btn-confirm:active {
      transform: translateY(0);
    }
  `]
})
export class LogoutModalComponent {
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}