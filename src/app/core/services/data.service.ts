import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Rx';

import { ConfigService } from './config.service';
import { RMType, GPResource, GPRight, GPAttributeDef } from '../data.model';
import * as moment from 'moment';

@Injectable()
export class DataService {

    constructor(private http: HttpClient, private configService: ConfigService) { }

    public serviceUrl: string = '';
    public adminGuid: string = '';
    public connection: string = undefined;
    public loginUserAttributes: string[] = [];
    public loginUser: GPResource = undefined;
    public loaded: boolean = false;

    private buildServiceMethodUrl(
        baseUrl: string, rmType: string, methodType: string, methodName: string): string {
        let partRMType = '';
        if (rmType) {
            partRMType = rmType + '/';
        }

        let partMethodType = '';
        if (partMethodType) {
            partMethodType = methodType + '/';
        }

        return `${baseUrl}${rmType}/${methodType}/${methodName}`;
    }

    public load() {
        this.serviceUrl = this.configService.getConfig('dataServiceUrl');
        this.adminGuid = this.configService.getConfig('portalAdminGuid');
        this.loginUserAttributes = this.configService.getConfig('loginUserAttributes');

        return new Promise((resolve, reject) => {
            let param: HttpParams = new HttpParams();
            this.loginUserAttributes.forEach((item) => {
                param = param.append('attributes', item);
            });

            this.http.get(`${this.serviceUrl}adminrm/get/currentuser`, {
                params: param,
                withCredentials: true
            }).catch((error: any): any => {
                return Observable.throw(error.message);
            }).subscribe((data: GPResource) => {
                this.loginUser = data;
                this.loaded = true;
                resolve(true);
            })
        });
    }

