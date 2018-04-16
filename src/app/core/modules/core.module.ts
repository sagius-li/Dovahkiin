import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { DataService } from '../services/data.service';
import { ConfigService } from '../services/config.service';
import { StartupService } from '../services/startup.service';

// tslint:disable-next-line:no-shadowed-variable
export function startup(startup: StartupService) {
  return () => startup.load();
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations: [
  ],
  providers: [
    DataService,
    ConfigService,
    StartupService,
    {
      provide: APP_INITIALIZER,
      // useFactory: (startup: StartupService) => () => startup.load(),
      useFactory: startup,
      deps: [StartupService],
      multi: true
    }
  ]
})
export class CoreModule { }
