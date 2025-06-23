use std::sync::Arc;

use crate::libs::torrent_ws::TorrentWebSocket;
use crate::Args;

pub struct AxumState {
    pub args: Args,
    pub torrent_websocket: Arc<TorrentWebSocket>,
}

impl AxumState {
    pub fn new(args: Args, torrent_websocket: TorrentWebSocket) -> Self {
        AxumState { 
            args, 
            torrent_websocket: Arc::new(torrent_websocket) 
        }
    }
}