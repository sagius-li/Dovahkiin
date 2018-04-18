import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private router: Router, private rt: ActivatedRoute) { }

  ngOnInit() {
    let pathName: string = window.location.pathname;
    if (pathName !== '/') {
      this.router.navigate([''], { queryParams: { path: pathName } });
    }
  }
}
