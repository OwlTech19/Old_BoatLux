import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FuseUtils } from '@fuse/utils';
import { cloneWith } from 'lodash';
import { LocalStorageService } from '../../../services/local-storage.service';
import { EndpointService } from '../../../services/endpoint.service';

@Injectable()
export class ChatPanelService {
    contacts: any[];
    chats: any[];
    user: any;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _httpClient: HttpClient,
        private _localStorageService: LocalStorageService,
        private _endpointService: EndpointService
    ) {
    }

    private _obterHeaders(): any {
        let loginData = this._localStorageService.get("loginData");
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + loginData.token
        };
    }

    /**
     * Loader
     *
     * @returns {Promise<any> | any}
     */
    loadContacts(): Promise<any> | any {

        //console.log("loadContacts()");

        return new Promise((resolve, reject) => {
            Promise.all([
                this.getContacts(),
                this.getUser()
            ]).then(
                ([contacts, user]) => {
                    this.contacts = contacts;
                    this.user = user;
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get chat
     *
     * @param contactId
     * @returns {Promise<any>}
     */
    getChat(contactId): Promise<any> {

        
        const chatItem = this.user.chatList.find((item) => {
            return item.contactId === contactId;
        });

        //console.log("Chat List:", this.user.chatList);
        //console.log("Contact Id:", contactId);
        //console.log("Chat Item:", chatItem);

        // Get the chat
        return new Promise((resolve, reject) => {

            // If there is a chat with this user, return that.
            if (chatItem) {
                let url = this._endpointService.obterUrlRestService('chat/conversa/' + contactId);
                this._httpClient
                    .post<any>(url, null, {
                        observe: 'response',
                        headers: this._obterHeaders()
                    })
                    .subscribe((res: any) => {

                        //Atualiza o chat
                        chatItem.dialog = res.body.dialog;
                        chatItem.lastMessageId = res.body.lastMessageId;
                        resolve(chatItem);
                        //resolve(res.body);
                    }, reject);
            }
            // If there is no chat with this user, create one...
            else {
                this.createNewChat(contactId).then((resultado) => {
                    resolve(resultado);
                });
            }
        });
    }

    /**
     * Get chat
     *
     * @param contactId
     * @returns {Promise<any>}
     */
    getNewMessages(contactId, lastMessageId): Promise<any> {

        // Get the chat
        return new Promise((resolve, reject) => {
            let url = this._endpointService.obterUrlRestService('chat/conversa/' + contactId + "/" + lastMessageId);
            this._httpClient
                .post<any>(url, null, {
                    observe: 'response',
                    headers: this._obterHeaders()
                })
                .subscribe((res: any) => {
                    resolve(res.body);
                }, reject);               
        });
}

/**
 * Create new chat
 *
 * @param contactId
 * @returns {Promise<any>}
 */
createNewChat(contactId): Promise < any > {
    return new Promise((resolve, reject) => {

        let url = this._endpointService.obterUrlRestService('chat/conversa/' + contactId);
        this._httpClient
            .post<any>(url, null, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .subscribe((res: any) => {

                // Add new chat list item to the user's chat list
                this.user.chatList.push(res.body);
                resolve(res.body);
            }, reject);
    });
}

/**
 * Update the chat
 *
 * @param chatId
 * @param dialog
 * @returns {Promise<any>}
 */
updateChat(contactId, dialog): Promise < any > {
    //console.log('Envianddo 1');

    return new Promise((resolve, reject) => {

        const newData = {
            codLoginDestinatario: contactId,
            mensagem: dialog[dialog.length - 1].message
        };

        let url = this._endpointService.obterUrlRestService('chat/enviarMensagem');

        this._httpClient
            .post<any>(url, newData, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .subscribe(
                res => {
                    resolve();
                    //resolve(updatedChat);
                    //resolve(res.body.itens);
                }, reject);


        //const newData = {
        //    id: chatId,
        //    dialog: dialog
        //};

        //this._httpClient.post('api/chat-panel-chats/' + chatId, newData)
        //    .subscribe(updatedChat => {
        //        resolve(updatedChat);
        //    }, reject);
    });
}

/**
 * Get contacts
 *
 * @returns {Promise<any>}
 */
getContacts(): Promise < any > {
    let url = this._endpointService.obterUrlRestService('chat/contatos');
    return new Promise((resolve, reject) => {
        this._httpClient
            .post<any>(url, null, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .toPromise()
            .then(
                res => {
                    resolve(res.body.itens);
                });
    });

}

/**
 * Get user
 *
 * @returns {Promise<any>}
 */
getUser(): Promise < any > {
    let url = this._endpointService.obterUrlRestService('chat/perfil');
    return new Promise((resolve, reject) => {
        this._httpClient
            .post<any>(url, null, {
                observe: 'response',
                headers: this._obterHeaders()
            })
            .toPromise()
            .then(
                res => {
                    resolve(
                        {
                            'id': res.body.contato.id,
                            'name': res.body.contato.name,
                            'avatar': res.body.contato.avatar,
                            'status': res.body.contato.status,
                            'mood': res.body.contato.mood,
                            'chatList': res.body.resumos
                        }
                    );
                });
    });
}
}
