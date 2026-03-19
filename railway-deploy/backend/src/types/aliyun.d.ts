declare module '@alicloud/dysmsapi20170525' {
  class Dysmsapi {
    constructor(config: any);
    sendSms(request: any): Promise<any>;
  }
  export = Dysmsapi;
}

declare module '@alicloud/openapi-client' {
  interface ConfigOptions {
    accessKeyId: string;
    accessKeySecret: string;
  }
  class ConfigClass {
    constructor(options: ConfigOptions);
    endpoint: string;
  }
  export = ConfigClass;
}
