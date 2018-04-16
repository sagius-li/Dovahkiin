import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Rx';

@Injectable()
export class ConfigService {

    constructor(private http: HttpClient) { }

    private pathPrefix = "assets";
    private pathEnv = `${this.pathPrefix}/env.json`;

    private env: object = null;
    private config: object = null;

    public loaded: boolean = false;

    public load() {
        return new Promise((resolve, reject) => {
            this.http.get(this.pathEnv)
                .catch((error: any): any => {
                    console.log(this.pathEnv + " cannot be loaded");
                    resolve(true);
                    return Observable.throw(error.message);
                })
                .subscribe((envResponse) => {
                    this.env = envResponse;

                    const pathConfig: string = `${this.pathPrefix}/config.${this.env['env']}.json`;

                    this.http.get(pathConfig)
                        .catch((error: any): any => {
                            console.log(pathConfig + " cannot be loaded");
                            resolve(error);
                            return Observable.throw(error.message);
                        })
                        .subscribe((data) => {
                            this.config = data;
                            this.loaded = true;
                            resolve(true);
                        });
                });
        });
    }

    public getEnv(key: any, fallback?: any) {
        if (this.env[key]) {
            return this.env[key];
        }
        else {
            return fallback ? fallback : undefined;
        }
    }

    public getConfig(key: any, fallback?: any) {
        if (this.config[key]) {
            return this.config[key];
        }
        else {
            return fallback ? fallback : undefined;
        }
    }
}
