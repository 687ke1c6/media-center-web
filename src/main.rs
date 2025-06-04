use axum::{
    extract::ws::{WebSocket, WebSocketUpgrade},
    extract::Extension,
    response::Response,
    routing::any,
    Router,
};
use clap::Parser;
use libs::transmission::torrent_get;
use models::{
    args::Args, axum_state::AxumState, prowlarr_config::ProwlarrConfig, rpc::RpcResponseProxy,
};
use serde_json::Value;
use tokio::{net::TcpListener, sync::broadcast::Sender};
use tower_http::services::ServeDir;

mod routes;
use routes::api_route::api_route;
use std::fs;
mod libs;
mod models;
use tokio::sync::broadcast;
use anyhow::Result;

#[cfg(debug_assertions)]
const PATH_TO_CONFIG: &'static str = "./media-center-web-ui/dist";

#[cfg(not(debug_assertions))]
const PATH_TO_CONFIG: &'static str = "./www";

#[tokio::main]
async fn main() -> Result<()> {
    dotenv_flow::dotenv_flow().ok();

    let args = Args::parse();
    println!("Media Center Web");
    dbg!(&args);

    let prowlarr_config_path = format!(
        "{}{}{}",
        &args.media_library, &args.prowlarr_config_path, "/config.xml"
    );
    let xml_content = fs::read_to_string(&prowlarr_config_path)
        .expect(format!("Could not read config file: {}", prowlarr_config_path).as_str());

    let config = ProwlarrConfig::from_string(&xml_content)?;
    let (tx, _rx) = broadcast::channel(100);
    let cloned_tx = tx.clone();

    let state = AxumState::new(args, config);

    let cloned_state = state.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
            if cloned_tx.receiver_count() == 1 {
                continue;
            }

            match torrent_get(&cloned_state).await {
                Ok(response) => {
                    let response = RpcResponseProxy::from_original(&response);
                    let value = serde_json::json!(response);
                    cloned_tx
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

    let app = Router::new()
        .route("/ws", any(handler))
        .layer(Extension(tx.clone()))
        .nest("/api", api_route(state.clone()))
        .fallback_service(ServeDir::new(PATH_TO_CONFIG));

    // run our app with hyper, listening globally on port 3000
    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn handler(ws: WebSocketUpgrade, Extension(tx): Extension<Sender<Value>>) -> Response {
    println!("WebSocket connection established");
    ws.on_upgrade(move |socket| handle_socket(socket, tx.clone()))
}

async fn handle_socket(mut socket: WebSocket, tx: Sender<Value>) {
    println!("WebSocket connection upgraded");
    let mut rx = tx.subscribe();

    loop {
        tokio::select! {
            msg = rx.recv() => {
                match msg {
                    Ok(msg) => {
                        println!("Broadcast message received: {}", msg);
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
