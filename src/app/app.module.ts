import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule, MatInputModule } from '@angular/material';
import { DragulaService, DragulaModule } from 'ng2-dragula/ng2-dragula';

import { CoreModule } from './core/modules/core.module';
import { LocalizationModule } from './core/modules/localization.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatInputModule,
    DragulaModule,

    CoreModule,
    LocalizationModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
