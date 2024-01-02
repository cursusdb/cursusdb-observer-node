/*
* CursusDB
* Observer for Node.JS
* ******************************************************************
* Copyright (C) 2023 CursusDB
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import net from 'node:net'
import EventEmitter from 'node:events'
import { createHash } from 'node:crypto'

class Observer {

    constructor(sharedKey) {
        this.sharedKey = createHash('sha256').update(sharedKey).digest('base64');
        this.host = "0.0.0.0"
        this.port = 7680
        this.events = new EventEmitter();
    }

    // Change default host of Observer
    ChangeHost(host) {
        this.host = host
    }

    // Change default port of Observer
    ChangePort(port) {
        this.port = port
    }

    // Convert listener from TCP to TLS
    UpgradeToSecureListener(cert, key) {
        this.tls = true
        this.cert = cert
        this.key = key
    }

    // Start Observer
    Start() {

        let server;

        if(this.tls) {
            const options = {
                key: fs.readFileSync(this.key),
                cert: fs.readFileSync(this.cert),

                rejectUnauthorized: true,
            };
            server = tls.createServer(options)
        } else {
            server = net.createServer();
        }
        server.listen(this.port, this.host, () => {
            console.log('CursusDB Observer started.');
        });

        let obj = this


        server.on('connection', function(sock) {
            let authenticated = undefined
            sock.on('data', function(data) {

                if (authenticated === undefined) {
                    let authSplit = data.toString().split("Key:")
                    
                    if(authSplit.length === 2) {
                        let providedKey = authSplit[1].trim()

                   
                        if (providedKey === obj.sharedKey) {
                            authenticated = true
                            sock.write("0 OK\r\n")
                        } else {
                            sock.write("Node not allowed.\r\n")
                            sock.destroy();
                            return
                        }
                    } else {
                        sock.write("Node not allowed.\r\n")
                        sock.destroy();
                        return
                    }
                }

                // Relay node submitted events such as insert, update, delete to emitter and emit
                obj.events.emit('event', data.toString());
            });

        });
    }
}

export default Observer