import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InspecteurService } from '../../services/inspecteur.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-inspecteurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspecteurs.component.html',
  styleUrls: ['./inspecteurs.component.css']
})
export class InspecteursComponent implements OnInit {
  inspecteurs: User[] = [];
  filteredInspecteurs: User[] = [];
  searchQuery = '';
  loading = false;

  constructor(private inspecteurService: InspecteurService) {}

  ngOnInit(): void {
    this.loadInspecteurs();
  }

  loadInspecteurs(): void {
    this.loading = true;
    this.inspecteurService.getInspecteurs().subscribe({
      next: (inspecteurs) => {
        this.inspecteurs = inspecteurs;
        this.filteredInspecteurs = inspecteurs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading inspecteurs:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredInspecteurs = this.inspecteurs;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredInspecteurs = this.inspecteurs.filter(inspecteur =>
        inspecteur.nom.toLowerCase().includes(query) ||
        inspecteur.prenom.toLowerCase().includes(query) ||
        inspecteur.matricule.toLowerCase().includes(query)
      );
    }
  }

  getInitials(inspecteur: User): string {
    return (inspecteur.prenom[0] + inspecteur.nom[0]).toUpperCase();
  }
}
