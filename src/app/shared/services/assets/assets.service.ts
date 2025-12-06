import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssetsService {

    constructor(public http: HttpClient) { }

  /**
   * @param path Method getting the content of the file (included into
   * Assets folder ) specified as parameter.
   * <usage>
   * const asset = await this.assets.getFile('assets/Test.json')
   * </usage>
   * @returns a string representing the content of the file.
   */
  async getFile(path: string): Promise<any> {
    const res = await this.http.get<any>(path).toPromise();
    return res;
  }
}
