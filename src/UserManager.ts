import { connection } from "websocket";
import { OutgoingMessage } from "./messages/outgoingMEssages";

interface User {
    name: string,
    id: string;
    conn: connection
}

interface Room {
    users: User[]
}
export class UserManager {
    private rooms: Map<string, Room>;
    constructor() {
        this.rooms = new Map<string, Room>()
    }

    getUser(roomId: string, userId: string): User | null {
        const user =  this.rooms.get(roomId)?.users.find(({id}) => id === userId)
        return user ?? null;
    }

    addUser(name: string, userId: string, roomId: string, socket: connection) {
        if (!this.rooms.get(roomId)) {
            this.rooms.set(roomId, {
                users: []
            })
        }
        this.rooms.get(roomId)?.users.push({
            id: userId,
            name,
            conn: socket
        })
    }

    removeUser(roomId: string, userId: string) {
        const users = this.rooms.get(roomId)?.users;
        if (users) {
            users.filter(({id}) => id !== userId)
        }
        
    }

    broadcast(roomId: string, userId: string, message: OutgoingMessage) {
        const user = this.getUser(roomId, userId)
        if (!user) {
            console.error("User not found in db: " + userId)
            return
        }
        const room = this.rooms.get(roomId)
        if (!room) {
            console.error("Room does not exits in db: " + roomId)
            return
        }

        room.users.forEach(({conn}) => {
            conn.sendUTF(JSON.stringify(message))
        })
    }
}