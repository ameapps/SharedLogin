export class FirebaseUser {
    auth!: FirebaseUserAuth;
    info!: FirebaseUserInfo;
}

export class FirebaseUserAuth {
    role!: string;
    allowedProds!: Record<string, unknown>;
}

export class FirebaseUserInfo {
    icon!: string;
    sex!: string;
    username!: string;

    constructor(icon: string, sex: string, username: string) {
        this.icon = icon;
        this.sex = sex;
        this.username = username;
    }
}