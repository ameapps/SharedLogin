export class DefaultConfig {
  login!: DefaultConfigLogin;
  products!: DefaultConfigProducts;
  firebase!: DefaultConfigFirebase;
}

export class DefaultConfigLogin {}
export class DefaultConfigProducts {
  add!: DefaultConfigAdd;
  show!: DefaultConfigShow;
  edit!: DefaultConfigEdit;
}
export class DefaultConfigShow {
  open_mode: DefaultConfigShow_OpenMode = 'direct_link' ;
}
export class DefaultConfigAdd {}
export class DefaultConfigEdit {}
export class DefaultConfigFirebase {
  dbUrl!: string;
}

export type DefaultConfigShow_OpenMode = 'direct_link' | 'uId_in_querystring' | 'uId_in_post_message' ;
