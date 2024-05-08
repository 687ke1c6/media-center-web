use std::{env, path::Path};

use crate::{models::rpc::RpcResponseProxy, Args};
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::post,
    Json, Router,
};
use reqwest::{Client, RequestBuilder};
use serde_json::json;
use transmission_rpc::{
    types::{Id, SessionSetArgs, TorrentAddArgs, TorrentGetField},
    TransClient,
};

pub fn api_route(args: Args) -> Router {
    Router::new()
        .route("/search", post(search))
        .route("/remote", post(remote))
        // .route("/folders", get(folders))
        .route("/torrent-remove", post(torrent_remove))
        .route("/torrent-get", post(torrent_get))
        .route("/torrent-add", post(torrent_add))
        .with_state(args)
}

pub fn to_rpc_reqwest(url: String, client: &Client) -> RequestBuilder {
    let request = client.post(url);
    request

    // apply headers
    // for (key, value) in headers {
    //     request = request.header(key, value);
    // }
}

// fn headers_from(headers: &Vec<(String, String)>) -> HeaderMap {
//     let mut hm = HeaderMap::new();
//     // hm.append(key, value)
//     headers.iter().for_each(|(k, v)| {
//         hm.append(
//             HeaderName::from_str(k).unwrap(),
//             v.parse::<HeaderValue>().unwrap(),
//         );
//     });
//     hm
// }

async fn search(State(args): State<Args>, Json(json): Json<serde_json::Value>) -> Response {
    let torrent_api_url = env::var("TORRENT_API_URL").unwrap_or(args.torrent_api_url.clone());
    let url = format!(
        "{}{}",
        torrent_api_url,
        url_escape::encode_component(json["search_term"].as_str().unwrap())
    );

    let proxy_address = env::var("TOR_IPV4").unwrap_or("127.0.0.1".to_string());
    let proxy = reqwest::Proxy::all(format!("socks5h://{}:9050", proxy_address)).unwrap();

    let http_client = reqwest::Client::builder().proxy(proxy).build().unwrap();
    println!("GET: {}", url);
    let response_result = http_client.get(url).send().await;

    match response_result {
        Ok(response) => {
            let text = response.json::<serde_json::Value>().await;
            if let Ok(json) = text {
                println!("OK");
                return Json(json).into_response();
            }
        }
        Err(err) => {
            println!("{:?}", err);
        }
    }

    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

async fn torrent_get(Json(_json): Json<serde_json::Value>) -> Response {
    println!("GET: /api/torrent-get");
    let transmission_ipv4 = env::var("TRANSMISSION_IPV4").unwrap_or("127.0.0.1".to_string());
    let transmission_url = format!("http://{}:9091/transmission/rpc", transmission_ipv4);
    let mut client = TransClient::new(transmission_url.parse().unwrap());

    let fields = vec![
        TorrentGetField::Error,
        TorrentGetField::ErrorString,
        TorrentGetField::Eta,
        TorrentGetField::Id,
        TorrentGetField::IsFinished,
        TorrentGetField::LeftUntilDone,
        TorrentGetField::Name,
        TorrentGetField::PeersGettingFromUs,
        TorrentGetField::PeersSendingToUs,
        TorrentGetField::RateDownload,
        TorrentGetField::RateUpload,
        TorrentGetField::SizeWhenDone,
        TorrentGetField::Status,
        TorrentGetField::UploadRatio,
        TorrentGetField::Labels,
        TorrentGetField::TorrentFile,
        TorrentGetField::HashString,
    ];
    let get_restult = client.torrent_get(Some(fields), None).await;
    match get_restult {
        Ok(response) => {
            let proxy = RpcResponseProxy::from_original(&response);
            let js = json!(proxy);
            return Json(js).into_response();
        }
        Err(err) => println!("{}", err),
    }

    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

async fn torrent_remove(Json(json): Json<serde_json::Value>) -> Response {
    println!("POST: /api/torrent-remove");
    let ids = json["ids"].as_array();
    if let Some(id_array) = ids {
        let id_vec: Vec<Id> = id_array.into_iter().map(|v| Id::Id(v.as_i64().unwrap()) ).collect();
        let transmission_ipv4 = env::var("TRANSMISSION_IPV4").unwrap_or("127.0.0.1".to_string());
        let transmission_url = format!("http://{}:9091/transmission/rpc", transmission_ipv4);
        let mut client = TransClient::new(transmission_url.parse().unwrap());
        let remove_response = client.torrent_remove(id_vec, json["remove"].as_bool().unwrap()).await;
        match remove_response {
            Ok(_) => {
                return StatusCode::OK.into_response();
            }
            Err(err) => println!("{:?}", err),
        }
    }
    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

async fn torrent_add(Json(json): Json<serde_json::Value>) -> Response {
    println!("POST: /api/torrent-add");
    let transmission_ipv4 = env::var("TRANSMISSION_IPV4").unwrap_or("127.0.0.1".to_string());
    let limit = env::var("SPEED_LIMIT_DOWN").unwrap_or("".to_string());
    let transmission_url = format!("http://{}:9091/transmission/rpc", transmission_ipv4);
    let mut client = TransClient::new(transmission_url.parse().unwrap());

    // let media_library_resolved = media_library.resolve().to_str().unwrap().to_string();
    let folder_result = json["downloadDir"].as_str();
    let folder = match folder_result {
        Some(folder) => folder,
        None => return (StatusCode::BAD_REQUEST, "missing downloadDir").into_response(),
    };

    let download_dir = Path::new("/media")
        .join(folder)
        .to_owned()
        .to_str()
        .unwrap()
        .to_owned();
    println!("downloadDir: {}", download_dir);

    let magnet_url = format!(
        "magnet:?xt=urn:btih:{}",
        &json["info_hash"].as_str().unwrap()
    );

    let add = TorrentAddArgs {
        filename: Some(magnet_url),
        download_dir: Some(download_dir),
        ..TorrentAddArgs::default()
    };

    let mut session = SessionSetArgs {
        speed_limit_up: Some(10),
        speed_limit_up_enabled: Some(true),
        script_torrent_done_enabled: Some(true),
        script_torrent_done_filename: Some("/torrent-done-script.sh".to_string()),
        ..SessionSetArgs::default()
    };

    if limit != "" {
        let num_limit: i32 = limit.parse().expect("SPEED_LIMIT_DOWN");
        session.speed_limit_down_enabled = Some(true);
        session.speed_limit_down = Some(num_limit);
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
                    println!("{:?}", err);
                }
            }
            println!("yay");
        }
        Err(err) => {
            println!("{:?}", err);
        }
    }
    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

// async fn folders() -> Response {
//     let media_library = env::var("MEDIA_LIBRARY").unwrap_or("~/media".to_string());
//     let resolved_media_library = media_library.resolve().to_str().unwrap().to_string();
//     println!("{}", &resolved_media_library);
//     let entities_result = tokio::fs::read_dir(&resolved_media_library).await;
//     match entities_result {
//         Err(err) => println!("{:?}", err),
//         Ok(mut entities) => {
//             let mut folders = vec![];
//             while let Some(entity) = entities.next_entry().await.unwrap() {
//                 if let Ok(file_type) = entity.file_type().await {
//                     if file_type.is_dir() == true {
//                         folders.push(entity.file_name().into_string().unwrap());
//                     }
//                     println!("{:?}, {:?}", entity.path(), file_type.is_dir());
//                 }
//             }
//         }
//     }
//     StatusCode::INTERNAL_SERVER_ERROR.into_response()
// }

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
