use std::sync::Arc;

use crate::libs::torrent_ws::TorrentWebSocket;
use crate::Args;
use crate::ProwlarrConfig;

pub struct AxumState {
    pub args: Args,
    pub prowlarr_config: ProwlarrConfig,
    pub torrent_websocket: Arc<TorrentWebSocket>,
}

impl AxumState {
    pub fn new(args: Args, prowlarr_config: ProwlarrConfig, torrent_websocket: TorrentWebSocket) -> Self {
        AxumState { 
            args, 
            prowlarr_config, 
            torrent_websocket: Arc::new(torrent_websocket) 
        }
    }
}