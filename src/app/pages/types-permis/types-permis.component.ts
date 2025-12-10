import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypePermisService } from '../../services/type-permis.service';
import { TypePermis } from '../../models/type-permis.model';

@Component({
  selector: 'app-types-permis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './types-permis.component.html',
  styleUrls: ['./types-permis.component.css']
})
export class TypesPermisComponent implements OnInit {
  typesPermis: TypePermis[] = [];
  loading = false;

  constructor(private typePermisService: TypePermisService) {}

  ngOnInit(): void {
    this.loadTypesPermis();
  }

  loadTypesPermis(): void {
    this.loading = true;
    this.typePermisService.getTypesPermis().subscribe({
      next: (types) => {
        this.typesPermis = types;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading types permis:', err);
        this.loading = false;
      }
    });
  }
}
