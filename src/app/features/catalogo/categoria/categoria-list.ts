import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CategoriaService } from './categoria-service';
import { Categoria } from './categoria.model';

@Component({
  selector: 'app-categoria-list',
  imports: [RouterLink],
  templateUrl: './categoria-list.html',
})
export class CategoriaList implements OnInit {
  private readonly categoriaService = inject(CategoriaService);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.categoriaService.listar().subscribe({
      next: (data) => this.categorias.set(data),
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar categorías:', err);
        let msg = 'No se pudo cargar la lista de categorías.';
        if (err.status === 0) {
          msg = 'No se puede conectar al backend en http://localhost:8080. Asegúrate de que esté ejecutándose.';
        } else if (err.error?.message) {
          msg = `Error (${err.status}): ${err.error.message}`;
        }
        this.error.set(msg);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  eliminar(id: number): void {
    if (!confirm(`¿Está seguro de eliminar la categoría ${id}?`)) {
      return;
    }

    this.categoriaService.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => {
        if (err.status === 500) {
          this.error.set('No se puede eliminar: la categoría tiene productos asociados.');
        } else {
          this.error.set('No se pudo eliminar la categoría.');
        }
      },
    });
  }
}
