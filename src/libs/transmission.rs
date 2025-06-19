use transmission_rpc::{types::{RpcResponse, Torrent, TorrentGetField, Torrents}, TransClient};
use anyhow::Result;

use crate::models::{args::Args};

pub async fn torrent_get(state: &Args) -> Result<RpcResponse<Torrents<Torrent>>> {
    let transmission_url = format!(
        "http://{}:{}/transmission/rpc",
        &state.transmission_ipv4, &state.transmission_port
    );
    let mut client = TransClient::new(transmission_url.parse().unwrap());
    let fields = vec![
        TorrentGetField::Id,
        TorrentGetField::Name,
        TorrentGetField::Status,
        TorrentGetField::PercentDone,
        TorrentGetField::TotalSize,
        TorrentGetField::LeftUntilDone,
        TorrentGetField::RateDownload,
        TorrentGetField::RateUpload,
        TorrentGetField::PeersConnected,
        TorrentGetField::PeersGettingFromUs,
        TorrentGetField::PeersSendingToUs,
        TorrentGetField::Files,
        TorrentGetField::SizeWhenDone,
        TorrentGetField::HashString,
        TorrentGetField::Eta,
    ];

    let xx = client.torrent_get(Some(fields), None).await;
    xx.map_err(|e| {
        anyhow::anyhow!("Failed to get torrents from Transmission: {}", e)
    })
}
