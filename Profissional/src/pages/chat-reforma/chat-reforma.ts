import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { Component, NgZone } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  AlertController
} from "ionic-angular";

import Utils from '../../shared/utils';

@IonicPage()
@Component({
  selector: "page-chat-reforma",
  templateUrl: "chat-reforma.html"
})
export class ChatReformaPage {

  API_URL: string = Utils.getApi();
  idReforma: any;
  profissional: any;
  id: any;
  conversa: any;
  mensagem: any;
  count: any;
  timeoutId: number;
  preco: number = 0;
  negociacao: any = {
    nivelPreco: 0,
    msgId: undefined
  };
  perfilNegociador: string = 'cliente';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public httpClient: HttpClient,
    public storage: Storage,
    public ngZone: NgZone,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
  ) {
    this.idReforma = navParams.get("id");
    this.storage.get("profissional").then(val => {
      this.profissional = val;
    });
  }

  ionViewWillEnter() {
    this.timeoutId = setInterval(() => {
      this.carregaChat();
    }, 1000);
  }

  ionViewWillLeave(){
    clearTimeout(this.timeoutId);
  }

  retornaPagina() {
    this.navCtrl.pop();
  }

  async carregaChat() {
    let url =
      this.API_URL + "conversas/" + this.idReforma + "/" + this.profissional;
    this.httpClient.get(url).subscribe(
      (data: any) => {
        this.ngZone.run(() => {
          // if (data.mensagens.length != this.count) {
            this.conversa = data;
            this.count = data.mensagens.length;
          // }
          this.negociacao.msgId = data.msgNegociacao.id;
          this.negociacao.nivelPreco = data.msgNegociacao.nivelPreco;
        });
      },
      err => {}
    );
  }

  async enviaMensagem() {
    if (this.mensagem.trim().length < 1) {
      return;
    }
    let url = this.API_URL + "conversas/mensagem";
    this.httpClient
      .post(url, {
        id_conversa: this.conversa.id,
        perfil: "profissional",
        data: Date.now(),
        mensagem: this.mensagem,
        preco: this.preco,
        nivelPreco: 0
      })
      .subscribe(
        data => {
          this.mensagem = "";
          this.removerPreco();
        },
        err => {
          this.toastCtrl
            .create({
              message: err.message,
              duration: 1500,
              position: "bottom"
            })
            .present();
        }
      );
  }
  public getTime(t) {
    return Utils.getTime(t);
  }

  public mostrarInformarPreco() {
    const prompt = this.alertCtrl.create({
      title: 'Negociar',
      message: "Informe o preço que você gostaria de negociar com este profissional.",
      inputs: [
        {
          name: 'preco',
          placeholder: 'Preço',
          type: 'number',
          min: 1
        },
      ],
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Inserir',
          handler: data => {
            this.preco = data.preco
          }
        }
      ]
    });
    prompt.present();
  }

  public removerPreco() {
    this.preco = 0;
  }

  public aceitarPreco(id, perfil) {
    if (perfil == 'cliente') {

      switch (this.negociacao.msgId) {
        case id:
          //se é uma confirmação de negociacao
          this.mostrarDialogNegociacao(
            'Confirmar preço final',
            'Deseja negociar este preço como o final? Isto confirmará o orçamento final da reforma',
            (/*success*/) => {
              this.negociaPreco(id, 2,() => {
                this.negociacao.nivelPreco++;//finalizou
              })
            }
          );
          break;

        default:
          if (this.negociacao.nivelPreco < 2) {
            //se vai se iniciar a negociação
            this.mostrarDialogNegociacao(
              'Iniciar negociação',
              'Deseja iniciar a negociação com este preço? O outro usuário poderá aceitar ou negociar um outro.',
              (/*success*/) => {
                this.negociaPreco(id, 1, () => {
                  this.negociacao.msgId = id
                  this.negociacao.nivelPreco = 1
                })
              }
            )
          }
          break;
      }
    }

  }

  public mostrarDialogNegociacao(titulo:string, mensagem: string, callback: Function) {
    const prompt = this.alertCtrl.create({
      title: titulo,
      message: mensagem,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Confirmar',
          handler: () => {
            callback();
          }
        }
      ]
    });
    prompt.present();
  }

  private async negociaPreco(id, lvl, callback: Function) {
    let url = this.API_URL + "conversas/mensagem";
    this.httpClient
      .put(url, {
        id_mensagem: id,
        nivelPreco: lvl
      })
      .subscribe(
        success => {
          callback();
        },
        err => {
          this.toastCtrl
            .create({
              message: err.message,
              duration: 1500,
              position: "bottom"
            })
            .present();
        }
      );
  }
}
