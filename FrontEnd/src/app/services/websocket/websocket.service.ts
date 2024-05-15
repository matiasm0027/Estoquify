import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private socket: Socket) {
    this.socket.connect();
  }

  sendMessage(message: string) {
    this.socket.emit('message', message);
  }

  receiveMessage() {
    return this.socket.fromEvent<string>('message');
  }
}