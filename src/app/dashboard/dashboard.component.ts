import { Component, OnInit } from '@angular/core';

import { DragulaService } from 'ng2-dragula';

import { ConfigService } from '../core/services/config.service';
import { DataService } from '../core/services/data.service';
import { GPResource, RMType, GPRight, GPAttributeDef } from '../core/data.model';

import { Language, LocaleService, TranslationService } from 'angular-l10n';

import * as $ from 'jquery';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @Language() lang: string;

  languages = [];

  languageId = 'en';
  languageExample = '';
  title = '';
  users: Array<GPResource> = [];
  movedUsers: Array<GPResource> = [];

  constructor(
    private config: ConfigService,
    private dataService: DataService,
    private locale: LocaleService,
    private translation: TranslationService,
    private dragula: DragulaService) {

    this.dragula.setOptions('bag-people', {
      removeOnSpill: true
    });
    this.dragula.drop.subscribe(value => {
      console.log(value);
      value[1].style.backgroundColor = 'lightcoral';
    });
  }

  ngOnInit() {
    this.title = this.dataService.getVersion();
    this.languages = this.config.getConfig('supportedLanguages');
    this.languageId = this.locale.getCurrentLanguage();

    setTimeout(() => {
      this.languageExample = this.translation.translate('languageExample');
    }, this.config.getConfig('intervalT'));
  }

  onChangeLanguage(language: string) {
    this.locale.setCurrentLanguage(language);
    this.languageId = language;

    setTimeout(() => {
      this.languageExample = this.translation.translate('languageExample');
    }, this.config.getConfig('intervalT'));
  }

  onFetchUsers() {
    /// Get Resource
    this.dataService.getResourceByQuery('/Person[starts-with(DisplayName,\'%\')]',
      ['DisplayName', 'AccountName', 'Description', 'CreatedTime'], RMType.reader, false, 10, 10)
      .then((data: Array<GPResource>) => {
        this.users = data;
        console.log(data);
      }, (error) => {
        console.log(error);
      });

    /// Create & Delete Resource
    // let resource: GPResource = {
    //     DisplayName: 'Test User',
    //     ObjectType: 'Person',
    //     Attributes: {
    //         "FirstName": { Name: "FirstName", Value: "Test" },
    //         "LastName": { Name: "LastName", Value: "User" },
    //         "AccountName": { Name: "AccountName", Value: "testuser" }
    //     }
    // }
    // this.dataService.createResource(resource, RMType.user).then((data: string) => {
    //     if (data) {
    //         this.dataService.deleteResource(data, RMType.user).then(result => {
    //             console.log(result);
    //         }, e => {
    //             console.log(e);
    //         });
    //     }
    // }, err => {
    //     console.log(err);
    // });
  }

}
