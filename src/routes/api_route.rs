use std::{
    path::Path, sync::Arc,
};
use crate::{
    models::{axum_state::AxumState, rpc::RpcResponseProxy},
    libs::transmission,
};
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use reqwest::{Client, RequestBuilder};
use serde_json::Value;
use transmission_rpc::{
    types::{Id, SessionSetArgs, TorrentAddArgs},
    TransClient,
};

pub fn api_route(state: Arc<AxumState>) -> Router<Arc<AxumState>> {
    Router::new()
        .route("/env", get(env))
        .route("/search", post(search))
        .route("/ipinfo", get(ipinfo))
        .route("/remote", post(remote))
        .route("/torrent-remove", post(torrent_remove))
        .route("/torrent-get", post(torrent_get))
        .route("/torrent-add", post(torrent_add))
        .route("/torrent-stop", post(torrent_stop))
        .route("/torrent-start", post(torrent_start))
        .with_state(state)
}

async fn env() -> Response {
    let env_vars: serde_json::Map<String, Value> = std::env::vars()
        .map(|(k, v)| (k, Value::String(v)))
        .filter(|(k, _)| {
            return ["PROWLARR", "RADARR", "LIDARR", "SONARR", "TRANSMISSION"]
                .iter()
                .any(|&term| k.starts_with(term))
        })
        .collect();
    Json(env_vars).into_response()
}

pub fn to_rpc_reqwest(url: String, client: &Client) -> RequestBuilder {
    let request = client.post(url);
    request
}

async fn ipinfo() -> Response {
    let ipinfo_url = "http://ipinfo.io".to_string();
    let http_client = reqwest::Client::builder().build().unwrap();
    let response_result = http_client.get(ipinfo_url).send().await;

    match response_result {
        Ok(response) => {
            let text = response.json::<serde_json::Value>().await;
            if let Ok(json) = text {
                return Json(json).into_response();
            }
        }
        Err(err) => {
            println!("{:?}", err);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    }

    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

async fn search(State(state): State<Arc<AxumState>>, Json(json): Json<serde_json::Value>) -> Response {

    let prowlarr_url: String = format!(
        "{}/api/v1/search?query={}",
        format!(
            "http://{}:{}",
            &state.args.prowlarr_ipv4,
            &state.args.prowlarr_port
        ),
        url_escape::encode_component(json["search_term"].as_str().unwrap())
    );

    let mut map: serde_json::Map<String, Value> = serde_json::Map::new();
    let api_key = state.args.prowlarr_api_key.clone();
    println!("Using Prowlarr API Key: {}", api_key);

    let http_client = reqwest::Client::builder()
        .default_headers({
            let mut headers = reqwest::header::HeaderMap::new();
            headers.insert(
                "X-Api-Key",
                api_key.parse().unwrap(),
            );
            headers
        })
        .build()
        .unwrap();

    println!("GET: {}", prowlarr_url);
    let response_result = http_client.get(prowlarr_url).send().await;

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

    return Json(map).into_response();
}

async fn torrent_stop(State(state): State<Arc<AxumState>>, Json(json): Json<serde_json::Value>) -> Response {
    println!("POST: /api/torrent-stop");
    let ids = json["ids"].as_array().unwrap();
    let id_vec: Vec<Id> = ids
            .into_iter()
            .map(|v| Id::Id(v.as_i64().unwrap()))
            .collect();
    let transmission_url = format!(
        "http://{}:{}/transmission/rpc",
        &state.args.transmission_ipv4,
        &state.args.transmission_port
    );
    let mut client = TransClient::new(transmission_url.parse().unwrap());
    match client.torrent_action(transmission_rpc::types::TorrentAction::Stop, id_vec).await {
        Ok(_) => {
            println!("Torrent stopped successfully.");
        }
        Err(err) => {
            println!("Error stopping torrent: {:?}", err);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    }

    StatusCode::OK.into_response()
}

async fn torrent_start(State(state): State<Arc<AxumState>>, Json(json): Json<serde_json::Value>) -> Response {
    println!("POST: /api/torrent-start");
    let ids = json["ids"].as_array().unwrap();
    let id_vec: Vec<Id> = ids
            .into_iter()
            .map(|v| Id::Id(v.as_i64().unwrap()))
            .collect();
    let transmission_url = format!(
        "http://{}:{}/transmission/rpc",
        &state.args.transmission_ipv4,
        &state.args.transmission_port
    );
    let mut client = TransClient::new(transmission_url.parse().unwrap());
    match client.torrent_action(transmission_rpc::types::TorrentAction::Start, id_vec).await {
        Ok(_) => {
            println!("Torrent started successfully.");
        }
        Err(err) => {
            println!("Error starting torrent: {:?}", err);
            return StatusCode::INTERNAL_SERVER_ERROR.into_response();
        }
    }

    StatusCode::OK.into_response()
}

async fn torrent_get(State(state): State<Arc<AxumState>>) -> Response {

    match transmission::torrent_get(&state.args).await {
        Ok(response) => {
            let response: RpcResponseProxy = (&response).into();
            return Json(response).into_response();
        }
        Err(err) => {
            println!("Error: torrent-get");
            println!("{:?}", err);
        }
    }

    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

async fn torrent_remove(
    State(state): State<Arc<AxumState>>,
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
            "http://{}:{}/transmission/rpc",
            &state.args.transmission_ipv4,
            &state.args.transmission_port
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
    State(state): State<Arc<AxumState>>,
    Json(json): Json<serde_json::Value>,
) -> Response {
    println!("POST: /api/torrent-add");
    let transmission_url = format!(
        "http://{}:{}/transmission/rpc",
        &state.args.transmission_ipv4,
        &state.args.transmission_port
    );
    let mut client = TransClient::new(transmission_url.parse().unwrap());

    let folder = match json["downloadDir"].as_str() {
        Some(folder) => folder,
        None => return (StatusCode::BAD_REQUEST, "missing downloadDir").into_response(),
    };

    let _download_dir = Path::new(&state.args.media_library)
        .join(folder)
        .to_str()
        .unwrap()
        .to_owned();

    let magnet_url = json["guid"].as_str().unwrap().to_owned();
    println!("magnetUrl: {}", magnet_url);

    let add = TorrentAddArgs {
        filename: Some(magnet_url),
        // download_dir: Some(download_dir),
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
