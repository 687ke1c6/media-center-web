use axum::Router;
use clap::Parser;
use models::{args::Args, axum_state::AxumState, prowlarr_config::ProwlarrConfig};
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

mod routes;
use routes::api_route::api_route;
use std::{error::Error, fs};
mod models;

#[cfg(debug_assertions)]
const PATH_TO_CONFIG: &'static str = "./media-center-web-ui/dist";

#[cfg(not(debug_assertions))]
const PATH_TO_CONFIG: &'static str = "./www";

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv_flow::dotenv_flow().ok();

    let args = Args::parse();
    println!("Media Center Web");
    dbg!(&args);

    let prowlarr_config_path = format!(
        "{}{}{}",
        &args.media_library,
        std::env::var("PROWLARR_CONFIG_PATH").unwrap_or_else(|_| "/config/prowlarr".to_string()),
        "/config.xml"
    );
    let xml_content = fs::read_to_string(&prowlarr_config_path).expect(format!("Could not read config file: {}", prowlarr_config_path).as_str());
    
    let config = ProwlarrConfig::from_string(&xml_content)?;

    // build our application with a single route
    let app = Router::new()
        .nest("/api", api_route(AxumState::new(args, config)))
        .fallback_service(ServeDir::new(PATH_TO_CONFIG));

    // run our app with hyper, listening globally on port 3000
    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
