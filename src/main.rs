use axum::{
    extract::{ws::WebSocketUpgrade, State}, routing::any, Router
};
use clap::Parser;
use models::{
    args::Args, axum_state::AxumState,
};
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

mod routes;
use routes::api_route::api_route;
use std::sync::Arc;
mod libs;
mod models;
use anyhow::Result;

use crate::libs::torrent_ws::TorrentWebSocket;

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

    println!("Media Library Path: {}", args.media_library);

    let state = Arc::new(AxumState::new(args.clone(), TorrentWebSocket::new(args.clone())));

    let app = Router::new()
        .route("/ws", any(async |upgrade: WebSocketUpgrade, State(state): State<Arc<AxumState>>| {
            dbg!("accepting WebSocket connection");
            state.torrent_websocket.clone()
                .handle_websocket_upgrade(upgrade)
        }))
        .route("/health", any(|| async { axum::http::StatusCode::OK }))
        .nest("/api", api_route(state.clone()))
        .with_state(state.clone())
        .fallback_service(ServeDir::new(PATH_TO_CONFIG));

    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
