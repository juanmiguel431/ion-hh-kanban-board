import { Base64 } from 'js-base64';

export class LocalStorageHelper {
  private cache: any = {};

  public setItem(key: string, value: any) {
    localStorage.setItem(key, LocalStorageHelper.encodeToBase64(value))
    this.cache[key] = value;
  }

  public getByKey = (key: string) => {
    if (this.cache.hasOwnProperty(key)) {
      return this.cache[key];
    }

    const item = localStorage.getItem(key);
    const itemDecoded = item ? LocalStorageHelper.decodeBase64StringToJson(item) : undefined;
    this.cache[key] = itemDecoded;

    return itemDecoded;
  }

  public static encodeToBase64(json: any) {
    return Base64.encode(JSON.stringify(json));
  }

  public static decodeBase64StringToJson(str: string) {
    return JSON.parse(Base64.decode(str));
  }
}
