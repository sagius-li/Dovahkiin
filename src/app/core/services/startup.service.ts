import { Injectable } from '@angular/core';

// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs/Rx';
import { DataService } from './data.service';
import { ConfigService } from './config.service';
import { LocaleService } from 'angular-l10n';

@Injectable()
export class StartupService {

    constructor(
        private config: ConfigService,
        private dataService: DataService,
        private locale: LocaleService) { }

    public loaded = false;

    public load() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.config.load().then(() => {
                    this.dataService.load().then(() => {
                        this.dataService.getLanguage().then((result: string) => {
                            for (const elem of this.config.getConfig('supportedLanguages', [])) {
                                if (elem.code.indexOf(result) >= 0) {
                                    this.locale.setCurrentLanguage(elem.route);
                                    break;
                                }
                            }
                            resolve(true);
                        });
                    });
                });
            }, 200);
        });
    }

}
