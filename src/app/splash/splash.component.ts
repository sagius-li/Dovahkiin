import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { StartupService } from "../core/services/startup.service";

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit, OnDestroy {
  sub: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private startup: StartupService) { }

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      let path = params['path'];
      if (path) {
        this.startup.load().then(() => {
          this.router.navigate([path]);
        });
      }
      else {
        this.startup.load().then(() => {
          this.router.navigate(['/app']);
        });
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe;
  }

}
