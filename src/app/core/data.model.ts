/// after Typescript 2.4
// export enum RMType {
//     generic = 'generic',
//     user = 'userrm',
//     admin = 'adminrm',
//     reader = 'readerrm',
//     adminReader = 'readerrmadm',
//     named = 'namedrm',
//     remote = 'remoterm',
//     anonym = 'anonymrm'
// }

/// before Typescript 2.4
export class RMType {
    constructor(public value: string) {
    }

    toString() {
        return this.value;
    }

    static generic = new RMType("generic");
    static user = new RMType("userrm");
    static admin = new RMType("adminrm");
    static reader = new RMType("readerrm");
    static adminReader = new RMType("readerrmadm");
    static named = new RMType("namedrm");
    static remote = new RMType("remoterm");
    static anonym = new RMType("anonymrm");
}

export class GPRight {
    ActionName: string;
    AttributeName: string;
    AttributeID: number;
    IsMultivalue: boolean;
}

export class GPResource {
    DisplayName: string;
    ObjectType: string;
    ObjectID?: string;
    Attributes?: { [key: string]: GPAttribute };
    Roles?: Array<string>;
}

export class GPAttribute {
    DisplayName?: string;
    Name: string;
    Type?: string;
    Description?: string;
    IsMultivalued?: boolean;
    IsRequired?: boolean;
    IsDirty?: boolean;
    Value: string;
    Values?: Array<string>;
    CanAdd?: boolean;
    CanRead?: boolean;
    CanRemove?: boolean;
    CanWrite?: boolean;
    ResolvedType?: string;
    ResolvedTypes?: Array<string>;
    ResolvedValue?: string;
    ResolvedValues?: Array<string>;
}

export class GPAttributeDef {
    DisplayName: string;
    Description: string;
    IsMultivalued: boolean;
    IsRequired: boolean;
    Name: string;
    Type: string;
}