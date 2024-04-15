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

  
}
  
