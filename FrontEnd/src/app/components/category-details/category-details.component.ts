import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiRequestService } from 'src/app/services/api/api-request.service';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent {
  categoryId!: number;
  categoryDetails : any = {};

  constructor(private route: ActivatedRoute, private categoryService: ApiRequestService,) {}

  getCategoryIdFromRoute(): void {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id']; // Obtener el id del empleado de la ruta
      console.log(this.categoryId)
    });
  }


 getCategoryDetails(): void {
  this.categoryService.getCategoryDetails(this.categoryId)
    .subscribe(
      (category: any) => {
        this.categoryDetails = category;
        console.log(category)
         // Verifica los detalles del empleado en la consola
      },
      (error: any) => {
        console.error('Error al obtener detalles de la categoria:', error);
      }
    );
}
  
}
