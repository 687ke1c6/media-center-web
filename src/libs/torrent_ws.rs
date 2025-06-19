use std::{sync::Arc};
use axum::extract::{ws::WebSocket, WebSocketUpgrade};
use tokio::{sync::broadcast, task::JoinHandle};

use crate::{
    libs::transmission::torrent_get,
    models::{args::Args, rpc::RpcResponseProxy},
};

pub struct TorrentWebSocket {
    pub tx: broadcast::Sender<serde_json::Value>,
    #[allow(dead_code)]
    pub rx: broadcast::Receiver<serde_json::Value>,
    join_handle: JoinHandle<()>,
}

impl Drop for TorrentWebSocket {
    fn drop(&mut self) {
        dbg!("Dropping TorrentWebSocket");
        self.join_handle.abort();
    }
}

impl TorrentWebSocket {
    pub fn new(args: Args) -> Self {
        let (tx, rx) = broadcast::channel(100);
        let tx_clone = tx.clone();
        let join_handle = tokio::spawn(async move {
            dbg!("Starting TorrentWebSocket loop");
            loop {
                tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
                if tx_clone.receiver_count() == 1 {
                    continue;
                }

                match torrent_get(&args).await {
                    Ok(response) => {
                        let response: RpcResponseProxy = (&response).into();
                        let value = serde_json::json!(response);
                        tx_clone
                            .send(value)
                            .expect("Failed to send message to broadcast channel");
                    }
                    Err(err) => {
                        println!("Error: loop torrent-get");
                        println!("{:?}", err);
                    }
                }
            }
        });
        TorrentWebSocket {
            tx,
            rx,
            join_handle,
        }
    }

    pub fn handle_websocket_upgrade(self: Arc<Self>, ws: WebSocketUpgrade) -> axum::response::Response {
        dbg!("Handling WebSocket upgrade");
        ws.on_upgrade(move |socket| {
            async move {
                self.handle_socket(socket).await;
            }
        })
    }

    async fn handle_socket(self: Arc<Self>, mut socket: WebSocket) {

        dbg!("WebSocket connection upgraded");
        let mut rx = self.tx.subscribe();

        loop {
            tokio::select! {
                msg = rx.recv() => {
                    match msg {
                        Ok(msg) => {
                            if socket
                                .send(axum::extract::ws::Message::Text(msg.to_string()))
                                .await
                                .is_err()
                            {
                                // client disconnected
                                break;
                            }
                        }
                        Err(_) => {
                            // broadcast channel closed
                            break;
                        }
                    }
                }
                result = socket.recv() => {
                    match result {
                        Some(Ok(_)) => {
                            // Optionally handle incoming messages from client
                        }
                        _ => {
                            // WebSocket closed or error
                            break;
                        }
                    }
                }
            }
        }
        println!("WebSocket connection closed and unsubscribed");
    }
}

