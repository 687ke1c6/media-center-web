use clap::Parser;

/// Media Center Web
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[derive(Clone)]
pub struct Args {
    /// Torrent Api Url
    #[arg(short, long, default_value="some_url", env)]
    pub torrent_api_url: String,
    /// Torrent Api Url
    #[arg(long, default_value="127.0.0.1", env)]
    pub transmission_ipv4: String,
    /// Torrent Api Url
    #[arg(long, default_value="127.0.0.1:9050", env)]
    pub tor_proxy_addr: String,
    /// Torrent Api Url
    #[arg(short, long, default_value="/media", env)]
    pub media_library: String,
    /// Torrent Api Url
    #[arg(short, long, env)]
    pub debug_search_response: Option<String>,
    /// Download speed limit kbps
    #[arg(short, long, env)]
    pub speed_limit_down: Option<i32>,
    /// Remove torrent after complete
    #[arg(short('f'), long, env)]
    pub script_torrent_done_filename: Option<String>
}
