import { Component, OnInit } from '@angular/core';

import { Language } from "angular-l10n";

import { ConfigService } from '../core/services/config.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @Language() lang: string;

  sidebarItems: Array<any> = [];

  constructor(private configService: ConfigService) { }

  ngOnInit() {
    this.configService.load().then(() => {
      this.sidebarItems = this.configService.getConfig("sidebarItems", []);
    });
  }

}
