use crate::Args;
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::post,
    Json, Router,
};
use reqwest::{Client, RequestBuilder};
use transmission_rpc::{
    types::{SessionSetArgs, TorrentAddArgs},
    TransClient,
};

pub fn api_route(args: Args) -> Router {
    Router::new()
        .route("/search", post(search))
        .route("/remote", post(remote))
        .route("/torrent-add", post(add))
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
    let torrent_api_url = option_env!("TORRENT_API_URL").unwrap_or(&args.torrent_api_url);
    let url = format!(
        "{}{}",
        torrent_api_url,
        json["search_term"].as_str().unwrap()
    );

    let proxy = reqwest::Proxy::all("socks5h://127.0.0.1:9050").unwrap();
    let http_client = reqwest::Client::builder().proxy(proxy).build().unwrap();
    println!("GET: {}", url);
    let response_result = http_client.get(url).send().await;

    if let Ok(response) = response_result {
        let text = response.json::<serde_json::Value>().await;
        if let Ok(json) = text {
            return Json(json).into_response();
        }
    }

    StatusCode::INTERNAL_SERVER_ERROR.into_response()
}

async fn add(Json(json): Json<serde_json::Value>) -> Response {
    println!("{:?}", json);
    let mut client = TransClient::new("http://127.0.0.1:9091/transmission/rpc".parse().unwrap());

    let magnet_url = format!("magnet:?xt=urn:btih:{}", &json["info_hash"].as_str().unwrap());
    println!("{}", magnet_url);

    let add = TorrentAddArgs {
        filename: Some(magnet_url),
        ..TorrentAddArgs::default()
    };
    let session = SessionSetArgs {
        download_dir: Some("/media/Shows".to_string()),
        speed_limit_up: Some(5),
        ..SessionSetArgs::default()
    };
    let response = client.torrent_add(add).await;
    match response {
        Ok(_res) => {
            let session_response = client.session_set(session).await;
            match session_response {
                Ok(_) => println!("yay"),
                Err(_) => println!("no"),
            }
            println!("yay");
        }
        Err(_err) => println!("no"),
    }
    StatusCode::OK.into_response()
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
