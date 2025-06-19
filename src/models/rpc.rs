use std::collections::HashMap;

use serde::Serialize;
use transmission_rpc::types::{RpcResponse, Torrent, Torrents};

#[derive(Debug, Serialize)]
pub struct RpcResponseProxy {
    result: String,
    arguments: RpcResponseProxyArguments
}

#[derive(Debug, Serialize)]
pub struct RpcResponseProxyArguments {
    torrents: Vec<HashMap<String, String>>
}

impl From<&RpcResponse<Torrents<Torrent>>> for RpcResponseProxy {
    fn from(rpc_response: &RpcResponse<Torrents<Torrent>>) -> Self {
        RpcResponseProxy::from_original(rpc_response)
    }
}


impl RpcResponseProxy {
    fn from_original(rpc_response: &RpcResponse<Torrents<Torrent>>) -> RpcResponseProxy {
        RpcResponseProxy {
            result: rpc_response.result.to_owned(),
            arguments: RpcResponseProxyArguments {
                torrents: (&rpc_response.arguments.torrents).into_iter().map(|t| {
                    HashMap::from([
                        ("error".to_string(), t.error.as_ref().map(|e| {
                            match e {
                                transmission_rpc::types::ErrorType::Ok => "Ok",
                                transmission_rpc::types::ErrorType::TrackerWarning => "TrackerWarning",
                                transmission_rpc::types::ErrorType::TrackerError => "TrackerError",
                                transmission_rpc::types::ErrorType::LocalError => "LocalError",
                            }
                        }).unwrap_or("").to_string()),
                        ("errorString".to_string(), t.error_string.as_ref().unwrap_or(&"".to_string()).to_owned()),
                        ("eta".to_string(), t.eta.unwrap_or(0).to_string()),
                        ("id".to_string(), t.id.unwrap_or(0).to_string()),
                        ("isFinished".to_string(), t.is_finished.unwrap_or(false).to_string()),
                        ("leftUntilDone".to_string(), t.left_until_done.unwrap_or(0).to_string()),
                        ("name".to_string(), t.name.as_ref().unwrap_or(&"".to_string()).to_owned()),
                        ("peersGettingFromUs".to_string(), t.peers_getting_from_us.unwrap_or(0).to_string()),
                        ("peersSendingToUs".to_string(), t.peers_sending_to_us.unwrap_or(0).to_string()),
                        ("rateDownload".to_string(), t.rate_download.unwrap_or(0).to_string()),
                        ("rateUpload".to_string(), t.rate_upload.unwrap_or(0).to_string()),
                        ("sizeWhenDone".to_string(), t.size_when_done.unwrap_or(0).to_string()),
                        ("status".to_string(), t.status.as_ref().map(|e| {
                            match e {
                                transmission_rpc::types::TorrentStatus::Stopped => "Stopped",
                                transmission_rpc::types::TorrentStatus::QueuedToVerify => "QueuedToVerify",
                                transmission_rpc::types::TorrentStatus::Verifying => "Verifying",
                                transmission_rpc::types::TorrentStatus::QueuedToDownload => "QueuedToDownload",
                                transmission_rpc::types::TorrentStatus::Downloading => "Downloading",
                                transmission_rpc::types::TorrentStatus::QueuedToSeed => "QueuedToSeed",
                                transmission_rpc::types::TorrentStatus::Seeding => "Seeding",
                            }
                        }).unwrap_or("").to_string()),
                        ("uploadRatio".to_string(), t.upload_ratio.unwrap_or(0.0).to_string()),
                        ("torrentFile".to_string(), t.torrent_file.as_ref().unwrap_or(&"".to_string()).to_owned()),
                        ("hashString".to_string(), t.hash_string.as_ref().unwrap_or(&"".to_string()).to_owned())
                        ])
                }).collect()
            }
        }
    }
}