    public setService(userName: string, domain: string, password: string, serviceAddress?: string) {
        this.serviceUrl = serviceAddress ? serviceAddress : this.configService.getConfig('dataServiceUrl');
        this.adminGuid = this.configService.getConfig('portalAdminGuid');
        this.loginUserAttributes = this.configService.getConfig('loginUserAttributes');

        const connection = `user=${userName};domain=${domain};password=${password}`;
        const url = this.buildServiceMethodUrl(this.serviceUrl, RMType.admin.toString(), 'get', 'query');

        let param: HttpParams = new HttpParams().set('param', `/Person[AccountName='${userName}']`);
        param = param.append('connection', connection);
        this.loginUserAttributes.forEach((item) => {
            param = param.append('attributes', item);
        });

        return new Promise((resolve, reject) => {
            this.http.get(url, { params: param, withCredentials: true }).subscribe(
                (data: Array<GPResource>) => {
                    try {
                        this.loginUser = data[0];
                        this.connection = connection;

                        resolve(data[0]);
                    } catch (e) {
                        reject(e);
                    }
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    public getVersion(): string {
        return "V.1.0.0";
    }

    public getLanguage() {
        return new Promise((resolv, reject) => {
            const url = `${this.serviceUrl}generic/getlanguage`;
            this.http.get(url, { responseType: 'text' }).subscribe(
                (result: string) => {
                    resolv(result.replace(/"/gi, ''));
                },
                err => {
                    reject(err);
                }
            )
        });
    }

    public getRights(actorID: string, targetID: string) {
        const url = this.buildServiceMethodUrl(this.serviceUrl, RMType.reader.toString(), 'get', 'right');

        let param = new HttpParams().set('actor', actorID);
        param = param.append('target', targetID);

        return new Promise((resolve, reject) => {
            this.http.get(url, { params: param, withCredentials: true }).subscribe(
                (data: Array<GPRight>) => {
                    resolve(data);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    public getAttributeDef(typeName: string, localeKey: string = '127') {
        const url = this.buildServiceMethodUrl(this.serviceUrl, RMType.reader.toString(), 'get', 'attributedef');

        let param = new HttpParams().set('typeName', typeName);
        param = param.append('localeKey', localeKey);

        return new Promise((resolve, reject) => {
            this.http.get(url, { params: param, withCredentials: true }).subscribe(
                (data: GPAttributeDef) => {
                    resolve(data);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    public validateUser(userName: string, domain: string, password: string) {
        const connection = `user=${userName};domain=${domain};password=${password}`;
        const url = this.buildServiceMethodUrl(this.serviceUrl, RMType.named.toString(), '', 'validate');

        const param = new HttpParams().set('connection', connection);

        return new Promise((resolve, reject) => {
            this.http.get(url, { params: param, withCredentials: true }).subscribe(
                (data: Array<GPResource>) => {
                    resolve(data);
                },
                err => { reject(err); }
            );
        });
    }

    public getResourceByID(
        resourceID: string, attributes: string[], rmType?: RMType, resolvRef: boolean = false, connString?: string) {
        let resourceManagerType: RMType = rmType ? rmType : RMType.user;
        if (resourceManagerType === RMType.reader) {
            resourceManagerType = RMType.user;
        }
        if (resourceManagerType === RMType.adminReader) {
            resourceManagerType = RMType.admin;
        }

        let param = new HttpParams().set('param', resourceID);
        attributes.forEach((item) => {
            param = param.append('attributes', item);
        });

        if (resourceManagerType === RMType.named) {
            if (connString) {
                param = param.append('connection', connString);
            }
            else {
                resourceManagerType = RMType.user;
            }
        }

        if (this.connection) {
            if (resourceManagerType == RMType.user) {
                resourceManagerType = RMType.named;
                param = param.append('connection', this.connection);
            }
        }

        const url = this.buildServiceMethodUrl(
            this.serviceUrl, resourceManagerType.toString(), resolvRef ? 'getresolved' : 'get', 'id');

        return new Promise((resolve, reject) => {
            this.http.get(url, { params: param, withCredentials: true }).subscribe(
                (data: GPResource) => {
                    resolve(data);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    public getResourceByQuery(
        query: string, attributes: string[], rmType?: RMType, resolvRef: boolean = false,
        count: number = -1, skip: number = 0, checkRights: boolean = true, connString?: string
    ) {
        let resourceManagerType: RMType = rmType ? rmType : RMType.user;

        let param: HttpParams = new HttpParams().set('param', query);
        attributes.forEach((item) => {
            param = param.append('attributes', item);
        });

        if (resourceManagerType === RMType.reader) {
            param = param.append('requestorID', this.loginUser.ObjectID);
            param = param.append('checkRights', String(checkRights));
            param = param.append('count', String(count));
            param = param.append('skip', String(skip));
        }

        if (resourceManagerType === RMType.adminReader) {
            param = param.append('requestorID', this.adminGuid);
            param = param.append('checkRights', String(checkRights));
            param = param.append('count', String(count));
            param = param.append('skip', String(skip));
        }

        if (resourceManagerType === RMType.named) {
            if (connString) {
                param = param.append('connection', connString);
            }
            else {
                resourceManagerType = RMType.user;
            }
        }

        if (this.connection) {
            if (resourceManagerType == RMType.user) {
                resourceManagerType = RMType.named;
                param = param.append('connection', this.connection);
            }
        }

        const url: string = this.buildServiceMethodUrl(
            this.serviceUrl, resourceManagerType.toString(), resolvRef ? 'getresolved' : 'get', 'query');

        return new Promise((resolve, reject) => {
            this.http.get(url, {
                params: param,
                withCredentials: true
            }).subscribe(
                (data: Array<GPResource>) => {
                    if (count < 0) {
                        resolve(data);
                    }
                    else {
                        if (count > data.length) {
                            resolve(data);
                        }
                        else {
                            let dataPart: Array<GPResource> = data.slice(0, count);
                            resolve(dataPart);
                        }
                    }
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    public updateResource(resource: GPResource, rmType: RMType, isDelta: boolean = false, connString?: string) {
        let resourceManagerType: RMType = rmType ? rmType : RMType.user;
        if (resourceManagerType === RMType.reader) {
            resourceManagerType = RMType.user;
        }
        if (resourceManagerType === RMType.adminReader) {
            resourceManagerType = RMType.admin;
        }

        let target = { ...resource };

        if (isDelta) {
            for (let key in target.Attributes) {
                if (!target.Attributes[key].IsDirty) {
                    delete target.Attributes[key];
                }
            }
        }

        if (Object.keys(target.Attributes).length === 0) {
            return new Promise(resolve => { resolve(true) });
        }

        const datetimeFormat = this.configService.getConfig('datetimeFormat', 'MM/dd/yyyy hh:mm:ss tt');
        const datetimeDBFormat = this.configService.getConfig('datetimeDBFormat', 'MMM d yyyy h:mmtt');
        const displayedDatetimeFormat = this.configService.getConfig('displayedDatetimeFormat', 'MM/dd/yyyy');

        for (let key in target.Attributes) {
            let item = target.Attributes[key];

            if (!item.IsMultivalued && !item.Value)
                item.Values = [];
            if (item.Values.length > 1)
                item.IsMultivalued = true;

            if (item.Type === 'DateTime') {
                let dt = moment(item.Value, [datetimeFormat, datetimeDBFormat, displayedDatetimeFormat]);
                if (dt.isValid()) {
                    item.Value = dt.format('yyyy-MM-ddThh:mm:ss.fff');
                }
            }
        }

        let body: any = target;
        if (resourceManagerType === RMType.named) {
            if (connString) {
                body = { Resource: target, Connection: connString };
            }
            else {
                resourceManagerType = RMType.user;
            }
        }

        if (this.connection) {
            if (resourceManagerType == RMType.user) {
                resourceManagerType = RMType.named;
                body = { Resource: target, Connection: this.connection };
            }
        }

        const url = isDelta ?
            this.buildServiceMethodUrl(this.serviceUrl, resourceManagerType.toString(), '', 'deltaupdate') :
            this.buildServiceMethodUrl(this.serviceUrl, resourceManagerType.toString(), '', 'update');

        return new Promise((resolve, reject) => {
            this.http.post(url, body, { withCredentials: true }).subscribe(
                (data: boolean) => {
                    resolve(data);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    public createResource(resource: GPResource, rmType: RMType, connString?: string) {
        let resourceManagerType: RMType = rmType ? rmType : RMType.user;
        if (resourceManagerType === RMType.reader) {
            resourceManagerType = RMType.user;
        }
        if (resourceManagerType === RMType.adminReader) {
            resourceManagerType = RMType.admin;
        }

        const datetimeFormat = this.configService.getConfig('datetimeFormat', 'MM/dd/yyyy hh:mm:ss tt');
        const datetimeDBFormat = this.configService.getConfig('datetimeDBFormat', 'MMM d yyyy h:mmtt');
        const displayedDatetimeFormat = this.configService.getConfig('displayedDatetimeFormat', 'MM/dd/yyyy');

        for (let key in resource.Attributes) {
            let item = resource.Attributes[key];

            if (!item.IsMultivalued && !item.Value)
                item.Values = [];
            if (!item.Values)
                item.Values = [];
            if (item.Values.length > 1)
                item.IsMultivalued = true;

            if (item.Type === 'DateTime') {
                let dt = moment(item.Value, [datetimeFormat, datetimeDBFormat, displayedDatetimeFormat]);
                if (dt.isValid()) {
                    item.Value = dt.format('yyyy-MM-ddThh:mm:ss.fff');
                }
            }
        }

        let body: any = resource;
        if (resourceManagerType === RMType.named) {
            if (connString) {
                body = { Resource: resource, Connection: connString };
            }
            else {
                resourceManagerType = RMType.user;
            }
        }

        if (this.connection) {
            if (resourceManagerType == RMType.user) {
                resourceManagerType = RMType.named;
                body = { Resource: resource, Connection: this.connection };
            }
        }

        let url = this.buildServiceMethodUrl(this.serviceUrl, resourceManagerType.toString(), '', 'create');

        return new Promise((resolve, reject) => {
            this.http.post(url, body, { withCredentials: true, responseType: 'text' }).subscribe(
                (data: string) => {
                    resolve(data.replace(/"/gi, ''));
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    public deleteResource(resourceID: string, rmType: RMType, connString?: string) {
        let resourceManagerType: RMType = rmType ? rmType : RMType.user;
        if (resourceManagerType === RMType.reader) {
            resourceManagerType = RMType.user;
        }
        if (resourceManagerType === RMType.adminReader) {
            resourceManagerType = RMType.admin;
        }

        let param: HttpParams = new HttpParams().set('param', resourceID);

        if (resourceManagerType === RMType.named) {
            if (connString) {
                param = param.append('connection', connString);
            }
            else {
                resourceManagerType = RMType.user;
            }
        }

        if (this.connection) {
            if (resourceManagerType == RMType.user) {
                resourceManagerType = RMType.named;
                param = param.append('connection', this.connection);
            }
        }

        const url: string = this.buildServiceMethodUrl(this.serviceUrl, resourceManagerType.toString(), '', 'delete');

        return new Promise((resolve, reject) => {
            this.http.delete(url, { params: param, withCredentials: true }).subscribe(
                (data: any) => {
                    resolve(data);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    public callServiceMethod(
        actionName: string, methodType: string, methodName: string, param?: HttpParams, body?: any) {
        const url = this.buildServiceMethodUrl(this.serviceUrl, '', methodType, methodName);

        switch (actionName.toLowerCase()) {
            case 'get':
                return new Promise((resolve, reject) => {
                    this.http.get(url, param ? { withCredentials: true, params: param } : { withCredentials: true })
                        .subscribe((data: any) => { resolve(data); }, err => { reject(err); });
                });
            case 'post':
                return new Promise((resolve, reject) => {
                    this.http.post(
                        url, body, param ? { withCredentials: true, params: param } : { withCredentials: true })
                        .subscribe((data: any) => { resolve(data); }, err => { reject(err); });
                });
            default:
                return new Promise((resolve, reject) => {
                    reject(false);
                })
        }
    }

}
