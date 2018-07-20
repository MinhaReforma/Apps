import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import Utils from '../../shared/utils';

/**
 * Generated class for the PerfilProfissionalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-perfil-profissional',
  templateUrl: 'perfil-profissional.html',
})
export class PerfilProfissionalPage {

  API_URL: string = Utils.getApi();
  profissional: Object;
  id: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpClient:HttpClient, private ngZone:NgZone) {
    this.id = navParams.get("profissional");
  }

  ionViewDidLoad() {
    this.carregaPerfilProfissional();
  }

  async carregaPerfilProfissional(){
    let url =
      this.API_URL +"profissionais/"+ this.id;
    this.httpClient.get(url).subscribe(
      data => {
        this.ngZone.run(() => {
          this.profissional = data;
        });
      },
      err => {}
    );
  }



}
