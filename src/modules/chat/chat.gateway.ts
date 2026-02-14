import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: "/chat",
})
@Injectable()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSockets: Map<number, string> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    console.log("WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.email = payload.email;

      this.userSockets.set(payload.sub, client.id);

    } catch (error) {
      console.error("WebSocket authentication error:", error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSockets.delete(client.data.userId);
    }
  }

  @SubscribeMessage("join")
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { conversations: number[] }) {
    if (data.conversations && Array.isArray(data.conversations)) {
      data.conversations.forEach((conversationId) => {
        client.join(`conversation:${conversationId}`);
      });
    }
    return { event: "joined", data: "Successfully joined conversations" };
  }

  @SubscribeMessage("leave")
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { conversations: number[] }) {
    if (data.conversations && Array.isArray(data.conversations)) {
      data.conversations.forEach((conversationId) => {
        client.leave(`conversation:${conversationId}`);
      });
    }
    return { event: "left", data: "Successfully left conversations" };
  }

  sendMessageToConversation(conversationId: number, message: unknown) {
    this.server.to(`conversation:${conversationId}`).emit("newMessage", message);
  }

  sendNotification(userId: number, notification: unknown) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit("notification", notification);
    }
  }
}
