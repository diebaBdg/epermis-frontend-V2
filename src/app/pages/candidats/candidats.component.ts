import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidatService } from '../../services/candidat.service';
import { Candidat } from '../../models/candidat.model';

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidats.component.html',
  styleUrls: ['./candidats.component.css']
})
export class CandidatsComponent implements OnInit {
  candidats: Candidat[] = [];
  filteredCandidats: Candidat[] = [];
  searchQuery = '';
  loading = false;

  constructor(private candidatService: CandidatService) {}

  ngOnInit(): void {
    this.loadCandidats();
  }

  loadCandidats(): void {
    this.loading = true;
    this.candidatService.getCandidats().subscribe({
      next: (candidats) => {
        this.candidats = candidats;
        this.filteredCandidats = candidats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading candidats:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCandidats = this.candidats;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredCandidats = this.candidats.filter(candidat =>
        candidat.nom.toLowerCase().includes(query) ||
        candidat.prenom.toLowerCase().includes(query) ||
        candidat.numeroDossier.toLowerCase().includes(query)
      );
    }
  }
}
