import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  private readonly url: string = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.url);
  }

  public login(username: string): void {
    this.socket.emit('login', username);
  }

  public sendMessage(to: string, message: string): void {
    this.socket.emit('private message', { to, message });
  }

  getMessages(): Observable<{ from: string, message: string }> {
    return new Observable<{ from: string, message: string }>((observer) => {
      this.socket.on('private message', (data: { from: string, message: string }) => {
        observer.next(data);
      });
    });
  }

  public getUserConnections(): Observable<{ type: string, username: string }> {
    return new Observable<{ type: string, username: string }>((observer) => {
      this.socket.on('user connected', (username: string) => {
        observer.next({ type: 'connected', username });
      });
      this.socket.on('user disconnected', (username: string) => {
        observer.next({ type: 'disconnected', username });
      });
    });
  }
}
