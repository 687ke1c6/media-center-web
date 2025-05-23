use std::{
    fs::{self, FileType},
    io::Read,
    path::Path,
};

use crate::models::{axum_state::AxumState, rpc::RpcResponseProxy};
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::post,
    Json, Router,
};
use reqwest::{Client, RequestBuilder};
use serde_json::{json, Value};
use transmission_rpc::{
    types::{Id, SessionSetArgs, TorrentAddArgs, TorrentGetField},
    TransClient,
};

pub fn api_route(state: AxumState) -> Router {
    Router::new()
        .route("/search", post(search))
        .route("/remote", post(remote))
        .route("/torrent-remove", post(torrent_remove))
        .route("/torrent-get", post(torrent_get))
        .route("/torrent-add", post(torrent_add))
        .route("/torrent-info", post(torrent_info))
        .with_state(state)
}

pub fn to_rpc_reqwest(url: String, client: &Client) -> RequestBuilder {
    let request = client.post(url);
    request
}

async fn search(State(state): State<AxumState>, Json(json): Json<serde_json::Value>) -> Response {
    let dirs = fs::read_dir(&state.args.media_library)
        .unwrap()
        .filter_map(|entity| {
            let ee = entity.unwrap();
            if FileType::is_dir(&ee.file_type().unwrap()) {
                let dir_name = ee.file_name().to_string_lossy().to_string();
                if !["incomplete", "logs", "config", "cache"]
                    .iter()
                    .any(|&v| v == &dir_name)
                {
                    return Some(dir_name);
                }
            }
            None
        })
        .collect::<Vec<String>>();

    let url: String = format!(
        "{}/api/v1/search?query={}",
        &state.args.torrent_api_url,
        url_escape::encode_component(json["search_term"].as_str().unwrap())
    );

    let mut map: serde_json::Map<String, Value> = serde_json::Map::new();

    if let Some(debug_search_response) = &state.args.debug_search_response {
        println!(
            "DEBUG_SEARCH_RESPONSE: Attempting json from {}",
            &debug_search_response
        );
        let mut json_contents = String::new();
        let size = fs::File::open(&debug_search_response)
            .and_then(|mut f| f.read_to_string(&mut json_contents))
            .ok();
        if let Some(sz) = size {
            let debug_json_resonse: Value = serde_json::from_str(&json_contents).unwrap();
            map.insert("response".to_string(), debug_json_resonse);
            println!("DEBUG_SEARCH_RESPONSE: Found json file. {} bytes", sz);
        } else {
            println!(
                "DEBUG_SEARCH_RESPONSE: Could not open file: {}",
                &debug_search_response
            );
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    } else {
        // let proxy = reqwest::Proxy::all(format!("socks5h://{}:{}",&args.tor_ipv4, &args.tor_port)).unwrap();
        let http_client = reqwest::Client::builder()
            // .proxy(proxy)
            .default_headers({
                let mut headers = reqwest::header::HeaderMap::new();
                headers.insert(
                    "X-Api-Key",
                    state.prowlarr_config.api_key.clone().parse().unwrap(),
                );
                headers
            })
            .build()
            .unwrap();
        
        println!("GET: {}", url);
        let response_result = http_client.get(url).send().await;

        match response_result {
            Ok(response) => {
                let text = response.json::<serde_json::Value>().await;
                if let Ok(json) = text {
                    map.insert("response".to_string(), json);
                }
            }
            Err(err) => {
                println!("{:?}", err);
                return StatusCode::INTERNAL_SERVER_ERROR.into_response();
            }
        }
    }

    map.insert("dirs".to_string(), dirs.into());
    return Json(map).into_response();
}

async fn torrent_info(State(state): State<AxumState>) -> Response {
    println!("POST: /api/torrent-info");
    let transmission_url = format!(
        "http://{}:9091/transmission/rpc",
        &state.args.transmission_ipv4
    );
    let mut _client = TransClient::new(transmission_url.parse().unwrap());
    StatusCode::OK.into_response()
}

async fn torrent_get(State(state): State<AxumState>) -> Response {
    let transmission_url = format!(
        "http://{}:9091/transmission/rpc",
        &state.args.transmission_ipv4
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
        TorrentGetField::Eta
    ];

    let get_result = client.torrent_get(Some(fields), None).await;
    match get_result {
        Ok(response) => {
            let proxy = RpcResponseProxy::from_original(&response);
            let js = json!(proxy);
            return Json(js).into_response();
        }
        Err(err) => println!("torrent_get(): {}", err),
    }

    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

async fn torrent_remove(
    State(state): State<AxumState>,
    Json(json): Json<serde_json::Value>,
) -> Response {
    println!("POST: /api/torrent-remove");
    let ids = json["ids"].as_array();
    if let Some(id_array) = ids {
        let id_vec: Vec<Id> = id_array
            .into_iter()
            .map(|v| Id::Id(v.as_i64().unwrap()))
            .collect();
        let transmission_url = format!(
            "http://{}:9091/transmission/rpc",
            &state.args.transmission_ipv4
        );
        let mut client = TransClient::new(transmission_url.parse().unwrap());
        let remove_response = client
            .torrent_remove(id_vec, json["remove"].as_bool().unwrap())
            .await;
        match remove_response {
            Ok(_) => {
                return StatusCode::OK.into_response();
            }
            Err(err) => println!("{:?}", err),
        }
    }
    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

async fn torrent_add(
    State(state): State<AxumState>,
    Json(json): Json<serde_json::Value>,
) -> Response {
    println!("POST: /api/torrent-add");
    let transmission_url = format!(
        "http://{}:9091/transmission/rpc",
        &state.args.transmission_ipv4
    );
    let mut client = TransClient::new(transmission_url.parse().unwrap());

    let folder = match json["downloadDir"].as_str() {
        Some(folder) => folder,
        None => return (StatusCode::BAD_REQUEST, "missing downloadDir").into_response(),
    };

    let download_dir = Path::new(&state.args.media_library)
        .join(folder)
        .to_str()
        .unwrap()
        .to_owned();
    println!("downloadDir: {}", download_dir);    

    // let magnet_url = format!(
    //     "magnet:?xt=urn:btih:{}",
    //     &json["info_hash"].as_str().unwrap()
    // );
    let magnet_url = json["guid"].as_str().unwrap().to_owned();
    println!("magnetUrl: {}", magnet_url);

    let add = TorrentAddArgs {
        filename: Some(magnet_url),
        download_dir: Some(download_dir),
        ..TorrentAddArgs::default()
    };

    let mut session = SessionSetArgs {
        speed_limit_up: Some(10),
        speed_limit_up_enabled: Some(true),
        ..SessionSetArgs::default()
    };

    if let Some(script_torrent_done_filename) = &state.args.script_torrent_done_filename {
        println!(
            "script_torrent_done_filename={}",
            script_torrent_done_filename
        );
        session.script_torrent_done_enabled = Some(true);
        session.script_torrent_done_filename = Some(script_torrent_done_filename.to_owned());
    }

    if let Some(limit) = &state.args.speed_limit_down {
        session.speed_limit_down_enabled = Some(true);
        session.speed_limit_down = Some(*limit);
    }

    let response = client.torrent_add(add).await;
    match response {
        Ok(_res) => {
            let session_response = client.session_set(session).await;
            match session_response {
                Ok(_) => {
                    println!("OK");
                    return StatusCode::OK.into_response();
                }
                Err(err) => {
                    println!("Error: session-get");
                    println!("{:?}", err);
                }
            }
        }
        Err(err) => {
            println!("Error: torrent-add");
            println!("{:?}", err);
        }
    }
    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

async fn remote(Json(_json): Json<serde_json::Value>) -> Response {
    // let data = r#"
    //     {
    //         "name": "John Doe",
    //         "age": 43,
    //         "phones": [
    //             "+44 1234567",
    //             "+44 2345678"
    //         ]
    //     }"#;

    // // Parse the string of data into serde_json::Value.
    // let v: Value = serde_json::from_str(data).unwrap();
    // Json(v).into_response();

    let proxy = reqwest::Proxy::http("http://127.0.0.1:8080").unwrap();
    let http_client = reqwest::Client::builder().proxy(proxy).build().unwrap();

    let mut headers = vec![];

    loop {
        println!("{}\n{:?}", "sending", &headers);
        let request = to_rpc_reqwest(
            String::from("http://127.0.0.1:9091/transmission/rpc/"),
            &http_client,
        );
        let response = request.send().await;
        println!("sent");
        match response {
            Ok(res) => {
                let status = res.status().as_u16();
                if status == 409 {
                    println!("409");
                    let session_key = res.headers().get("X-Transmission-Session-Id").unwrap();
                    headers.push((
                        String::from("X-Transmission-Session-Id"),
                        String::from(session_key.to_str().unwrap()),
                    ));
                    continue;
                }

                println!("{}", status);

                let text = res.text().await.unwrap();
                println!("{}", text);
            }
            Err(e) => {
                println!("error: {:?}", e);
            }
        }
        break;
    }

    StatusCode::OK.into_response()
}
