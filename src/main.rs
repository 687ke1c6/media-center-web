use axum::Router;
use clap::Parser;
use models::args::Args;
use std::error::Error;
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

mod routes;
use routes::api_route::api_route;
mod models;

#[cfg(debug_assertions)]
const PATH_TO_CONFIG: &'static str = "./media-center-web-ui/dist";

#[cfg(not(debug_assertions))]
const PATH_TO_CONFIG: &'static str = "./www";

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenvy::dotenv().ok();

    let args = Args::parse();
    println!("Media Center Web");
    dbg!(&args);

    // build our application with a single route
    let app = Router::new()
        .nest("/api", api_route(args))
        .fallback_service(ServeDir::new(PATH_TO_CONFIG));

    // run our app with hyper, listening globally on port 3000
    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
