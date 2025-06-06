import { Component } from '@angular/core';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout.component';  

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardLayoutComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'building-id-fn';
}
